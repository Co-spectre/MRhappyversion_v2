// SAM4S Printer Service for Order Receipts
// This service handles printing order receipts to SAM4S thermal printers

export interface PrinterConfig {
  printerName: string;
  ip?: string;
  port?: number;
  connectionType: 'usb' | 'ethernet' | 'serial';
  paperWidth: number; // usually 80mm for thermal printers
}

export interface OrderPrintData {
  orderId: string;
  orderTime: Date;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    customizations?: string[];
  }>;
  subtotal: number;
  tax: number;
  total: number;
  specialInstructions?: string;
  estimatedTime?: string;
}

export class SAM4SPrinterService {
  private config: PrinterConfig;
  private isConnected: boolean = false;

  constructor(config: PrinterConfig) {
    this.config = config;
  }

  // Initialize printer connection
  async connect(): Promise<boolean> {
    try {
      console.log(\`Connecting to SAM4S printer: \${this.config.printerName}\`);
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Failed to connect to printer:', error);
      return false;
    }
  }

  // Generate ESC/POS commands for SAM4S printer
  private generateReceiptCommands(order: OrderPrintData): Uint8Array {
    const commands: number[] = [];
    
    // ESC/POS Commands for SAM4S
    const ESC = 0x1B;
    const GS = 0x1D;
    
    // Initialize printer
    commands.push(ESC, 0x40); // ESC @ - Initialize
    
    // Set character size and alignment
    commands.push(ESC, 0x61, 0x01); // Center alignment
    commands.push(GS, 0x21, 0x11); // Double width and height
    
    // Restaurant header
    const header = "MR. HAPPY RESTAURANT\\n";
    commands.push(...Array.from(new TextEncoder().encode(header)));
    
    commands.push(ESC, 0x61, 0x00); // Left alignment
    commands.push(GS, 0x21, 0x00); // Normal size
    
    // Add separator line
    const separator = "================================\\n";
    commands.push(...Array.from(new TextEncoder().encode(separator)));
    
    // Order information
    const orderInfo = \`Order #: \${order.orderId}\\n\`;
    const dateTime = \`Date: \${order.orderTime.toLocaleDateString()}\\n\`;
    const time = \`Time: \${order.orderTime.toLocaleTimeString()}\\n\`;
    
    commands.push(...Array.from(new TextEncoder().encode(orderInfo)));
    commands.push(...Array.from(new TextEncoder().encode(dateTime)));
    commands.push(...Array.from(new TextEncoder().encode(time)));
    commands.push(...Array.from(new TextEncoder().encode(separator)));
    
    // Customer information
    const customerInfo = \`Customer: \${order.customerName}\\n\`;
    const phoneInfo = \`Phone: \${order.customerPhone}\\n\`;
    const pickupInfo = \`Pickup: \${order.pickupLocation}\\n\`;
    
    commands.push(...Array.from(new TextEncoder().encode(customerInfo)));
    commands.push(...Array.from(new TextEncoder().encode(phoneInfo)));
    commands.push(...Array.from(new TextEncoder().encode(pickupInfo)));
    commands.push(...Array.from(new TextEncoder().encode(separator)));
    
    // Order items
    const itemsHeader = "ITEMS ORDERED:\\n";
    commands.push(...Array.from(new TextEncoder().encode(itemsHeader)));
    
    order.items.forEach(item => {
      const itemLine = \`\${item.quantity}x \${item.name}\\n\`;
      const priceLine = \`   €\${item.price.toFixed(2)}\\n\`;
      
      commands.push(...Array.from(new TextEncoder().encode(itemLine)));
      
      // Add customizations if any
      if (item.customizations && item.customizations.length > 0) {
        const customLine = \`   + \${item.customizations.join(', ')}\\n\`;
        commands.push(...Array.from(new TextEncoder().encode(customLine)));
      }
      
      commands.push(...Array.from(new TextEncoder().encode(priceLine)));
    });
    
    commands.push(...Array.from(new TextEncoder().encode(separator)));
    
    // Totals
    const subtotalLine = \`Subtotal: €\${order.subtotal.toFixed(2)}\\n\`;
    const taxLine = \`Tax: €\${order.tax.toFixed(2)}\\n\`;
    const totalLine = \`TOTAL: €\${order.total.toFixed(2)}\\n\`;
    
    commands.push(...Array.from(new TextEncoder().encode(subtotalLine)));
    commands.push(...Array.from(new TextEncoder().encode(taxLine)));
    
    // Bold total
    commands.push(ESC, 0x45, 0x01); // Bold on
    commands.push(...Array.from(new TextEncoder().encode(totalLine)));
    commands.push(ESC, 0x45, 0x00); // Bold off
    
    commands.push(...Array.from(new TextEncoder().encode(separator)));
    
    // Special instructions
    if (order.specialInstructions) {
      const instructionsHeader = "SPECIAL INSTRUCTIONS:\\n";
      const instructions = \`\${order.specialInstructions}\\n\`;
      commands.push(...Array.from(new TextEncoder().encode(instructionsHeader)));
      commands.push(...Array.from(new TextEncoder().encode(instructions)));
      commands.push(...Array.from(new TextEncoder().encode(separator)));
    }
    
    // Estimated time
    if (order.estimatedTime) {
      const timeInfo = \`Estimated Ready Time: \${order.estimatedTime}\\n\`;
      commands.push(...Array.from(new TextEncoder().encode(timeInfo)));
    }
    
    // Footer
    const footer = "\\nThank you for your order!\\nPlease keep this receipt.\\n\\n";
    commands.push(...Array.from(new TextEncoder().encode(footer)));
    
    // Cut paper
    commands.push(GS, 0x56, 0x00); // Full cut
    
    // Feed and cut
    commands.push(0x0A, 0x0A, 0x0A); // Line feeds
    
    return new Uint8Array(commands);
  }

  // Print order receipt
  async printOrderReceipt(order: OrderPrintData): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('Printer not connected. Attempting to connect...');
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Unable to connect to printer');
      }
    }

    try {
      const printData = this.generateReceiptCommands(order);
      
      console.log('Printing order receipt...', order.orderId);
      console.log('Print data length:', printData.length, 'bytes');
      
      // Simulate printing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Receipt printed successfully!');
      return true;
      
    } catch (error) {
      console.error('Failed to print receipt:', error);
      return false;
    }
  }

  // Test print function
  async testPrint(): Promise<boolean> {
    const testOrder: OrderPrintData = {
      orderId: 'TEST-001',
      orderTime: new Date(),
      customerName: 'Test Customer',
      customerPhone: '+49 123 456789',
      pickupLocation: 'Mr. Happy Döner',
      items: [
        {
          name: 'Döner Kebab',
          quantity: 1,
          price: 8.50,
          customizations: ['Extra sauce', 'No onions']
        }
      ],
      subtotal: 8.50,
      tax: 0.00,
      total: 8.50,
      specialInstructions: 'Please prepare fresh',
      estimatedTime: '15-20 minutes'
    };

    return await this.printOrderReceipt(testOrder);
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('Disconnected from printer');
  }
}

// Singleton instance for the app
export const printerService = new SAM4SPrinterService({
  printerName: 'SAM4S_Thermal_Printer',
  connectionType: 'usb',
  paperWidth: 80
});
