#!/bin/bash

# Opis commita jako pierwszy argument
commit_message="$1"

# Upewnij się, że opis commita jest podany
if [ -z "$commit_message" ]; then
  echo "Użycie: $0 \"opis commita\""
  exit 1
fi

# Ustawienia
remote_repo="https://github.com/Hicior/Calendesk.git"
branch_name="main"  # Zamień 'main' na odpowiednią nazwę gałęzi

# Wykonaj komendy git
git add .
git commit -m "$commit_message"
git push "$remote_repo" "$branch_name"