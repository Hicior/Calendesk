# auto_commit.ps1

# Znajdź ścieżkę obecnego katalogu
$currentDirectory = (Get-Location).Path

# Przejdź do katalogu projektu
Set-Location -Path $currentDirectory

# Opis commita jako pierwszy argument
param (
    [string]$commitMessage = "Automatyczny commit"
)

# Wykonaj komendy git
git add .
git commit -m $commitMessage
git pull https://github.com/Hicior/Calendesk.git main
git push https://github.com/Hicior/Calendesk.git main