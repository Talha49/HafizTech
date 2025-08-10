'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

export default function AdminOrders() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, user, router, pagination.page]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?page=${pagination.page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return {
          bg: '#fef3c7',
          text: theme.warning,
          border: '#fbbf24'
        };
      case 'Shipped':
        return {
          bg: '#dbeafe',
          text: theme.info,
          border: '#60a5fa'
        };
      case 'Delivered':
        return {
          bg: '#d1fae5',
          text: theme.success,
          border: '#34d399'
        };
      case 'Cancelled':
        return {
          bg: '#fee2e2',
          text: theme.danger,
          border: '#f87171'
        };
      default:
        return {
          bg: '#f1f5f9',
          text: theme.secondary,
          border: '#cbd5e1'
        };
    }
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
            Loading orders...
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
            Order Management
          </h1>
          <p style={{ color: theme.text.secondary }}>
            Manage and track customer orders
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
                  Total Orders
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {pagination.total}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <svg className="w-6 h-6" style={{ color: theme.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
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
                  Pending
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.warning }}>
                  {orders.filter(o => o.status === 'Pending').length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.warning}15` }}
              >
                <svg className="w-6 h-6" style={{ color: theme.warning }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                  Shipped
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.info }}>
                  {orders.filter(o => o.status === 'Shipped').length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.info}15` }}
              >
                <svg className="w-6 h-6" style={{ color: theme.info }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
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
                  Delivered
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.success }}>
                  {orders.filter(o => o.status === 'Delivered').length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.success}15` }}
              >
                <svg className="w-6 h-6" style={{ color: theme.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
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
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.text.secondary }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-opacity-50 transition-colors duration-150" style={{ '&:hover': { backgroundColor: `${theme.primary}05` } }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium" style={{ color: theme.text.primary }}>
                        #{order._id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3"
                          style={{ backgroundColor: theme.primary }}
                        >
                          {order.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.text.primary }}>
                            {order.user?.name || 'Unknown'}
                          </div>
                          <div className="text-sm" style={{ color: theme.text.secondary }}>
                            {order.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-opacity-50 rounded-lg p-2" style={{ backgroundColor: `${theme.primary}05` }}>
                            {item.product?.images?.[0] && (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.title}
                                width={32}
                                height={32}
                                className="rounded object-cover"
                              />
                            )}
                            <span className="text-xs" style={{ color: theme.text.secondary }}>
                              {item.product?.title || 'Unknown'} x{item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              color: theme.text.light,
                              backgroundColor: `${theme.secondary}15`
                            }}
                          >
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                        ₨{order.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full border"
                        style={{ 
                          backgroundColor: getStatusColor(order.status).bg,
                          color: getStatusColor(order.status).text,
                          borderColor: getStatusColor(order.status).border
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.text.secondary }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{ 
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          color: theme.text.primary,
                          '--tw-ring-color': theme.primary
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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
      </div>
    </div>
  );
}