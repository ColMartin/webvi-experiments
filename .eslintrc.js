module.exports = {
    'extends': 'eslint:recommended',
    'env': {
        'browser': true,
        'es6': true
    },
    'parserOptions': {
        'ecmaVersion': 2017
    },
    'rules': {
        'no-console': 'off',

        // Possible Errors
        'no-extra-parens': ['error', 'functions'],
        'no-unsafe-negation': 'error',

        // Best Practices
        'accessor-pairs': 'error',
        'array-callback-return': 'error',
        'block-scoped-var': 'error',
        'class-methods-use-this': 'error',
        'complexity': 'error',
        'consistent-return': 'error',
        'curly': 'error',
        'default-case': 'error',
        'dot-location': ['error', 'property'],
        'dot-notation': 'error',
        'eqeqeq': 'error',
        'guard-for-in': 'error',
        'no-alert': 'error',
        'no-caller': 'error',
        'no-div-regex': 'error',
        'no-else-return': 'error',
        'no-empty-function': 'error',
        'no-eq-null': 'error',
        'no-eval': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-label': 'error',
        'no-floating-decimal': 'error',
        'no-global-assign': 'error',
        'no-implicit-coercion': 'error',
        'no-implicit-globals': 'error',
        'no-implied-eval': 'error',
        'no-invalid-this': 'error',
        'no-iterator': 'error',
        'no-labels': 'error',
        'no-lone-blocks': 'error',
        'no-loop-func': 'error',
        'no-magic-numbers': ['error', { 'ignore': [-1, 0, 1], 'ignoreArrayIndexes': true}],
        'no-multi-spaces': 'error',
        'no-multi-str': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-new': 'error',
        'no-octal-escape': 'error',
        'no-param-reassign': 'error',
        'no-proto': 'error',
        'no-return-assign': 'error',
        'no-script-url': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-throw-literal': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-unused-expressions': 'error',
        'no-useless-call': 'error',
        'no-useless-concat': 'error',
        'no-useless-escape': 'error',
        'no-var': 'error',
        'no-void': 'error',
        'no-warning-comments': 'off',
        'no-with': 'error',
        'radix': 'error',
        'vars-on-top': 'off',
        'wrap-iife': 'error',
        'yoda': 'error',

        // Strict mode
        'strict': ['error', 'function'],

        // Variables
        'no-use-before-define': 'error',

        // Style settings
        'array-bracket-spacing': 'error',
        'block-spacing': 'error',
        'brace-style': 'error',
        'camelcase': ['error', {properties: 'never'}],
        'comma-dangle': 'error',
        'comma-spacing': 'error',
        'comma-style': 'error',
        'computed-property-spacing': 'error',
        'consistent-this': 'error',
        'eol-last': 'error',
        'func-call-spacing': 'error',
        'func-names': ['error', 'never'],
        'func-style': 'error',
        'id-blacklist': 'error',
        'id-length': ['error', { 'exceptions': ['i'] }],
        'id-match': 'error',
        'indent': 'error',
        'jsx-quotes': 'error',
        'key-spacing': 'error',
        'keyword-spacing': 'error',
        'linebreak-style': 'off',
        'lines-around-comment': 'error',
        'max-depth': 'off',
        'max-len': 'off',
        'max-lines': 'off',
        'max-nested-callbacks': 'error',
        'max-params': 'off',
        'max-statements-per-line': 'off',
        'max-statements': 'off',
        'multiline-ternary': 'error',
        'new-cap': ["error", { "properties": false }],
        'new-parens': 'error',
        'newline-after-var': 'off',
        'newline-before-return': 'off',
        'newline-per-chained-call': 'off',
        'no-array-constructor': 'error',
        'no-bitwise': 'error',
        'no-continue': 'error',
        'no-inline-comments': 'error',
        'no-lonely-if': 'error',
        'no-mixed-operators': 'error',
        'no-mixed-spaces-and-tabs': 'error',
        'no-multiple-empty-lines': 'error',
        'no-negated-condition': 'error',
        'no-nested-ternary': 'error',
        'no-new-object': 'error',
        'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
        'no-restricted-syntax': 'error',
        'no-tabs': 'error',
        'no-ternary': 'off',
        'no-trailing-spaces': 'error',
        'no-underscore-dangle': 'error',
        'no-unneeded-ternary': 'error',
        'no-whitespace-before-property': 'error',
        'object-curly-newline': ['error', { 'minProperties': 1 }],
        'object-curly-spacing': 'error',
        'object-property-newline': 'error',
        'one-var-declaration-per-line': 'error',
        'one-var': 'off',
        'operator-assignment': 'error',
        'operator-linebreak': ['error', 'after'],
        'padded-blocks': ['error', 'never'],
        'quote-props': ['error', 'consistent-as-needed'],
        'quotes': ['error', 'single'],
        'require-jsdoc': 'error',
        'semi-spacing': 'error',
        'semi': 'error',
        'sort-keys': 'off',
        'sort-vars': 'off',
        'space-before-blocks': 'error',
        'space-before-function-paren': 'error',
        'space-in-parens': 'error',
        'space-infix-ops': 'error',
        'space-unary-ops': 'error',
        'spaced-comment': 'error',
        'unicode-bom': 'error',
        'wrap-regex': 'error'
    }
};
