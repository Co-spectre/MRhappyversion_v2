import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { InventoryItem } from '../../types';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';

export function AdminInventoryPanel() {
  const { state, updateInventoryStock } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState<number>(0);

  const filteredInventory = state.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(state.inventory.map(item => item.category))];

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'low-stock': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'out-of-stock': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'expired': return 'text-red-600 bg-red-600/10 border-red-600/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock': return <Package className="w-4 h-4" />;
      case 'low-stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out-of-stock': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleStockUpdate = (itemId: string, newStock: number) => {
    if (newStock >= 0) {
      updateInventoryStock(itemId, newStock);
    }
  };

  const handleEditStock = (item: InventoryItem) => {
    setEditingItem(item.id);
    setStockInput(item.currentStock);
  };

  const saveStockEdit = (itemId: string) => {
    handleStockUpdate(itemId, stockInput);
    setEditingItem(null);
  };

  const cancelStockEdit = () => {
    setEditingItem(null);
    setStockInput(0);
  };

  const getStockPercentage = (item: InventoryItem) => {
    return (item.currentStock / item.maxStockLevel) * 100;
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-white">{state.inventory.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-400">
                {state.inventory.filter(item => item.status === 'low-stock').length}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">
                {state.inventory.filter(item => item.status === 'out-of-stock').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-green-400">
                €{state.inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items, categories, or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-80"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">
              {filteredInventory.length} item{filteredInventory.length !== 1 ? 's' : ''}
            </span>
            <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">Item</th>
                <th className="text-left p-4 text-gray-400 font-medium">Category</th>
                <th className="text-left p-4 text-gray-400 font-medium">Stock</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Cost/Unit</th>
                <th className="text-left p-4 text-gray-400 font-medium">Supplier</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Restocked</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="p-4">
                    <div>
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.unit}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      {editingItem === item.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={stockInput}
                            onChange={(e) => setStockInput(Number(e.target.value))}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm w-20"
                            min="0"
                          />
                          <button
                            onClick={() => saveStockEdit(item.id)}
                            className="p-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelStockEdit}
                            className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{item.currentStock}</span>
                            <span className="text-gray-400 text-sm">/ {item.maxStockLevel}</span>
                            <button
                              onClick={() => handleEditStock(item)}
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              <Edit3 className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                getStockPercentage(item) > 50 
                                  ? 'bg-green-500' 
                                  : getStockPercentage(item) > 25 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(getStockPercentage(item), 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            Min: {item.minStockLevel}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-medium">€{item.costPerUnit.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{item.supplier}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{formatDate(item.lastRestocked)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStockUpdate(item.id, item.currentStock + 1)}
                        className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        title="Add Stock"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStockUpdate(item.id, Math.max(0, item.currentStock - 1))}
                        className="p-1 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                        title="Remove Stock"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Items Found</h3>
            <p className="text-gray-500">No inventory items match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
