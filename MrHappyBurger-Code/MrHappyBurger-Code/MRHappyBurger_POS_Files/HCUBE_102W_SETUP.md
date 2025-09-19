# SAM4S HCUBE-102W Printer Setup Guide

## Model: SAM4S HCUBE-102W
- **Type**: Thermal Receipt Printer
- **Connection**: WiFi / Ethernet / USB
- **Paper Width**: 80mm (3.15 inches)
- **Print Speed**: Up to 250mm/sec
- **Interface**: Ethernet, WiFi, USB, Serial

## Network Configuration Steps:

### 1. Connect HCUBE-102W to Network
1. Press and hold the FEED button while powering on
2. Release when the STATUS LED blinks
3. Print network configuration page
4. Note the IP address assigned to the printer

### 2. Configure in Code
Update the IP address in `PrinterService.ts`:
```typescript
export const printerService = new SAM4SPrinterService({
  printerName: 'SAM4S_HCUBE_102W',
  connectionType: 'ethernet',
  ip: '192.168.1.100', // Replace with your printer's actual IP
  port: 9100,
  paperWidth: 80
});
```

### 3. Test Connection
- Use the printer test button in the Admin Dashboard
- Check that receipts print correctly
- Verify all order details appear properly

## Troubleshooting:
- **No Response**: Check IP address and network connectivity
- **Partial Printing**: Verify paper is loaded correctly
- **Formatting Issues**: Ensure 80mm paper width setting

## ESC/POS Commands Used:
- ESC @ (Initialize printer)
- ESC a (Set alignment)
- GS ! (Set character size)
- GS V (Cut paper)

The printer will automatically receive and print order receipts when customers place orders.
