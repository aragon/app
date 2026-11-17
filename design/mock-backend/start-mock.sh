#!/bin/bash
# Starts the mock backend (port 4100) in the background; requests logged to mock-requests.log
cd "$(dirname "$0")"
nohup node mock-server.cjs 4100 > mock-server.log 2>&1 &
echo "mock pid $!"
