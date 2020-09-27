#!/bin/bash

set -eu
set -o pipefail

if [ "$CODEBUILD_WEBHOOK_TRIGGER" = "branch/main" ]; then
  deploy_stage="production"
else
  deploy_stage="staging"
fi

echo "Deploy to ${deploy_stage}"
yarn deploy --stage "$deploy_stage"
