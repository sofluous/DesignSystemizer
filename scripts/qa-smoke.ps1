$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $repoRoot "index.html"
$jsRoot = Join-Path $repoRoot "js"
$wikiRoot = Join-Path $repoRoot "wiki"

$failures = New-Object System.Collections.Generic.List[string]
$notes = New-Object System.Collections.Generic.List[string]

function Add-Failure {
  param([string]$Message)
  $script:failures.Add($Message)
}

function Add-Note {
  param([string]$Message)
  $script:notes.Add($Message)
}

function Test-PathOrFail {
  param(
    [string]$Path,
    [string]$Label
  )
  if (-not (Test-Path -LiteralPath $Path)) {
    Add-Failure "$Label missing: $Path"
    return $false
  }
  return $true
}

if (-not (Test-PathOrFail -Path $indexPath -Label "Studio index")) {
  throw "Smoke pass cannot continue without index.html"
}

$indexHtml = Get-Content $indexPath -Raw

$scriptMatches = [regex]::Matches($indexHtml, '<script\s+src="\./js/([^"]+)"')
$scriptFiles = $scriptMatches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

foreach ($scriptFile in $scriptFiles) {
  [void](Test-PathOrFail -Path (Join-Path $jsRoot $scriptFile) -Label "Referenced JS file")
}
Add-Note ("Checked {0} referenced JS files." -f $scriptFiles.Count)

$wikiMatches = [regex]::Matches($indexHtml, 'data-doc="([^"]+)"')
$wikiDocs = $wikiMatches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

foreach ($doc in $wikiDocs) {
  $resolvedPath =
    if ($doc.StartsWith("../")) {
      Join-Path $wikiRoot $doc
    } elseif ($doc.Contains("/")) {
      Join-Path $repoRoot $doc
    } else {
      Join-Path $wikiRoot $doc
    }
  [void](Test-PathOrFail -Path $resolvedPath -Label "Referenced wiki/doc target")
}
Add-Note ("Checked {0} referenced wiki/doc targets." -f $wikiDocs.Count)

$moduleExpectations = @(
  @{ File = "studio-shell.js"; Pattern = "DesignSystemStudioShell"; Label = "Shell export" },
  @{ File = "studio-bootstrap.js"; Pattern = "DesignSystemStudioBootstrap"; Label = "Bootstrap export" },
  @{ File = "studio-builder-config.js"; Pattern = "DesignSystemStudioBuilderConfig"; Label = "Builder config export" },
  @{ File = "studio-builder-theme-data.js"; Pattern = "DesignSystemStudioBuilderThemeData"; Label = "Builder theme data export" },
  @{ File = "studio-builder-setup.js"; Pattern = "DesignSystemStudioBuilderSetup"; Label = "Builder setup export" },
  @{ File = "studio-builder-bootstrap.js"; Pattern = "DesignSystemStudioBuilderBootstrap"; Label = "Builder bootstrap export" },
  @{ File = "studio-page-bootstrap.js"; Pattern = "DesignSystemStudioPageBootstrap"; Label = "Page bootstrap export" },
  @{ File = "studio-builder-controls.js"; Pattern = "DesignSystemStudioBuilderControls"; Label = "Builder controls export" },
  @{ File = "studio-builder-presets.js"; Pattern = "DesignSystemStudioBuilderPresets"; Label = "Builder presets export" },
  @{ File = "studio-builder-renderer.js"; Pattern = "DesignSystemStudioBuilderRenderer"; Label = "Builder renderer export" },
  @{ File = "studio-components.js"; Pattern = "DesignSystemStudioComponents"; Label = "Components export" },
  @{ File = "studio-icons.js"; Pattern = "DesignSystemStudioIcons"; Label = "Icons export" },
  @{ File = "studio-wiki.js"; Pattern = "DesignSystemStudioWiki"; Label = "Wiki export" }
)

foreach ($expectation in $moduleExpectations) {
  $filePath = Join-Path $jsRoot $expectation.File
  if (-not (Test-PathOrFail -Path $filePath -Label $expectation.Label)) {
    continue
  }

  $fileText = Get-Content $filePath -Raw
  if ($fileText -notmatch $expectation.Pattern) {
    Add-Failure ("{0} not found in {1}" -f $expectation.Label, $expectation.File)
  }
}
Add-Note ("Checked {0} module export contracts." -f $moduleExpectations.Count)

if ($indexHtml -notmatch 'initStudioBootstrap\(') {
  if ($indexHtml -notmatch 'initStudioPageBootstrap\(') {
    Add-Failure "Studio/page bootstrap handoff missing from index.html"
  }
}

if ($indexHtml -notmatch 'initStudioPageBootstrap\(') {
  Add-Failure "Page bootstrap handoff missing from index.html"
}

$pageBootstrapPath = Join-Path $jsRoot "studio-page-bootstrap.js"
if (Test-Path -LiteralPath $pageBootstrapPath) {
  $pageBootstrapText = Get-Content $pageBootstrapPath -Raw
  if ($pageBootstrapText -notmatch 'initBuilderBootstrap\(') {
    Add-Failure "Builder bootstrap handoff missing from studio-page-bootstrap.js"
  }
}

if ($failures.Count -gt 0) {
  Write-Host "Design System smoke check failed." -ForegroundColor Red
  $failures | ForEach-Object { Write-Host ("- " + $_) -ForegroundColor Red }
  exit 1
}

Write-Host "Design System smoke check passed." -ForegroundColor Green
$notes | ForEach-Object { Write-Host ("- " + $_) }
exit 0
