#!/bin/bash
# Script to install dependencies for app.js

 if [ "$(uname)" == "Darwin" ]; then
     # Do something under Mac OS X platform
     echo "This is a MAC :D. Please have homebrew installed."
 brew install libconfig readline lua python libevent jansson
 export CFLAGS="-I/usr/local/include -I/usr/local/Cellar/readline/6.3.8/include"
 export LDFLAGS="-L/usr/local/lib -L/usr/local/Cellar/readline/6.3.8/lib"
 export CPPFLAGS="-I/usr/local/opt/openssl/include -I/usr/local/opt/readline/include"
export LDFLAGS="-L/usr/local/opt/openssl/lib -L/usr/local/opt/readline/lib"

 elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
     # Do something under Linux platform
     echo "This should be a linux system :D We're attempting to use apt-get. Please be debian based?"
sudo apt-get install libreadline-dev libconfig-dev libssl-dev lua5.2 liblua5.2-dev libevent-dev libjansson-dev libpython-dev make
 fi

git clone --recursive https://github.com/vysheng/tg.git
cd tg
git checkout tags/1.3.1
./configure
make
cd ..
npm install .
