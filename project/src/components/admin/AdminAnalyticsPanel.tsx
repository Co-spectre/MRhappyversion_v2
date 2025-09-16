import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { OrderAnalytics } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag,
  Users,
  Calendar,
  Star,
  Package,
  RefreshCw
} from 'lucide-react';

export function AdminAnalyticsPanel() {
  const { state } = useAdmin();
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);

  useEffect(() => {
    // Calculate analytics from current order data
    const calculateAnalytics = (): OrderAnalytics => {
      const orders = state.orders;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Popular items calculation
      const itemCounts: { [key: string]: { name: string; count: number; revenue: number } } = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (itemCounts[item.menuItem.id]) {
            itemCounts[item.menuItem.id].count += item.quantity;
            itemCounts[item.menuItem.id].revenue += item.totalPrice;
          } else {
            itemCounts[item.menuItem.id] = {
              name: item.menuItem.name,
              count: item.quantity,
              revenue: item.totalPrice
            };
          }
        });
      });

      const popularItems = Object.entries(itemCounts)
        .map(([id, data]) => ({
          id,
          name: data.name,
          orderCount: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5);

      // Orders by status
      const statusCounts: { [key: string]: number } = {};
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status as any,
        count
      }));

      // Revenue by day (last 7 days)
      const today = new Date();
      const revenueByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === date.toDateString();
        });
        
        revenueByDay.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
          orderCount: dayOrders.length
        });
      }

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        popularItems,
        ordersByStatus,
        revenueByDay
      };
    };

    setAnalytics(calculateAnalytics());
  }, [state.orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'preparing': return 'bg-orange-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Mock previous period data for growth calculation
  const previousRevenue = analytics ? analytics.totalRevenue * 0.85 : 0;
  const previousOrders = analytics ? Math.floor(analytics.totalOrders * 0.9) : 0;
  const revenueGrowth = analytics ? calculateGrowth(analytics.totalRevenue, previousRevenue) : 0;
  const ordersGrowth = analytics ? calculateGrowth(analytics.totalOrders, previousOrders) : 0;

  if (!analytics) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="text-gray-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
              <div className="flex items-center space-x-1 mt-1">
                {revenueGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{analytics.totalOrders}</p>
              <div className="flex items-center space-x-1 mt-1">
                {ordersGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm ${ordersGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(ordersGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <ShoppingBag className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average Order Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analytics.averageOrderValue)}</p>
              <p className="text-gray-500 text-sm mt-1">Per order</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Inventory Items</p>
              <p className="text-2xl font-bold text-white">{state.inventory.length}</p>
              <p className="text-gray-500 text-sm mt-1">
                {state.inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length} need attention
              </p>
            </div>
            <Package className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Revenue</h3>
          <div className="space-y-3">
            {analytics.revenueByDay.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 text-sm w-16">{day.date}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-3 relative">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(5, (day.revenue / Math.max(...analytics.revenueByDay.map(d => d.revenue), 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(day.revenue)}</p>
                  <p className="text-gray-400 text-xs">{day.orderCount} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {analytics.ordersByStatus.map((statusData, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(statusData.status)}`}></div>
                  <span className="text-gray-300 capitalize">{statusData.status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStatusColor(statusData.status)}`}
                      style={{
                        width: `${(statusData.count / analytics.totalOrders) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-white font-medium w-8 text-right">{statusData.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Selling Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3 text-gray-400 font-medium">Rank</th>
                <th className="text-left p-3 text-gray-400 font-medium">Item</th>
                <th className="text-left p-3 text-gray-400 font-medium">Orders</th>
                <th className="text-left p-3 text-gray-400 font-medium">Revenue</th>
                <th className="text-left p-3 text-gray-400 font-medium">Popularity</th>
              </tr>
            </thead>
            <tbody>
              {analytics.popularItems.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {index === 0 && <Star className="w-4 h-4 text-yellow-400" />}
                      <span className="text-white font-semibold">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-white font-medium">{item.name}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-gray-300">{item.orderCount}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-green-400 font-semibold">{formatCurrency(item.revenue)}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${(item.orderCount / Math.max(...analytics.popularItems.map(i => i.orderCount))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {Math.round((item.orderCount / analytics.totalOrders) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Today's Orders</p>
              <p className="text-xl font-bold text-white">
                {analytics.revenueByDay[analytics.revenueByDay.length - 1]?.orderCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Today's Revenue</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(analytics.revenueByDay[analytics.revenueByDay.length - 1]?.revenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-gray-400 text-sm">Active Customers</p>
              <p className="text-xl font-bold text-white">{state.users.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
