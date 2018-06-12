alias ll='ls -l'
alias la='ls -la'
alias code="open -a 'Visual Studio Code'"
alias tfa="source ~/src/TensorFlow/bin/activate"
alias gitbranchdel="git branch --merged master | grep -vE '^\*|master$|develop$' | xargs -I % git branch -d %"
export GOPATH="$HOME/go"
export PATH="$GOPATH/bin:$PATH"
export CLICOLOR=1
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pipenv --completion)"