$ErrorActionPreference = "Stop"

$ProjectDirectory = $PSScriptRoot
$NodeDirectory = "C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
$NodeExecutable = Join-Path $NodeDirectory "node.exe"
$PnpmExecutable = (Get-Command pnpm.cmd -ErrorAction Stop).Source
$LogDirectory = Join-Path $ProjectDirectory ".preview-logs"

$ExistingListener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($ExistingListener) {
    exit 0
}

if (-not (Test-Path -LiteralPath $NodeExecutable) -or -not (Test-Path -LiteralPath $PnpmExecutable)) {
    exit 1
}

New-Item -ItemType Directory -Force -Path $LogDirectory | Out-Null
$env:PATH = "$NodeDirectory;$env:PATH"

Start-Process `
    -FilePath $PnpmExecutable `
    -ArgumentList "exec vinext dev" `
    -WorkingDirectory $ProjectDirectory `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $LogDirectory "preview-output.log") `
    -RedirectStandardError (Join-Path $LogDirectory "preview-error.log")
