[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('explore', 'research', 'review', 'test-plan', 'frontend-design', 'frontend-implement', 'implement', 'debug', 'security', 'architecture', 'sprint-plan')]
  [string]$Task,

  [Parameter(Mandatory = $true)]
  [string]$Prompt,

  [ValidateSet('codex')]
  [string]$Provider,

  [string]$Model,

  [switch]$Run
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$routing = Get-Content -Raw (Join-Path $repoRoot 'ai/routing.json') | ConvertFrom-Json
$route = $routing.tasks.PSObject.Properties[$Task].Value

if (-not $route) { throw "Rota não encontrada para a tarefa '$Task'." }
if ($Provider) { $route.provider = $Provider }

$modelsPath = Join-Path $repoRoot 'ai/models.local.json'
if (-not (Test-Path $modelsPath)) { $modelsPath = Join-Path $repoRoot 'ai/models.example.json' }
$models = Get-Content -Raw $modelsPath | ConvertFrom-Json

if (-not $Model) {
  $providerModels = $models.PSObject.Properties[$route.provider].Value
  $configuredModel = $providerModels.PSObject.Properties[$route.modelProfile].Value
  if ($configuredModel) { $Model = [string]$configuredModel }
}

$basePrompt = Get-Content -Raw (Join-Path $repoRoot 'ai/BASE_PROMPT.md')
$fullPrompt = @"
$basePrompt

## Rota atual
Tarefa: $Task
Objetivo da rota: $($route.description)
Modo obrigatório: $($route.mode)

## Pedido
$Prompt
"@

$preview = [PSCustomObject]@{
  provider = $route.provider
  model = if ($Model) { $Model } else { '(padrão configurado no CLI)' }
  mode = $route.mode
  task = $Task
  run = [bool]$Run
}

if (-not $Run) {
  $preview | Format-List
  Write-Host "Prévia apenas: acrescente -Run para consumir tokens."
  return
}

Push-Location $repoRoot
try {
  if ($route.provider -eq 'codex') {
    $arguments = @('exec', '-C', $repoRoot, '--sandbox', $route.mode)
    if ($Model) { $arguments += @('--model', $Model) }
    $arguments += $fullPrompt
    & codex @arguments
  } else {
    throw "Provedor não suportado: $($route.provider)"
  }
} finally {
  Pop-Location
}
