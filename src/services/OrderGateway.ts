// Gateway service for real-time communication between admin and users
import { Order } from '../types';
import { Notification } from '../context/NotificationContext';

export class OrderNotificationGateway {
  private static instance: OrderNotificationGateway;
  private listeners: Map<string, (notification: Notification) => void> = new Map();
  private orderStorage: Map<string, Order> = new Map();

  private constructor() {
    // Load existing orders from localStorage
    this.loadOrdersFromStorage();
    
    // Set up storage change listener for cross-tab communication
    window.addEventListener('storage', (e) => {
      if (e.key === 'mr-happy-orders' && e.newValue) {
        this.loadOrdersFromStorage();
      }
    });
  }

  public static getInstance(): OrderNotificationGateway {
    if (!OrderNotificationGateway.instance) {
      OrderNotificationGateway.instance = new OrderNotificationGateway();
    }
    return OrderNotificationGateway.instance;
  }

  private loadOrdersFromStorage() {
    try {
      const orders = JSON.parse(localStorage.getItem('mr-happy-orders') || '[]') as Order[];
      orders.forEach(order => {
        this.orderStorage.set(order.id, order);
      });
    } catch (error) {
      console.error('Error loading orders from storage:', error);
    }
  }

  private saveOrdersToStorage() {
    try {
      const orders = Array.from(this.orderStorage.values());
      localStorage.setItem('mr-happy-orders', JSON.stringify(orders));
      
      // Trigger storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'mr-happy-orders',
        newValue: JSON.stringify(orders),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error saving orders to storage:', error);
    }
  }

  // Register a notification listener (typically the user's notification context)
  public registerListener(userId: string, callback: (notification: Notification) => void) {
    this.listeners.set(userId, callback);
  }

  // Unregister a notification listener
  public unregisterListener(userId: string) {
    this.listeners.delete(userId);
  }

  // Add a new order to the system
  public addOrder(order: Order) {
    this.orderStorage.set(order.id, order);
    this.saveOrdersToStorage();
    
    // Only notify about order placement, no automatic progression
    this.sendNotificationToUser(order.userId, {
      type: 'info',
      title: 'Order Placed Successfully!',
      message: `Your order ${order.id} has been placed and is awaiting admin confirmation. We'll notify you once it's confirmed.`,
      duration: 8000,
      orderId: order.id,
    });

    // Remove automatic progression - orders now require admin approval
    // this.simulateOrderProgression(order);
  }

  // Update order status and notify user
  public updateOrderStatus(orderId: string, newStatus: Order['status'], adminTriggered = false) {
    const order = this.orderStorage.get(orderId);
    if (!order) {
      console.error(`Order ${orderId} not found`);
      return;
    }

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      updatedAt: new Date(),
    };

    this.orderStorage.set(orderId, updatedOrder);
    this.saveOrdersToStorage();

    // Send notification to user based on status
    this.sendStatusNotification(updatedOrder, adminTriggered);
  }

  private sendStatusNotification(order: Order, adminTriggered: boolean) {
    const statusMessages: Partial<Record<Order['status'], any>> = {
      confirmed: {
        title: 'Order Confirmed by Admin!',
        message: `Great news! Your order ${order.id} has been confirmed by our admin team and we're getting it ready for you.`,
        type: 'success' as const,
      },
      preparing: {
        title: 'Order Being Prepared',
        message: `Your order ${order.id} is now being prepared in our kitchen. We'll let you know when it's ready!`,
        type: 'info' as const,
      },
      ready: {
        title: 'Order Ready for Pickup!',
        message: `Your order ${order.id} is ready! Please come to ${order.pickupLocation || 'our restaurant'} to pick it up.`,
        type: 'success' as const,
        duration: 0, // Persistent notification
        persistent: true,
      },
      completed: {
        title: 'Order Completed',
        message: `Thank you for picking up your order ${order.id}! We hope you enjoy your meal!`,
        type: 'success' as const,
      },
      cancelled: {
        title: 'Order Cancelled',
        message: `Your order ${order.id} has been cancelled by admin. If you have any questions, please contact us.`,
        type: 'warning' as const,
      },
    };

    const notification = statusMessages[order.status];
    if (notification) {
      // Only send notification if status was changed by admin or is automated (like preparing->ready)
      const shouldNotify = adminTriggered || ['ready', 'completed'].includes(order.status);
      
      if (shouldNotify) {
        this.sendNotificationToUser(order.userId, {
          ...notification,
          orderId: order.id,
        });
      }
    }
  }

  private sendNotificationToUser(userId: string, notification: Omit<Notification, 'id' | 'createdAt'>) {
    const callback = this.listeners.get(userId);
    if (callback) {
      callback({
        ...notification,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      });
    }

    // Also store in localStorage for persistence
    try {
      const existingNotifications = JSON.parse(localStorage.getItem(`notifications-${userId}`) || '[]');
      const newNotification = {
        ...notification,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      existingNotifications.unshift(newNotification);
      
      // Keep only last 50 notifications
      if (existingNotifications.length > 50) {
        existingNotifications.splice(50);
      }
      
      localStorage.setItem(`notifications-${userId}`, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  // Get all orders for admin panel
  public getAllOrders(): Order[] {
    return Array.from(this.orderStorage.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Get orders for specific user
  public getUserOrders(userId: string): Order[] {
    return Array.from(this.orderStorage.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get order by ID
  public getOrder(orderId: string): Order | undefined {
    return this.orderStorage.get(orderId);
  }

  // Clear all orders - for admin fresh start
  public clearAllOrders(): void {
    this.orderStorage.clear();
    this.saveOrdersToStorage();
    console.log('All orders cleared from OrderGateway');
  }
}

// Export singleton instance
export const orderGateway = OrderNotificationGateway.getInstance();
