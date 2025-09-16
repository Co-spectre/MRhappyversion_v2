import React, { useState, useEffect } from 'react';
import { Shield, Users, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle, Clock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from './NotificationSystem';

interface SystemStatusProps {
  className?: string;
}

interface SystemHealth {
  authentication: 'healthy' | 'warning' | 'critical';
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  payment: 'healthy' | 'warning' | 'critical';
  email: 'healthy' | 'warning' | 'critical';
}

interface SystemMetrics {
  activeUsers: number;
  totalOrders: number;
  revenue: number;
  verificationRate: number;
  profileCompletionRate: number;
  averageOrderValue: number;
}

const SystemStatusDashboard: React.FC<SystemStatusProps> = ({ className = '' }) => {
  const { state } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    authentication: 'healthy',
    database: 'healthy',
    api: 'healthy',
    payment: 'healthy',
    email: 'healthy'
  });

  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    totalOrders: 0,
    revenue: 0,
    verificationRate: 0,
    profileCompletionRate: 0,
    averageOrderValue: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Simulate system health checks and metrics loading
  useEffect(() => {
    const loadSystemData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock system health data
        setSystemHealth({
          authentication: 'healthy',
          database: 'healthy',
          api: 'healthy',
          payment: 'warning', // Simulate a warning
          email: 'healthy'
        });

        // Mock metrics data
        setMetrics({
          activeUsers: 1247,
          totalOrders: 3892,
          revenue: 47832.50,
          verificationRate: 87.3,
          profileCompletionRate: 64.2,
          averageOrderValue: 23.45
        });

        // Show system status notification
        showSuccess(
          'System Status Updated',
          'All systems are operational. Payment gateway showing minor delays.'
        );

      } catch (error) {
        showError(
          'Status Check Failed',
          'Unable to retrieve system status. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemData();
  }, [showSuccess, showError]);

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'warning':
        return 'text-orange-400 bg-orange-900/20 border-orange-600/30';
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-600/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-800/50 rounded-xl border border-gray-700 p-8 ${className}`}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">System Status</h2>
            <p className="text-gray-400">Real-time system health and metrics</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Last updated</p>
          <p className="text-white font-medium">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* System Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(systemHealth).map(([service, status]) => (
          <div key={service} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium capitalize">{service}</h3>
              {getHealthStatusIcon(status)}
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getHealthStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-white text-3xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">+12.5%</span>
            <span className="text-gray-400">vs last week</span>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-white text-3xl font-bold">{metrics.totalOrders.toLocaleString()}</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-green-400" />
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">+8.2%</span>
            <span className="text-gray-400">vs last week</span>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-white text-3xl font-bold">{formatCurrency(metrics.revenue)}</p>
            </div>
            <Star className="w-10 h-10 text-yellow-400" />
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">+15.7%</span>
            <span className="text-gray-400">vs last week</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">User Engagement</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Email Verification Rate</span>
                <span className="text-white font-medium">{formatPercentage(metrics.verificationRate)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.verificationRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Profile Completion Rate</span>
                <span className="text-white font-medium">{formatPercentage(metrics.profileCompletionRate)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.profileCompletionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Order Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Average Order Value</span>
              <span className="text-white font-bold">{formatCurrency(metrics.averageOrderValue)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Orders Today</span>
              <span className="text-green-400 font-bold">127</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Pending Orders</span>
              <span className="text-orange-400 font-bold">23</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Status (if authenticated) */}
      {state.isAuthenticated && (
        <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl p-6 border border-red-600/30">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Your Account Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                state.user?.emailVerified ? 'bg-green-500/20' : 'bg-orange-500/20'
              }`}>
                {state.user?.emailVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                )}
              </div>
              <p className="text-gray-300 text-sm">Email Status</p>
              <p className={`font-medium ${state.user?.emailVerified ? 'text-green-400' : 'text-orange-400'}`}>
                {state.user?.emailVerified ? 'Verified' : 'Pending'}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-gray-300 text-sm">Account Type</p>
              <p className="text-blue-400 font-medium capitalize">{state.user?.role || 'Customer'}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-gray-300 text-sm">Loyalty Points</p>
              <p className="text-yellow-400 font-medium">{state.user?.loyaltyPoints || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatusDashboard;
