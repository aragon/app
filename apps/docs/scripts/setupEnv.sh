#!/bin/bash

# Exit if a command exits with a non-zero status
set -e

ENV=$1

SOURCE_ENV_FILE=./config/.env.$ENV
TARGET_ENV_FILE=.env.local

# Copy environment variables into TARGET_ENV_FILE
if [[ "$ENV" =~ ^(development|staging|production|local|preview)$ ]]
then
    echo "Setup ENV: using $ENV environment"
    cp $SOURCE_ENV_FILE $TARGET_ENV_FILE
else
    echo "Setup ENV: '$ENV' is not a valid environment"
    exit 1
fi
