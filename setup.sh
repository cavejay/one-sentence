# Script to install dependencies for app.js

sudo apt-get install libreadline-dev libconfig-dev libssl-dev lua5.2 liblua5.2-dev libevent-dev libjansson-dev libpython-dev make
git clone --recursive https://github.com/vysheng/tg.git && cd tg
git checkout tags/1.3.1
./configure
make
cd ..
npm install .