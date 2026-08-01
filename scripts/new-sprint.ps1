[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^\d{2,3}$')]
  [string]$Id,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$Title
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$templatePath = Join-Path $repoRoot 'ai/sprints/templates/SPRINT-TEMPLATE.md'
$safeTitle = ($Title.ToUpperInvariant() -replace '[^A-Z0-9]+', '-') -replace '(^-|-$)', ''
$targetPath = Join-Path $repoRoot "ai/sprints/SPRINT-$Id-$safeTitle.md"

if (Test-Path $targetPath) {
  throw "A sprint já existe: $targetPath"
}

$content = Get-Content -Raw $templatePath
$content = $content.Replace('{{ID}}', $Id).Replace('{{TITULO}}', $Title)
Set-Content -Path $targetPath -Value $content -NoNewline
Write-Output "Sprint criada: $targetPath"
