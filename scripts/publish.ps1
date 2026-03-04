param(
  [string]$CommitMessage = "chore: publish"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$null = git rev-parse --is-inside-work-tree

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
  Write-Host "No changes to commit. Skipping commit step."
} else {
  git add -A
  git commit -m $CommitMessage
}

$branch = (git branch --show-current).Trim()
if ([string]::IsNullOrWhiteSpace($branch)) {
  throw "Unable to determine current git branch."
}

git push origin $branch

$soundPath = "C:\Home\Jim\System\sounds\gotthis.wav"
if (Test-Path $soundPath) {
  $player = New-Object System.Media.SoundPlayer $soundPath
  $player.PlaySync()
} else {
  Write-Warning "Publish finished, but sound file not found: $soundPath"
}
