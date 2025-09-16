import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AuthUser } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Star,
  Edit3,
  MoreVertical,
  Shield,
  Crown,
  Download,
  UserCheck,
  Award,
  Activity
} from 'lucide-react';

export function AdminUsersPanel() {
  const { state } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [users, setUsers] = useState<AuthUser[]>([]);

  // Mock users data for demonstration
  const mockUsers: AuthUser[] = [
    {
      id: 'user-1',
      email: 'john.doe@email.com',
      name: 'John Doe',
      phone: '+49 123 456789',
      addresses: [
        {
          id: 'addr-1',
          name: 'Home',
          street: 'Hauptstraße 123',
          city: 'Bremen',
          state: 'Bremen',
          zipCode: '28195',
          isDefault: true,
        }
      ],
      favoriteItems: ['burger-1', 'burger-2'],
      loyaltyPoints: 150,
      createdAt: new Date('2025-01-15'),
      role: 'customer',
    },
    {
      id: 'user-2',
      email: 'maria.garcia@email.com',
      name: 'Maria Garcia',
      phone: '+49 987 654321',
      addresses: [
        {
          id: 'addr-2',
          name: 'Work',
          street: 'Arbeitsstraße 456',
          city: 'Hamburg',
          state: 'Hamburg',
          zipCode: '20095',
          isDefault: true,
        }
      ],
      favoriteItems: ['kebab-1', 'drink-1'],
      loyaltyPoints: 320,
      createdAt: new Date('2025-01-10'),
      role: 'customer',
    },
    {
      id: 'user-3',
      email: 'admin@restaurant.com',
      name: 'Admin User',
      phone: '+49 555 123456',
      addresses: [],
      favoriteItems: [],
      loyaltyPoints: 0,
      createdAt: new Date('2024-12-01'),
      role: 'admin',
    },
  ];

  // Load users from localStorage and merge with mock data
  useEffect(() => {
    const savedUsers = localStorage.getItem('adminUsers');
    const localUsers = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Merge mock users with saved users, avoiding duplicates
    const allUsers = [...mockUsers];
    localUsers.forEach((localUser: AuthUser) => {
      if (!allUsers.find(u => u.id === localUser.id)) {
        allUsers.push(localUser);
      }
    });
    
    setUsers(allUsers);
    
    // Save merged data back to localStorage
    localStorage.setItem('adminUsers', JSON.stringify(allUsers));
  }, []);

  const createDemoUser = () => {
    const demoUser: AuthUser = {
      id: `user-${Date.now()}`,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      name: `Demo User ${Math.floor(Math.random() * 1000)}`,
      phone: `+49 ${Math.floor(Math.random() * 900000000) + 100000000}`,
      addresses: [
        {
          id: `addr-${Date.now()}`,
          name: 'Home',
          street: `Demostraße ${Math.floor(Math.random() * 100) + 1}`,
          city: 'Berlin',
          state: 'Berlin',
          zipCode: `1${Math.floor(Math.random() * 9000) + 1000}`,
          isDefault: true,
        }
      ],
      favoriteItems: [],
      loyaltyPoints: Math.floor(Math.random() * 500),
      createdAt: new Date(),
      role: 'customer',
    };

    const updatedUsers = [...users, demoUser];
    setUsers(updatedUsers);
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
  };

  const exportUsersCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Loyalty Points', 'Created Date', 'Addresses'];
    const csvData = filteredUsers.map(user => [
      user.id,
      user.name,
      user.email,
      user.phone || 'N/A',
      user.role || 'customer',
      user.loyaltyPoints,
      formatDate(user.createdAt),
      user.addresses.length > 0 ? user.addresses[0].street + ', ' + user.addresses[0].city : 'No address'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUserStats = () => {
    const total = users.length;
    const customers = users.filter(u => u.role === 'customer').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const managers = users.filter(u => u.role === 'manager').length;
    const totalLoyaltyPoints = users.reduce((sum, user) => sum + user.loyaltyPoints, 0);
    const avgLoyaltyPoints = total > 0 ? Math.round(totalLoyaltyPoints / total) : 0;

    return { total, customers, admins, managers, totalLoyaltyPoints, avgLoyaltyPoints };
  };

  const stats = getUserStats();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'manager': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'customer': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'manager': return <Shield className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Customers</p>
              <p className="text-2xl font-bold text-blue-400">{stats.customers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Admins</p>
              <p className="text-2xl font-bold text-red-400">{stats.admins}</p>
            </div>
            <Crown className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Managers</p>
              <p className="text-2xl font-bold text-purple-400">{stats.managers}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Loyalty</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.totalLoyaltyPoints}</p>
            </div>
            <Award className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Loyalty</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.avgLoyaltyPoints}</p>
            </div>
            <Activity className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={createDemoUser}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Demo User</span>
        </button>
        
        <button
          onClick={exportUsersCSV}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-80"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="manager">Managers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{user.name}</h3>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role || 'customer')}`}>
                        {getRoleIcon(user.role || 'customer')}
                        <span className="capitalize">{user.role || 'customer'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  {user.addresses.length > 0 && (
                    <div className="flex items-center space-x-2 text-gray-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {user.addresses[0].street}, {user.addresses[0].city}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">{user.loyaltyPoints} points</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-400">{user.favoriteItems.length} favorites</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserDetails(true);
                    }}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button
                onClick={() => setShowUserDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{selectedUser.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{selectedUser.name}</h3>
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(selectedUser.role || 'customer')}`}>
                    {getRoleIcon(selectedUser.role || 'customer')}
                    <span className="capitalize">{selectedUser.role || 'customer'}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-gray-400 text-sm font-medium mb-2">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{selectedUser.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-400 text-sm font-medium mb-2">Account Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-white">Joined {formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white">{selectedUser.loyaltyPoints} loyalty points</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUser.addresses.length > 0 && (
                <div>
                  <h4 className="text-gray-400 text-sm font-medium mb-2">Addresses</h4>
                  <div className="space-y-2">
                    {selectedUser.addresses.map((address) => (
                      <div key={address.id} className="flex items-center space-x-2 text-white">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{address.name}: {address.street}, {address.city}, {address.state} {address.zipCode}</span>
                        {address.isDefault && (
                          <span className="text-xs text-green-400">(Default)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t border-gray-700">
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Edit User
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                  View Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
