(async function () {
    'use strict';

    // Current instancing strategy
    // A single node.js process is started
    // For each endpoint a vireo instance is eagerly created with the via for the instance
    // Each endpoint has a resource pool with a single vireo instance
    // Requests to a specific endpoint are blocked based on the single vireo instance pool
    // The top-level VI is enqueued when an endpoint is run. The VI is not rebooted so state persists between executions of an endpoint per endpoint.
    // The ReferenceManager is shared across all instances so need to be careful about references shared between instances (none yet?)
    const path = require('path');
    const process = require('process');
    const express = require('express');
    const glob = require('glob');
    const fs = require('fs');
    const {performance} = require('perf_hooks');
    const xhr2 = require('xhr2');
    const genericPool = require('generic-pool');
    const cheerio = require('cheerio');

    const cwd = process.cwd();
    console.log(`Current Working Directory: ${cwd}`);

    const root = path.resolve(cwd, '../../').toString();
    console.log(`Web Application Root: ${root}`);

    const vireoHelpers = require(path.resolve(root, 'ni-webvi-resource-v0/node_modules/vireo/dist/wasm32-unknown-emscripten/release/vireo.min.js'));

    class RefnumManager {
        constructor () {
            this._nextRefnum = 1;
            this.refnums = new Map();
        }

        createRefnum (obj) {
            const refnum = this._nextRefnum;
            this._nextRefnum += 1;
            this.refnums.set(refnum, obj);
            return refnum;
        }

        getObject (refnum) {
            return this.refnums.get(refnum);
        }

        closeRefnum (refnum) {
            this.refnums.delete(refnum);
        }
    }
    const refnumManager = new RefnumManager();

    const writeJSONResponse = function (refnum, jsonResponse) {
        const {res} = refnumManager.getObject(refnum);
        res.json(JSON.parse(jsonResponse));
    };

    global.WebVIExpress = {writeJSONResponse};

    const createVireoConfigPromise = function (viaWithEnqueue) {
        return (async function () {
            const enqueueRegex = /^enqueue\s*\((\S*)\)$/m;
            const via = viaWithEnqueue.replace(enqueueRegex, '');
            const viName = viaWithEnqueue.match(enqueueRegex)[1];
            const vireo = await vireoHelpers.createInstance();
            vireo.httpClient.setXMLHttpRequestImplementation(xhr2);
            const notSupportedError = () => {
                throw new Error('Unsupported on this target');
            };
            vireo.javaScriptInvoke.registerInternalFunctions({
                ControlReference_GetControlObject: notSupportedError,
                PropertyNode_PropertyRead: notSupportedError,
                PropertyNode_PropertyWrite: notSupportedError,
                OneButtonDialog: notSupportedError,
                TwoButtonDialog: notSupportedError,
                LogLabVIEWError: function (ignoreReturnValueRef, statusValueRef, codeValueRef, sourceValueRef) {
                    const code = vireo.eggShell.readDouble(codeValueRef);
                    const source = vireo.eggShell.readString(sourceValueRef);
                    throw new Error(`LabVIEW error ${code} occured at ${source === '' ? 'unknown location' : source}`);
                },
                InvokeControlFunction: notSupportedError
            });
            vireo.eggShell.loadVia(via);
            const serverValueRef = vireo.eggShell.findValueRef(viName, 'dataItem_Server');
            const enqueue = function () {
                vireo.eggShell.loadVia(`enqueue(${viName})`);
            };
            const vireoConfig = {
                vireo,
                serverValueRef,
                enqueue
            };
            return vireoConfig;
        }());
    };

    console.log('Searching for routes...');
    const viaPaths = glob.sync('**/server.*.via.txt', {cwd: root});
    const endpointConfigs = viaPaths.map(function (viaPath) {
        const viaPathRegex = /(.*)server\.(.+)\.via\.txt/;
        const route = '/' + viaPath.match(viaPathRegex)[1];
        const method = viaPath.match(viaPathRegex)[2];
        const viaWithEnqueue = fs.readFileSync(path.resolve(root, viaPath), 'utf8');
        const vireoConfigPromise = createVireoConfigPromise(viaWithEnqueue);
        return {method, route, viaPath, vireoConfigPromise};
    });
    console.log('Discovered Routes:');
    endpointConfigs.forEach(endpointConfig => console.log(`${endpointConfig.route} - ${endpointConfig.method}`));

    console.log('Searching for node dependencies...');
    const htmlPaths = glob.sync('**/server.*.html', {cwd: root});
    const dependencyPathSet = new Set();
    htmlPaths.forEach(function (htmlPath) {
        const resolvedHtmlPath = path.resolve(root, htmlPath);
        const resolvedHtmlDir = path.dirname(resolvedHtmlPath);
        const endpointHTML = fs.readFileSync(resolvedHtmlPath, 'utf8');
        const $$ = cheerio.load(endpointHTML);
        const rawDependencyPaths = [];
        $$('script[webvi-express-require]').each(function (index, element) {
            rawDependencyPaths.push($$(element).attr('src'));
        });
        const dependencyPaths = rawDependencyPaths.map((rawDependencyPath) => path.resolve(resolvedHtmlDir, rawDependencyPath));
        dependencyPaths.forEach((dependencyPath) => dependencyPathSet.add(dependencyPath));
    });

    console.log('Discovered node dependencies:');
    for (let dependencyPath of dependencyPathSet) {
        console.log(dependencyPath);
    }

    console.log('Loading node dependencies:');
    for (let dependencyPath of dependencyPathSet) {
        require(dependencyPath);
    }
    console.log('Finished loading node dependencies');

    console.log('Initializing route runtime instances');
    await Promise.all(endpointConfigs.map(endpointConfig => endpointConfig.vireoConfigPromise));
    console.log('Finished initializing route runtime instances');

    const createVireoMiddleware = function (endpointConfig) {
        const {vireoConfigPromise} = endpointConfig;
        const pool = genericPool.createPool(
            {create: () => vireoConfigPromise, destroy: () => undefined},
            {max: 1, min: 1}
        );
        const runWebVI = async function (req, res) {
            // TODO listen for req.on('close') to cancel the current vireo execution. Need to figure out a cleanup strategy in that case.
            const start = performance.now();
            const vireoConfigPromise = await pool.acquire();
            const refnum = refnumManager.createRefnum({req, res});
            const vireoConfig = await vireoConfigPromise;
            const {vireo, serverValueRef, enqueue} = vireoConfig;
            try {
                // enqueue needs to be called before writing to memory? seems to reset values if after..
                enqueue();
                vireo.eggShell.writeDouble(serverValueRef, refnum);
                await vireo.eggShell.executeSlicesUntilClumpsFinished();
            } catch (ex) {
                console.error(ex);
            } finally {
                refnumManager.closeRefnum(refnum);
                await pool.release(vireoConfigPromise);
                console.log(`Request ${refnum} took ${performance.now() - start}ms`);
            }
        };
        return runWebVI;
    };
    console.log('Configuring express');
    const app = express();
    app.use(express.static(root));

    console.log('Configuring express vireo middleware');
    endpointConfigs.forEach(function (endpointConfig) {
        const {method, route} = endpointConfig;
        app[method](route, createVireoMiddleware(endpointConfig));
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}()).catch(function (ex) {
    'use strict';
    console.error(ex);
});
