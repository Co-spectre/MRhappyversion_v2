# 🖨️ Mr Happy Burger - POS Printer Integration Files

## 📁 Files Included:

### Core Printer Service
- **`PrinterService.ts`** - Main printer service for SAM4S HCUBE-102W
  - ESC/POS command generation
  - Network connection testing
  - Receipt formatting for 80mm thermal paper
  - Error handling and retry logic

- **`PrinterService.ts.backup`** - Backup copy of printer service

### Components
- **`PrinterTestButton.tsx`** - React component for testing printer
  - Admin dashboard integration
  - Test receipt printing
  - Connection diagnostics

### Context Integration
- **`OrderContext.tsx`** - Order management with auto-printing
  - Automatically prints receipt after order creation
  - Integrates with PrinterService
  - Error handling for failed prints

### Documentation
- **`HCUBE_102W_SETUP.md`** - Setup guide for HCUBE-102W printer
  - Network configuration steps
  - Troubleshooting tips
  - WiFi and Ethernet setup

## 🔧 Setup Instructions:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Printer IP:**
   - Update `PrinterService.ts` line with your printer's IP address
   - Default: `192.168.1.100` (change to your actual IP)

3. **Integration:**
   - Copy `PrinterService.ts` to your `src/services/` folder
   - Copy `PrinterTestButton.tsx` to your `src/components/` folder
   - Update your `OrderContext.tsx` with the auto-print functionality
   - Add PrinterTestButton to your admin dashboard

4. **Network Setup:**
   - Follow `HCUBE_102W_SETUP.md` for printer network configuration
   - Ensure printer is connected to same network as your app

## 📋 Hardware Requirements:
- SAM4S HCUBE-102W Thermal Printer
- 80mm thermal paper (3.15 inches)
- Network connection (WiFi or Ethernet)

## 🎯 Features:
- ✅ Automatic receipt printing after order
- ✅ Manual test printing from admin panel
- ✅ Network connection testing
- ✅ ESC/POS command formatting
- ✅ Error handling and retry logic
- ✅ 80mm thermal paper optimized formatting

Created: September 19, 2025
For: Mr Happy Burger POS Integration
