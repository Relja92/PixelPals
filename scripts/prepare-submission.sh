#!/bin/bash
# Prepare clean submission for Chrome Web Store

set -e

SUBMISSION_DIR="submission"
BUILD_DIR="build"

echo "📦 Preparing submission package..."

# Create clean submission directory
rm -rf "$SUBMISSION_DIR"
mkdir -p "$SUBMISSION_DIR"

# Copy only what Chrome Web Store needs
echo "  ✓ Copying manifest..."
cp "$BUILD_DIR/manifest.json" "$SUBMISSION_DIR/"

echo "  ✓ Copying UI files..."
mkdir -p "$SUBMISSION_DIR/ui"
cp "$BUILD_DIR/ui/popup.html" "$SUBMISSION_DIR/ui/"
cp "$BUILD_DIR/ui/popup.css" "$SUBMISSION_DIR/ui/"
cp "$BUILD_DIR/ui/popup-standalone.js" "$SUBMISSION_DIR/ui/"

echo "  ✓ Copying content script..."
mkdir -p "$SUBMISSION_DIR/content"
cp "$BUILD_DIR/content/content-script-standalone.js" "$SUBMISSION_DIR/content/"

echo "  ✓ Copying service worker..."
mkdir -p "$SUBMISSION_DIR/background"
cp "$BUILD_DIR/background/service-worker.js" "$SUBMISSION_DIR/background/"

echo "  ✓ Copying assets..."
if [ -d "$BUILD_DIR/assets" ]; then
  cp -r "$BUILD_DIR/assets" "$SUBMISSION_DIR/"
fi

echo ""
echo "✅ Submission package ready at: ./$SUBMISSION_DIR"
echo ""
echo "📊 Size comparison:"
du -sh "$SUBMISSION_DIR" "$BUILD_DIR"
echo ""
echo "📝 Files in submission:"
find "$SUBMISSION_DIR" -type f | wc -l
echo ""
echo "🚀 To submit to Chrome Web Store:"
echo "   zip -r PixelPals.zip submission/"
