#!/bin/bash
# SentinelTrade-AI: Automated Node-Centric Updater (V3.0)
# Designed for Cron execution on S0-Beacon (Alpine Linux)

set -e

INSTALL_PATH="/opt/sentinel"
cd $INSTALL_PATH

echo "Checking for SentinelTrade-AI updates..."

# Fetch metadata
git fetch

# Compare local HEAD with remote
LOCAL_HEAD=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse @{u})

if [ "$LOCAL_HEAD" = "$REMOTE_HEAD" ]; then
    echo "System is up to date."
    exit 0
fi

echo "New updates detected. Initializing update cycle..."

# Check for code changes (excluding docs)
DIFF_FILES=$(git diff --name-only $LOCAL_HEAD $REMOTE_HEAD)
CODE_CHANGES=false

for file in $DIFF_FILES; do
    if [[ $file != docs/* ]]; then
        CODE_CHANGES=true
        break
    fi
done

# Perform Update
git stash
git pull

if [ "$CODE_CHANGES" = true ]; then
    echo "Code changes detected. Triggering production rebuild..."
    
    # Navigate to S0-Beacon frontend
    cd S0-Beacon/frontend
    
    # Build process with memory safeguards
    npm install
    export NODE_OPTIONS=--max-old-space-size=800
    npx vite build --emptyOutDir
    
    # Cleanup and Restart
    rm -rf node_modules
    rc-service openresty restart
    echo "Rebuild complete. Services restarted."
else
    echo "Documentation only update. Skipping build process."
fi

echo "Update cycle finished successfully."
