param(
  [ValidateSet("task-complete", "needs-input")]
  [string]$Category = "task-complete"
)

$sharedScript = "C:\Home\Projects\Code\Codex\Scripts\play-sound.ps1"
if (Test-Path $sharedScript) {
  & $sharedScript $Category
  return
}

$fallbackDir = Join-Path (Join-Path $PSScriptRoot "..\sounds") $Category
if (-not (Test-Path $fallbackDir)) {
  return
}

$wavFiles = Get-ChildItem -Path $fallbackDir -Filter "*.wav" -File -ErrorAction SilentlyContinue
if (-not $wavFiles) {
  return
}

$selected = $wavFiles | Get-Random
(New-Object System.Media.SoundPlayer $selected.FullName).PlaySync()
