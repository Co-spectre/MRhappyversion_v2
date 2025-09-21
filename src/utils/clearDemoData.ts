// Utility to clear all order data from localStorage for a fresh start
export const clearAllOrderData = () => {
  try {
    // Clear main order storage keys
    localStorage.removeItem('adminOrders');
    localStorage.removeItem('mr-happy-orders');
    
    // Clear all notification data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('notifications-') || 
          key.includes('demo') || 
          key.includes('test') ||
          key.includes('Order') || 
          key.includes('order')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All order data cleared successfully for fresh start');
    return true;
  } catch (error) {
    console.error('Error clearing order data:', error);
    return false;
  }
};

// Legacy function name for backwards compatibility
export const clearDemoData = clearAllOrderData;

// Function to be called once to reset the admin panel
export const resetAdminPanel = () => {
  clearDemoData();
  window.location.reload();
};