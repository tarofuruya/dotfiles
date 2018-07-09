#!/bin/bash

echo "installing homebrew..."
which brew >/dev/null 2>&1 || /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

echo "run brew doctor..."
which brew >/dev/null 2>&1 && brew doctor

echo "run brew update..."
which brew >/dev/null 2>&1 && brew update

echo "ok. run brew upgrade..."

brew upgrade

formulas=(
atk
autoconf
awscli
cairo
fontconfig
freetype
fribidi
gdbm
gdk-pixbuf
gettext
git
glib
go
gobject-introspection
graphite2
gtk+
harfbuzz
heroku
heroku-node
hicolor-icon-theme
icu4c
jpeg
libffi
libpng
libtiff
libyaml
mono
node
openssl
pango
pcre
pipenv
pixman
pkg-config
pyenv
rbenv
readline
ruby
ruby-build
sphinx-doc
sqlite
swagger-codegen
xz
)

"brew tap..."
taps=(
heroku/brew
homebrew/cask
homebrew/core
)
for t in "${taps[@]}"; do
    brew tap $t
done

echo "start brew install apps..."
for formula in "${formulas[@]}"; do
    brew install $formula || brew upgrade $formula
done

casks=(
    hammerspoon
    dropbox
    evernote
    github-desktop
    google-chrome
    google-japanese-ime
    slack
    cyberduck
    visual-studio-code
)

echo "start brew cask install apps..."
for cask in "${casks[@]}"; do
    brew cask install $cask
done

brew cleanup
brew cask cleanup

cat << END

**************************************************
HOMEBREW INSTALLED! bye.
**************************************************

END
