$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$sourceTheme = Join-Path $root "theme.css"
$sourceTokens = Join-Path $root "css/tokens.css"
$sourceThemes = Join-Path $root "css/themes.css"
$sourceComponents = Join-Path $root "css/components.css"
$sourceJs = Join-Path $root "js"
$sourceIcons = Join-Path $root "icons"

$packageRoot = Join-Path $root "_package"
$bundleRoot = Join-Path $packageRoot "design-system"
$bundleJs = Join-Path $bundleRoot "js"
$bundleIcons = Join-Path $bundleRoot "icons"
$installPath = Join-Path $bundleRoot "INSTALL.md"
$themeBundlePath = Join-Path $bundleRoot "theme.css"
$versionPath = Join-Path $bundleRoot "VERSION.txt"

if (Test-Path $bundleRoot) {
  Remove-Item $bundleRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $bundleJs | Out-Null
New-Item -ItemType Directory -Force -Path $bundleIcons | Out-Null

$themeBundle = @(
  "/* Design System package bundle */"
  "/* Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz') */"
  ""
  "/* Source: css/tokens.css */"
  (Get-Content $sourceTokens -Raw)
  ""
  "/* Source: css/themes.css */"
  (Get-Content $sourceThemes -Raw)
  ""
  "/* Source: css/components.css */"
  (Get-Content $sourceComponents -Raw)
  ""
) -join "`r`n"

Set-Content -Path $themeBundlePath -Value $themeBundle -NoNewline

Copy-Item (Join-Path $sourceJs "theme-registry.js") $bundleJs -Force
Copy-Item (Join-Path $sourceJs "theme-selector.js") $bundleJs -Force
Copy-Item (Join-Path $sourceIcons "*") $bundleIcons -Force

$install = @(
  '# Design System Package'
  ''
  'This package is generated from `_DesignSystem`.'
  ''
  '## Recommended App Setup'
  '1. Delete the old app-local `design-system` folder.'
  '2. Copy this generated `design-system` folder into your app root.'
  '3. Add:'
  ''
  '```html'
  '<html data-theme="steel-night" data-ds-theme-storage="app-theme" data-ds-theme-default="steel-night">'
  '<link rel="stylesheet" href="./design-system/theme.css" />'
  '<script src="./design-system/js/theme-registry.js"></script>'
  '<script src="./design-system/js/theme-selector.js"></script>'
  '```'
  ''
  '4. Add a selector where needed:'
  ''
  '```html'
  '<select data-ds-theme-select></select>'
  '```'
  ''
  '5. No page-specific theme bootstrapping is required.'
  ''
  '## Package Contents'
  '- `theme.css`: bundled tokens + themes + components in one file'
  '- `js/theme-registry.js`'
  '- `js/theme-selector.js`'
  '- `icons/*`'
  ''
  '## Why This Package Is Safer'
  '- one folder to replace'
  '- one CSS request instead of chained imports'
  '- fewer copy mistakes than manually replacing `theme.css`, `css/`, and `js/`'
) -join "`r`n"

Set-Content -Path $installPath -Value $install -NoNewline
Set-Content -Path $versionPath -Value ("Built " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")) -NoNewline

Write-Output "Built package at: $bundleRoot"
