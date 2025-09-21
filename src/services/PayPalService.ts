export interface PayPalOrderRequest {
  amount: number;
  currency: string;
  description: string;
  customId?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: 'CREATED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  approveUrl?: string;
}

export interface PayPalPaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class PayPalService {
  private clientId: string = '';
  private isTestMode: boolean = true; // Set to false for production

  // Initialize PayPal SDK
  async initializePayPal(clientId: string): Promise<void> {
    this.clientId = clientId;
    
    return new Promise((resolve, reject) => {
      // Check if PayPal SDK is already loaded
      if (window.paypal) {
        resolve();
        return;
      }

      // Load PayPal SDK
      const script = document.createElement('script');
      const environment = this.isTestMode ? 'sandbox' : '';
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=EUR&intent=capture&locale=de_DE${environment ? '&environment=' + environment : ''}`;
      script.async = true;
      
      script.onload = () => {
        if (window.paypal) {
          resolve();
        } else {
          reject(new Error('PayPal SDK failed to load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load PayPal SDK'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Create PayPal payment
  async createPayment(orderData: PayPalOrderRequest): Promise<PayPalOrderResponse> {
    if (!window.paypal) {
      throw new Error('PayPal SDK not loaded');
    }

    return new Promise((resolve, reject) => {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: orderData.description,
              custom_id: orderData.customId,
              amount: {
                currency_code: orderData.currency,
                value: orderData.amount.toFixed(2)
              }
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              brand_name: 'Mr. Happy Restaurant',
              locale: 'de-DE',
              landing_page: 'BILLING'
            }
          });
        },
        onApprove: async (_data: any, actions: any) => {
          try {
            const order = await actions.order.capture();
            resolve({
              id: order.id,
              status: order.status,
              approveUrl: undefined
            });
          } catch (error) {
            reject(error);
          }
        },
        onError: (err: any) => {
          console.error('PayPal payment error:', err);
          reject(new Error('PayPal payment failed'));
        },
        onCancel: (_data: any) => {
          reject(new Error('PayPal payment cancelled'));
        }
      });
    });
  }

  // Process PayPal payment
  async processPayment(
    amount: number,
    description: string,
    orderId?: string
  ): Promise<PayPalPaymentResult> {
    try {
      const orderData: PayPalOrderRequest = {
        amount,
        currency: 'EUR',
        description,
        customId: orderId
      };

      const result = await this.createPayment(orderData);
      
      return {
        success: result.status === 'COMPLETED',
        transactionId: result.id
      };
    } catch (error) {
      console.error('PayPal payment processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  // Render PayPal buttons in a container
  renderPayPalButtons(
    containerId: string,
    amount: number,
    description: string,
    onSuccess: (transactionId: string) => void,
    onError: (error: string) => void,
    onCancel: () => void
  ): void {
    if (!window.paypal) {
      onError('PayPal SDK not loaded');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      onError('PayPal container not found');
      return;
    }

    // Clear existing buttons
    container.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 45
      },
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            description: description,
            amount: {
              currency_code: 'EUR',
              value: amount.toFixed(2)
            }
          }],
          application_context: {
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            brand_name: 'Mr. Happy Restaurant',
            locale: 'de-DE'
          }
        });
      },
      onApprove: async (_data: any, actions: any) => {
        try {
          const order = await actions.order.capture();
          onSuccess(order.id);
        } catch (error) {
          onError('Payment processing failed');
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        onError('Payment failed. Please try again.');
      },
      onCancel: () => {
        onCancel();
      }
    }).render(`#${containerId}`);
  }

  // Validate PayPal transaction (would typically call your backend)
  async validateTransaction(transactionId: string): Promise<boolean> {
    try {
      // This would typically make a call to your backend to validate the transaction
      // For now, we'll simulate a successful validation
      console.log('Validating PayPal transaction:', transactionId);
      
      // In a real implementation, you would:
      // 1. Call your backend API
      // 2. Your backend would verify the transaction with PayPal
      // 3. Return the validation result
      
      return true; // Simulated success
    } catch (error) {
      console.error('Transaction validation failed:', error);
      return false;
    }
  }
}

// Extend Window interface to include PayPal
declare global {
  interface Window {
    paypal?: any;
  }
}

export default new PayPalService();