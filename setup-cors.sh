#!/bin/bash

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
firebase login

# Apply CORS configuration to Firebase Storage
echo "Applying CORS configuration to Firebase Storage..."
gsutil cors set cors.json gs://skillpay-f62df.appspot.com

echo "CORS configuration applied successfully!"
echo "You may need to wait a few minutes for the changes to take effect." 