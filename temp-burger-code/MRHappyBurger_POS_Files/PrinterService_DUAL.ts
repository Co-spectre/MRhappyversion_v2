/**
 * SAM4S HCUBE-102W Printer Service with Dual Connection Support
 * Supports both WiFi and Ethernet connections with automatic failover
 */

import net from 'net';

interface PrinterConfig {
  name: string;
  ip: string;
  port: number;
}

class PrinterService {
  // Dual connection configuration
  private printerConfigs: PrinterConfig[] = [
    { name: 'WiFi', ip: '192.168.5.XXX', port: 9100 },      // Replace with WiFi IP
    { name: 'Ethernet', ip: '192.168.5.YYY', port: 9100 }   // Replace with Ethernet IP
  ];
  
  private currentConfig: PrinterConfig | null = null;
  private connectionTimeout = 5000;
  private retryAttempts = 3;

  /**
   * Find available printer connection
   */
  private async findAvailablePrinter(): Promise<PrinterConfig | null> {
    console.log('🔍 Searching for available printer connections...');
    
    for (const config of this.printerConfigs) {
      try {
        const isAvailable = await this.testConnection(config);
        if (isAvailable) {
          console.log(`✅ Found printer on ${config.name}: ${config.ip}:${config.port}`);
          this.currentConfig = config;
          return config;
        }
      } catch (error) {
        console.log(`❌ ${config.name} (${config.ip}) not available`);
      }
    }
    
    return null;
  }

  /**
   * Test connection to specific printer configuration
   */
  private testConnection(config: PrinterConfig): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(this.connectionTimeout);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.connect(config.port, config.ip);
    });
  }

  /**
   * Send data to printer with automatic failover
   */
  private async sendToPrinter(data: Buffer): Promise<boolean> {
    // Try current connection first
    if (this.currentConfig) {
      const success = await this.attemptPrint(this.currentConfig, data);
      if (success) return true;
    }
    
    // Find new available printer
    const availablePrinter = await this.findAvailablePrinter();
    if (!availablePrinter) {
      throw new Error('No printer connections available');
    }
    
    // Attempt print with found printer
    return await this.attemptPrint(availablePrinter, data);
  }

  /**
   * Attempt to print with specific configuration
   */
  private attemptPrint(config: PrinterConfig, data: Buffer): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      
      socket.setTimeout(this.connectionTimeout);
      
      socket.on('connect', () => {
        console.log(`📡 Connected to printer via ${config.name}`);
        socket.write(data);
        socket.end();
      });
      
      socket.on('close', () => {
        console.log(`✅ Print job sent via ${config.name}`);
        resolve(true);
      });
      
      socket.on('error', (error) => {
        console.error(`❌ Print error via ${config.name}:`, error.message);
        resolve(false);
      });
      
      socket.on('timeout', () => {
        console.error(`⏰ Print timeout via ${config.name}`);
        socket.destroy();
        resolve(false);
      });
      
      socket.connect(config.port, config.ip);
    });
  }

  /**
   * ESC/POS Commands for HCUBE-102W
   */
  private createESCPOSCommands(content: string): Buffer {
    const ESC = '\x1B';
    const commands = [
      ESC + '@',           // Initialize printer
      ESC + 'a' + '\x01',  // Center alignment
      ESC + '!' + '\x18',  // Double height & width
      'MR HAPPY BURGER\n',
      ESC + '!' + '\x00',  // Normal text
      ESC + 'a' + '\x00',  // Left alignment
      '================================\n',
      content,
      '\n================================\n',
      ESC + 'a' + '\x01',  // Center alignment
      'Thank you for your order!\n',
      'Visit us again soon!\n',
      '\n\n\n',
      '\x1D' + 'V' + '\x42' + '\x00'  // Cut paper
    ];
    
    return Buffer.from(commands.join(''), 'utf8');
  }

  /**
   * Format order for printing
   */
  private formatOrderReceipt(order: any): string {
    const lines = [
      `Date: ${new Date().toLocaleString()}`,
      `Order #: ${order.id || 'N/A'}`,
      '',
      'ITEMS:',
      '--------------------------------'
    ];
    
    let total = 0;
    order.items?.forEach((item: any, index: number) => {
      lines.push(`${index + 1}. ${item.name}`);
      if (item.price) {
        lines.push(`   $${item.price.toFixed(2)}`);
        total += item.price;
      }
      if (item.customizations?.length) {
        item.customizations.forEach((custom: string) => {
          lines.push(`   + ${custom}`);
        });
      }
      lines.push('');
    });
    
    lines.push('--------------------------------');
    lines.push(`TOTAL: $${total.toFixed(2)}`);
    
    return lines.join('\n');
  }

  /**
   * Print order receipt
   */
  async printOrder(order: any): Promise<void> {
    try {
      console.log('🖨️ Printing order receipt...');
      
      const receiptContent = this.formatOrderReceipt(order);
      const printData = this.createESCPOSCommands(receiptContent);
      
      const success = await this.sendToPrinter(printData);
      
      if (success) {
        console.log('✅ Order receipt printed successfully');
      } else {
        throw new Error('Failed to print order receipt');
      }
    } catch (error) {
      console.error('❌ Print error:', error);
      throw error;
    }
  }

  /**
   * Print test receipt
   */
  async printTest(): Promise<void> {
    try {
      console.log('🧪 Printing test receipt...');
      
      const testContent = [
        'CONNECTION TEST',
        '',
        'Printer: SAM4S HCUBE-102W',
        'Paper: 80mm Thermal',
        `Time: ${new Date().toLocaleString()}`,
        '',
        'If you can read this,',
        'the printer is working correctly!',
        '',
        `Connection: ${this.currentConfig?.name || 'Auto-detected'}`
      ].join('\n');
      
      const printData = this.createESCPOSCommands(testContent);
      const success = await this.sendToPrinter(printData);
      
      if (success) {
        console.log('✅ Test receipt printed successfully');
      } else {
        throw new Error('Failed to print test receipt');
      }
    } catch (error) {
      console.error('❌ Test print error:', error);
      throw error;
    }
  }

  /**
   * Get printer status
   */
  async getStatus(): Promise<{ connected: boolean; activeConnection: string | null }> {
    const availablePrinter = await this.findAvailablePrinter();
    return {
      connected: availablePrinter !== null,
      activeConnection: availablePrinter?.name || null
    };
  }
}

export default new PrinterService();
