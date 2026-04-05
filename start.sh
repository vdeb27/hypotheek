#!/bin/bash

# Hypotheek Calculator - Start Script
# Navigeer naar de app folder en start de development server

cd "$(dirname "$0")/app"

echo "========================================"
echo "  Hypotheek Calculator"
echo "========================================"
echo ""
echo "Starting development server..."
echo ""
echo "Open de calculator in je browser:"
echo "  http://localhost:5173"
echo ""
echo "De pagina wordt automatisch ververst bij wijzigingen."
echo ""
echo "Druk op Ctrl+C om de server te stoppen."
echo ""
echo "========================================"
echo ""

npm run dev
