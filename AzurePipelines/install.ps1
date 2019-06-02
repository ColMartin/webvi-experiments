. .\AzurePipelines\shared.ps1

$rootDirectory = (Get-Location).Path
Write-Host "Current directory $rootDirectory"

$nipm = 'C:\Program Files\National Instruments\NI Package Manager\nipkg.exe'
$install_NIPM = $true
if ($install_NIPM)
{
    $nipmDownloadPath = 'http://download.ni.com/support/softlib/AST/NIPM/NIPackageManager19.0.exe'
    $nipmInstaller = Join-Path -Path $rootDirectory -ChildPath 'install-nipm.exe'
    Assert-FileDoesNotExist($nipm)
    $time = (Get-Date).ToUniversalTime()
    Write-Host "Downloading NIPM from $nipmDownloadPath... UTC $time"
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($nipmDownloadPath, $nipmInstaller)
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Assert-FileExists($nipmInstaller)
    
    Assert-FileDoesNotExist($nipm)
    Write-Host "Installing NIPM..."
    Start-Process -FilePath $nipmInstaller -ArgumentList "/Q" -Wait
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Remove-Item $nipmInstaller
}

Assert-FileExists($nipm)

$install_nxg = $true
if ($install_nxg)
{
    $nxg = 'C:\Program Files\National Instruments\LabVIEW NXG 3.0\LabVIEW NXG.exe'
    Assert-FileDoesNotExist($nxg)
    
    Write-Host "Adding LabVIEW NXG feeds to NI Package Manager"
    Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-l/ni-labview-nxg-3.0.0/6.4/released'
    Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-l/ni-labview-nxg-3.0.0-rte/6.4/released'
    Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-l/ni-labview-nxg-3.0.0-web-module/6.4/released'
    Run $nipm 'update'
    
    Write-Host "Installing NI Certificates..."
    Run $nipm 'install ni-certificates --accept-eulas --assume-yes --verbose'
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    
    Write-Host "Installing LabVIEW NXG..."
    Run $nipm 'install ni-labview-nxg-3.0.0 --accept-eulas --assume-yes --verbose'
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    
    Write-Host "Installing LabVIEW NXG Web Module..."
    Run $nipm 'install ni-labview-nxg-3.0.0-web-module --accept-eulas --assume-yes --verbose'
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Assert-FileExists($nxg)
}

return
