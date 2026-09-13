$ErrorActionPreference = "Stop"
node (Join-Path $PSScriptRoot "build-package.cjs")
if ($LASTEXITCODE -ne 0) { throw "Design System package build failed." }
