$primaryDir = "C:\Home\Jim\System\sounds"
$fallbackDir = Join-Path $PSScriptRoot "..\sounds"

$wavFiles = @()
if (Test-Path $primaryDir) {
  $wavFiles = Get-ChildItem -Path $primaryDir -Filter "*.wav" -File -ErrorAction SilentlyContinue
}

if (-not $wavFiles -and (Test-Path $fallbackDir)) {
  $wavFiles = Get-ChildItem -Path $fallbackDir -Filter "*.wav" -File -ErrorAction SilentlyContinue
}

if (-not $wavFiles) {
  return
}

$selected = $wavFiles | Get-Random
(New-Object System.Media.SoundPlayer $selected.FullName).PlaySync()
