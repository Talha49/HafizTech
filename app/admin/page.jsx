'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { exportDashboardPDF, exportDashboardExcel } from '@/lib/export/exportAnalytics';
import { useRef } from 'react';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [topSort, setTopSort] = useState('totalSold');
  const [topOrder, setTopOrder] = useState('desc');
  const [topPage, setTopPage] = useState(1);
  const [topLimit, setTopLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [groupBy, setGroupBy] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        topPage: String(topPage),
        topLimit: String(topLimit),
        topSort,
        topOrder,
        groupBy,
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      });
      const response = await fetch(`/api/analytics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setInlineLoading(false);
    }
  }, [topPage, topLimit, topSort, topOrder, groupBy, from, to]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchAnalytics();
  }, [isAuthenticated, user, router, fetchAnalytics]);

  // Refetch when top table controls change without user navigation
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      setInlineLoading(true);
      fetchAnalytics();
    }
  }, [topPage, topLimit, topSort, topOrder, groupBy, from, to, isAuthenticated, user, fetchAnalytics]);

  const formatPKR = (value) => `₨${Number(value || 0).toLocaleString('en-PK')}`;

  const revenueRef = useRef(null);
  const usersRef = useRef(null);
  const productsRef = useRef(null);
  const statusRef = useRef(null);

  const exportToPDF = async () => {
    await exportDashboardPDF({
      analytics,
      chartRefs: { revenueRef, usersRef, productsRef, statusRef },
      siteName: 'Hafiz Tech',
    });
  };

  const exportToExcel = async () => {
    await exportDashboardExcel({ analytics });
  };

  const COLORS = ['#1f77b4', '#2ca02c', '#ff7f0e', '#9467bd', '#d62728', '#17becf'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-gray-700">Group by:</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
              <label className="text-sm text-gray-700 ml-2">From:</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
              <label className="text-sm text-gray-700 ml-2">To:</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
              <button onClick={() => { setInlineLoading(true); fetchAnalytics(); }} className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Apply</button>
            </div>
            <button
              onClick={exportToPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div ref={revenueRef} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">PKR {analytics?.overview?.totalRevenue || 0}</p>
          </div>
          <div ref={usersRef} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics?.overview?.totalOrders || 0}</p>
          </div>
          <div ref={productsRef} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-purple-600">{analytics?.overview?.totalUsers || 0}</p>
          </div>
          <div ref={statusRef} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-orange-600">{analytics?.overview?.totalProducts || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue - Area Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
              {inlineLoading && <div className="text-xs text-gray-500">Updating…</div>}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.revenueSeries || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(v) => [`₨${v}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#1f77b4" fill="#a6c8ff" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly New Users - Area Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">New Users</h3>
              {inlineLoading && <div className="text-xs text-gray-500">Updating…</div>}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.usersSeries || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(v) => [v, 'Users']} />
                <Area type="monotone" dataKey="users" stroke="#2ca02c" fill="#98df8a" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Products Activity and Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly New Products - Area Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">New Products</h3>
              {inlineLoading && <div className="text-xs text-gray-500">Updating…</div>}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.productsSeries || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(v) => [v, 'Products']} />
                <Area type="monotone" dataKey="products" stroke="#ff7f0e" fill="#ffbb78" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Order Status</h3>
              {inlineLoading && <div className="text-xs text-gray-500">Updating…</div>}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.orderStatusStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics?.orderStatusStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Table with sorting and pagination */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Top Selling Products</h3>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={topSort}
                onChange={(e) => { setTopSort(e.target.value); setInlineLoading(true); }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="totalSold">Quantity Sold</option>
                <option value="revenue">Revenue</option>
              </select>
              <select
                value={topOrder}
                onChange={(e) => { setTopOrder(e.target.value); setInlineLoading(true); }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
              <select
                value={topLimit}
                onChange={(e) => { setTopLimit(parseInt(e.target.value)); setTopPage(1); setInlineLoading(true); }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(analytics?.topProducts || []).map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.product?.title || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.totalSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      PKR {product.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {analytics?.topProductsPagination?.pages > 1 && (
            <div className="flex justify-end items-center gap-2 pt-4">
              <button
                onClick={() => { setTopPage((p) => Math.max(1, p - 1)); setInlineLoading(true); }}
                disabled={topPage === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {analytics?.topProductsPagination?.page} of {analytics?.topProductsPagination?.pages}
              </span>
              <button
                onClick={() => { setTopPage((p) => p + 1); setInlineLoading(true); }}
                disabled={topPage === analytics?.topProductsPagination?.pages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        {analytics?.lowStockProducts?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Low Stock Alert</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.lowStockProducts.map((product) => (
                <div key={product._id} className="bg-white p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-gray-900">{product.title}</h4>
                  <p className="text-sm text-red-600">Stock: {product.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <button
            onClick={() => router.push('/admin/products')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Manage Products
          </button>
          <button
            onClick={() => router.push('/admin/orders')}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            Manage Orders
          </button>
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            Manage Users
          </button>
          <button
            onClick={() => router.push('/admin/settings')}
            className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
          >
            Site Settings
          </button>
        </div>
      </div>
    </div>
  );
}