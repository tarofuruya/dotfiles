#!/bin/bash

# dotfiles
for f in .??*
do
    [[ "$f" == ".git" ]] && continue
    [[ "$f" == ".DS_Store" ]] && continue
    ln -snfv ~/dotfiles/$f ~/$f    
done

# VSCode
cd ~/Library/Application\ Support/Code/User/
rm settings.json
ln -s ~/dotfiles/vscode/settings.json ./settings.json
cd ~/dotfiles/vscode
bash install_extensions.sh

echo Installed!