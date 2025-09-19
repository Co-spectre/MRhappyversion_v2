# 🌐 HCUBE-102W Dual Connection Setup Guide

## 📡 Option 1: WiFi Connection (Primary)

### Current Status from Your Printer:
- **Network**: `happy burger`
- **Password**: `Muhittin54`  
- **Auth**: `WPA/WPA2-PSK`
- **Status**: `Disconnect` (needs connection)
- **MAC**: `6c:c1:47:39:5d:8b`

### WiFi Setup Steps:
1. **Enter Setup Mode:**
   - Hold **FEED** button while powering on
   - Navigate to: `Network` → `WiFi Settings`

2. **Configure Connection:**
   - Select SSID: `happy burger`
   - Enter Password: `Muhittin54`
   - **IMPORTANT**: Change DHCP from `Disable` to `Enable`
   - Save settings and restart

3. **Verify Connection:**
   - Print configuration page again
   - Should show: `WiFi Status: Connected`
   - Note the assigned IP address

## 🔌 Option 2: Ethernet Connection (Backup/Alternative)

### Ethernet Setup Steps:
1. **Physical Connection:**
   - Connect Ethernet cable from printer to your router
   - Wait 30 seconds for auto-negotiation

2. **Configure Network:**
   - Enter setup mode (Hold FEED + power on)
   - Navigate to: `Network` → `Ethernet Settings`
   - Set DHCP to `Enable`
   - Save and restart

3. **Find IP Address:**
   - Print configuration page
   - Look for `Ethernet IP` or `LAN IP`

## 🔧 Code Configuration

### Update PrinterService.ts with Multiple IPs:
```typescript
// Add both connection methods
const PRINTER_CONFIGS = [
  { name: 'WiFi', ip: '192.168.5.XXX', port: 9100 },      // Your WiFi IP
  { name: 'Ethernet', ip: '192.168.5.YYY', port: 9100 }   // Your Ethernet IP
];
```

## 📋 Network Discovery Commands

### Find Your Printer IP (Run these on your Mac):
```bash
# Scan your network
nmap -sn 192.168.5.0/24

# Check ARP table
arp -a | grep -i "6c:c1:47:39:5d"

# Test printer ports
for ip in 192.168.5.{1..254}; do
  nc -z -w 1 $ip 9100 && echo "Printer found at $ip:9100"
done
```

## 🎯 Best Practices

### Priority Order:
1. **Try WiFi first** (more flexible)
2. **Fall back to Ethernet** (more reliable)
3. **Auto-detect in code** (smart failover)

### Testing Both:
1. Connect WiFi, get IP, test printing
2. Connect Ethernet cable as backup
3. Update code with both IPs
4. Test failover functionality

