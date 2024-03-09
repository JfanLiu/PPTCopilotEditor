#!/bin/bash
# npm install
chmod 777 node_modules
python3 env.py $SERVER_IP

npm run serve -- --port 7777
