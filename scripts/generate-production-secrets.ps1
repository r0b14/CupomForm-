param(
  [ValidateRange(32, 128)]
  [int]$Bytes = 48
)

$generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()

function New-Secret {
  $buffer = New-Object byte[] $Bytes
  $generator.GetBytes($buffer)
  return [Convert]::ToBase64String($buffer)
}

try {
  Write-Output "N8N_SHARED_SECRET=$(New-Secret)"
  Write-Output "INTERNAL_CALLBACK_SECRET=$(New-Secret)"
  Write-Output "N8N_ENCRYPTION_KEY=$(New-Secret)"
} finally {
  $generator.Dispose()
}
