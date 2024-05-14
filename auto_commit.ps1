# auto_commit.ps1

# Ustawienia
$currentDirectory = (Get-Location).Path
Set-Location -Path $currentDirectory

# Opis commita jako pierwszy argument
param (
    [string]$commitMessage = "Automatyczny commit"
)

# Upewnij się, że opis commita jest podany
if (-not $commitMessage) {
    Write-Output "Użycie: .\auto_commit.ps1 <opis commita>"
    exit 1
}

# Wykonaj komendy git
git add .
git commit -m $commitMessage

# Synchronizuj zmiany ze zdalnym repozytorium
git pull origin main --no-edit  # Opcja --no-edit pomija otwieranie edytora tekstu

# Jeśli są konflikty, rozwiązujemy je automatycznie i kontynuujemy
git add .
git commit -m "Rozwiązano konflikty podczas merge"

# Pushuj zmiany
git push https://github.com/Hicior/Calendesk.git main