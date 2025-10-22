import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Order } from '../../types';
import { clearAllOrderData } from '../../utils/clearDemoData';
import { orderGateway } from '../../services/OrderGateway';
import { 
  Clock, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  FileText,
  Download,
  Calendar,
  Trash2
} from 'lucide-react';

export function AdminOrdersPanel() {
  const { state, dispatch, updateOrderStatus, getFilteredOrders } = useAdmin();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const filteredOrders = getFilteredOrders();

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'confirmed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'preparing': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'ready': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'completed': return 'text-green-600 bg-green-600/10 border-green-600/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <RefreshCw className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    // Also update localStorage for persistence
    const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const updatedOrders = existingOrders.map((order: Order) => 
      order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
    );
    localStorage.setItem('adminOrders', JSON.stringify(updatedOrders));
  };

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('adminOrders');
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      orders.forEach((order: Order) => {
        dispatch({ type: 'ADD_ORDER', payload: order });
      });
    }
  }, [dispatch]);

  // Demo order functionality removed for production

  const handleClearAllOrders = () => {
    if (window.confirm('⚠️ ACHTUNG: Sind Sie sicher, dass Sie ALLE Bestellungen löschen möchten?\n\nDies wird alle aktuellen und vergangenen Bestellungen dauerhaft entfernen und kann NICHT rückgängig gemacht werden.\n\nKlicken Sie "OK" nur, wenn Sie einen kompletten Neuanfang wollen.')) {
      clearAllOrderData();
      
      // Also clear the admin context state
      dispatch({ type: 'CLEAR_ALL_ORDERS' });
      
      // Clear OrderGateway instance data
      orderGateway.clearAllOrders();
      
      // Show success message and reload
      alert('✅ Alle Bestellungen wurden erfolgreich gelöscht!\n\nDie Seite wird jetzt neu geladen für einen frischen Start.');
      window.location.reload();
    }
  };

  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Type', 'Date', 'Phone'];
    const csvData = filteredOrders.map(order => [
      order.id,
      order.customerInfo.name,
      order.items.map(item => `${item.menuItem.name} (${item.quantity}x)`).join('; '),
      `€${order.total.toFixed(2)}`,
      order.status,
      order.orderType,
      formatDate(order.createdAt),
      order.customerInfo.phone
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOrderStats = () => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter(o => o.status === 'pending').length;
    const preparing = filteredOrders.filter(o => o.status === 'preparing').length;
    const completed = filteredOrders.filter(o => o.status === 'completed').length;
    const totalRevenue = filteredOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);

    return { total, pending, preparing, completed, totalRevenue };
  };

  const stats = getOrderStats();

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Bestellstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gesamte Bestellungen</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Wartend</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">In Zubereitung</p>
              <p className="text-2xl font-bold text-orange-400">{stats.preparing}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Abgeschlossen</p>
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gesamtumsatz</p>
              <p className="text-2xl font-bold text-green-400">€{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-green-400 text-2xl font-bold">€</div>
          </div>
        </div>
      </div>

      {/* Aktionsschaltflächen */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportOrdersCSV}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>CSV Exportieren</span>
        </button>

        <button
          onClick={handleClearAllOrders}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors border-2 border-red-500"
        >
          <Trash2 className="w-4 h-4" />
          <span>🗑️ ALLE Bestellungen Löschen</span>
        </button>
        
        <div className="flex items-center space-x-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Zuletzt aktualisiert: {formatTime(new Date())}</span>
        </div>
      </div>

      {/* Filter und Suche */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Suche nach Bestellnummer, Kundenname oder Telefon..."
                value={state.filters.searchTerm}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { searchTerm: e.target.value } })}
                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-80"
              />
            </div>
            
            <select
              value={state.filters.orderStatus}
              onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { orderStatus: e.target.value } })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Alle Bestellungen</option>
              <option value="pending">Wartend</option>
              <option value="confirmed">Bestätigt</option>
              <option value="preparing">In Zubereitung</option>
              <option value="ready">Bereit</option>
              <option value="completed">Abgeschlossen</option>
              <option value="cancelled">Storniert</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">
              {filteredOrders.length} Bestellung{filteredOrders.length !== 1 ? 'en' : ''}
            </span>
            <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Orders Found</h3>
            <p className="text-gray-500">No orders match your current filters.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white truncate">{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-xs">Order Type</p>
                          <p className="text-white text-sm font-medium capitalize">{order.orderType}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-xs">Kunde</span>
                        <div>
                          <p className="text-white text-sm font-medium">{order.customerInfo.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-xs">Telefon</p>
                          <p className="text-white text-sm">{order.customerInfo.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-xs">Gesamt</span>
                        <div>
                          <p className="text-green-400 text-lg font-bold">€{order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address Preview */}
                    {order.orderType === 'delivery' && order.deliveryAddress && (
                      <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs mb-1">Lieferadresse</p>
                            <p className="text-white text-sm truncate">{order.deliveryAddress.street}</p>
                            <p className="text-gray-300 text-sm">{order.deliveryAddress.zipCode} {order.deliveryAddress.city}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs mb-2">Artikel ({order.items.length})</p>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span className="text-gray-400">€{item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-gray-500 text-xs">+{order.items.length - 2} weitere Artikel...</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:ml-4 mt-4 lg:mt-0">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                      className="w-full lg:w-auto p-3 lg:p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center lg:justify-start space-x-2"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm lg:hidden">Details anzeigen</span>
                    </button>
                  </div>
                </div>

                {/* Status Actions */}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="text-gray-400 text-sm flex-shrink-0">Status aktualisieren:</span>
                      <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Bestätigen</span>
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Stornieren</span>
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Zubereitung starten</span>
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'ready')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Bereit markieren</span>
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Abschließen</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bestelldetails Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Bestelldetails</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Bestellnummer</p>
                    <p className="text-white font-medium">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Bestellzeit</p>
                    <p className="text-white">{formatDate(selectedOrder.createdAt)} um {formatTime(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Geschätzte Zeit</p>
                    <p className="text-white">{selectedOrder.estimatedTime || 'N/A'}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Kundeninformationen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white">{selectedOrder.customerInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Telefon</p>
                      <p className="text-white">{selectedOrder.customerInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">{selectedOrder.customerInfo.email}</p>
                    </div>
                  </div>
                  
                  {/* Delivery Address */}
                  {selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-400 text-sm mb-1">Lieferadresse</p>
                          <p className="text-white font-medium">
                            {selectedOrder.deliveryAddress.street}
                          </p>
                          <p className="text-white">
                            {selectedOrder.deliveryAddress.zipCode} {selectedOrder.deliveryAddress.city}
                          </p>
                          {selectedOrder.deliveryAddress.notes && (
                            <p className="text-gray-400 text-sm mt-2 italic">
                              Notizen: {selectedOrder.deliveryAddress.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Bestellartikel</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={item.menuItem.image} 
                            alt={item.menuItem.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-white font-medium">{item.menuItem.name}</h4>
                                <p className="text-gray-400 text-sm">Anzahl: {item.quantity}</p>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-white font-semibold">€{item.totalPrice.toFixed(2)}</p>
                                <p className="text-gray-400 text-sm">€{item.menuItem.basePrice.toFixed(2)} pro Stück</p>
                              </div>
                            </div>
                            
                            {/* Customizations */}
                            {item.customizations && item.customizations.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-700">
                                <p className="text-gray-400 text-sm font-semibold mb-3">Anpassungen:</p>
                                <div className="space-y-2">
                                  {item.customizations.map((custom, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-base">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-green-400 text-lg font-bold">+</span>
                                        <span className="text-white font-medium">{custom.name || custom.ingredientId}</span>
                                      </div>
                                      {custom.price > 0 && (
                                        <span className="text-orange-400 font-semibold">+€{custom.price.toFixed(2)}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {item.specialInstructions && (
                              <div className="mt-2 pt-2 border-t border-gray-700">
                                <p className="text-yellow-400 text-sm">
                                  <span className="font-medium">Notiz:</span> {item.specialInstructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Bestellübersicht</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zwischensumme</span>
                      <span className="text-white">€{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-white">Gesamt</span>
                        <span className="text-green-400">€{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.specialInstructions && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                    <h3 className="text-yellow-400 font-semibold mb-2">Besondere Anweisungen</h3>
                    <p className="text-yellow-300">{selectedOrder.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
