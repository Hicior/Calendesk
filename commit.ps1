# Parametry muszą być na początku skryptu
param (
    [string]$commitMessage = "Automatyczny commit"
)

# Ustawienia
$currentDirectory = (Get-Location).Path
Set-Location -Path $currentDirectory

# Upewnij się, że opis commita jest podany
if (-not $commitMessage) {
    Write-Output "Użycie: .\auto_commit.ps1 <opis commita>"
    exit 1
}

# Dodaj zmiany do strefy staging
git add .

# Sprawdź status, aby upewnić się, że zmiany zostały dodane
Write-Output "Status po git add:"
git status

# Wykonaj commit
git commit -m "$commitMessage"

# Synchronizuj zmiany ze zdalnym repozytorium
git pull origin main --no-edit  # Opcja --no-edit pomija otwieranie edytora tekstu

# Jeśli są konflikty, rozwiązujemy je automatycznie i kontynuujemy
if ($LASTEXITCODE -ne 0) {
    Write-Output "Wystąpiły konflikty. Rozwiązywanie konfliktów..."
    git add .
    git commit -m "Rozwiązano konflikty podczas merge"
}

# Pushuj zmiany
git push https://github.com/Hicior/Calendesk.git main