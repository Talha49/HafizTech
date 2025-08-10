'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, X, Users, UserPlus, Shield, User } from 'lucide-react';

const theme = {
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  secondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  surface: '#ffffff',
  background: '#f8fafc',
  border: '#e2e8f0',
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    light: '#94a3b8'
  }
};

export default function AdminUsers() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
    role: 'user'
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, user, router, pagination.page]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/users?page=${pagination.page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      contact: user.contact,
      address: user.address,
      role: user.role
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchUsers();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      contact: '',
      address: '',
      role: 'user'
    });
  };

  const getRoleColor = (role) => {
    if (role === 'admin') {
      return {
        bg: '#faf5ff',
        text: '#7c2d12',
        border: '#a855f7'
      };
    }
    return {
      bg: '#d1fae5',
      text: theme.success,
      border: '#34d399'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="relative">
          <div 
            className="w-16 h-16 border-4 border-solid rounded-full animate-spin"
            style={{ 
              borderColor: theme.border,
              borderTopColor: theme.primary
            }}
          ></div>
          <div className="mt-4 text-center" style={{ color: theme.text.secondary }}>
            Loading users...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.text.primary }}>
            User Management
          </h1>
          <p style={{ color: theme.text.secondary }}>
            Manage system users and their permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="p-6 rounded-xl shadow-sm border"
            style={{ 
              backgroundColor: theme.surface,
              borderColor: theme.border
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: theme.text.secondary }} className="text-sm font-medium">
                  Total Users
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {pagination.total}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <Users className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
            </div>
          </div>

          <div 
            className="p-6 rounded-xl shadow-sm border"
            style={{ 
              backgroundColor: theme.surface,
              borderColor: theme.border
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: theme.text.secondary }} className="text-sm font-medium">
                  Admins
                </p>
                <p className="text-2xl font-bold" style={{ color: '#7c2d12' }}>
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#faf5ff' }}
              >
                <Shield className="w-6 h-6" style={{ color: '#7c2d12' }} />
              </div>
            </div>
          </div>

          <div 
            className="p-6 rounded-xl shadow-sm border"
            style={{ 
              backgroundColor: theme.surface,
              borderColor: theme.border
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: theme.text.secondary }} className="text-sm font-medium">
                  Regular Users
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.success }}>
                  {users.filter(u => u.role === 'user').length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.success}15` }}
              >
                <User className="w-6 h-6" style={{ color: theme.success }} />
              </div>
            </div>
          </div>

          <div 
            className="p-6 rounded-xl shadow-sm border"
            style={{ 
              backgroundColor: theme.surface,
              borderColor: theme.border
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: theme.text.secondary }} className="text-sm font-medium">
                  New This Month
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.info }}>
                  {users.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.info}15` }}
              >
                <UserPlus className="w-6 h-6" style={{ color: theme.info }} />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div 
          className="rounded-xl shadow-sm border overflow-hidden"
          style={{ 
            backgroundColor: theme.surface,
            borderColor: theme.border
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: theme.border }}>
              <thead style={{ backgroundColor: theme.background }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-opacity-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-4"
                          style={{ backgroundColor: theme.primary }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                            {user.name}
                          </div>
                          <div className="text-xs" style={{ color: theme.text.light }}>
                            ID: {user._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: theme.text.primary }}>
                        {user.email}
                      </div>
                      <div className="text-sm" style={{ color: theme.text.secondary }}>
                        {user.contact || 'No contact'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm max-w-xs truncate" style={{ color: theme.text.secondary }}>
                        {user.address || 'No address'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border"
                        style={{ 
                          backgroundColor: getRoleColor(user.role).bg,
                          color: getRoleColor(user.role).text,
                          borderColor: getRoleColor(user.role).border
                        }}
                      >
                        {user.role === 'admin' ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: theme.text.secondary }}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                          style={{ 
                            backgroundColor: `${theme.primary}10`,
                            color: theme.primary
                          }}
                          title="Edit user"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                          style={{ 
                            backgroundColor: `${theme.danger}10`,
                            color: theme.danger
                          }}
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div 
              className="px-6 py-4 flex items-center justify-between border-t"
              style={{ 
                backgroundColor: theme.background,
                borderColor: theme.border
              }}
            >
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text.primary
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text.primary
                  }}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>
                    Showing page <span className="font-medium" style={{ color: theme.text.primary }}>{pagination.page}</span> of{' '}
                    <span className="font-medium" style={{ color: theme.text.primary }}>{pagination.pages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 rounded-l-lg border text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                      style={{ 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text.secondary
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-4 py-2 rounded-r-lg border text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                      style={{ 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text.secondary
                      }}
                    >
                      Next
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
              className="rounded-xl max-w-md w-full shadow-2xl"
              style={{ backgroundColor: theme.surface }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                      Edit User
                    </h2>
                    <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                      Update user information and permissions
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                    style={{ 
                      backgroundColor: `${theme.secondary}10`,
                      color: theme.secondary
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text.primary,
                        '--tw-ring-color': theme.primary
                      }}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text.primary,
                        '--tw-ring-color': theme.primary
                      }}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                      Contact
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text.primary,
                        '--tw-ring-color': theme.primary
                      }}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                      Address
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                      style={{ 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text.primary,
                        '--tw-ring-color': theme.primary
                      }}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text.primary,
                        '--tw-ring-color': theme.primary
                      }}
                    >
                      <option value="user">Regular User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSubmit}
                      className="flex-1 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg"
                      style={{ backgroundColor: theme.primary }}
                    >
                      Update User
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                      style={{ 
                        backgroundColor: theme.secondary,
                        color: 'white'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}