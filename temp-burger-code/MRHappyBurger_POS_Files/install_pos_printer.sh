#!/bin/bash
# 🖨️ Mr Happy Burger - POS Printer Installation Script

echo "🍔 Installing Mr Happy Burger POS Printer Integration..."

# Check if we're in a React project
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in a React project directory"
    echo "Please run this script from your project root folder"
    exit 1
fi

# Create directories if they don't exist
mkdir -p src/services
mkdir -p src/components
mkdir -p src/context

# Copy the files
echo "📁 Copying printer service..."
cp PrinterService.ts src/services/

echo "📁 Copying test button component..."
cp PrinterTestButton.tsx src/components/

echo "📁 Copying context with auto-print..."
cp OrderContext.tsx src/context/

echo "📋 Copying documentation..."
cp HCUBE_102W_SETUP.md ./

echo ""
echo "✅ Installation complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Update PrinterService.ts with your printer's IP address"
echo "2. Import PrinterTestButton in your admin dashboard"
echo "3. Follow HCUBE_102W_SETUP.md for network configuration"
echo "4. Test printing from admin panel"
echo ""
echo "📋 Your printer IP should replace '192.168.1.100' in PrinterService.ts"
