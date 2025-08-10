'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuthStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { exportDashboardPDF, exportDashboardExcel } from '@/lib/export/exportAnalytics';

// Debounce hook for optimized filtering
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Professional color scheme
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
  },
  gradients: {
    blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    green: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
};

const CHART_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed'];

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  // State management
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    topSort: 'totalSold',
    topOrder: 'desc',
    topPage: 1,
    topLimit: 10,
    groupBy: 'month',
    from: '',
    to: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({ pdf: false, excel: false });

  // Chart refs for export
  const chartRefs = {
    revenueRef: useRef(null),
    usersRef: useRef(null),
    productsRef: useRef(null),
    statusRef: useRef(null),
    overview: useRef(null)
  };

  // Debounced filters for API calls
  const debouncedFilters = useDebounce(filters, 500);

  // Memoized fetch function
  const fetchAnalytics = useCallback(async (showInlineLoading = false) => {
    if (showInlineLoading) setInlineLoading(true);
    
    try {
      const params = new URLSearchParams({
        topPage: String(debouncedFilters.topPage),
        topLimit: String(debouncedFilters.topLimit),
        topSort: debouncedFilters.topSort,
        topOrder: debouncedFilters.topOrder,
        groupBy: debouncedFilters.groupBy,
        ...(debouncedFilters.from ? { from: debouncedFilters.from } : {}),
        ...(debouncedFilters.to ? { to: debouncedFilters.to } : {}),
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
  }, [debouncedFilters]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchAnalytics();
  }, [isAuthenticated, user, router, fetchAnalytics]);

  // Debounced filter changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && !loading) {
      fetchAnalytics(true);
    }
  }, [debouncedFilters, isAuthenticated, user, loading, fetchAnalytics]);

  // Memoized calculations
  const formattedOverview = useMemo(() => {
    if (!analytics?.overview) return null;
    
    return {
      revenue: `₨${Number(analytics.overview.totalRevenue || 0).toLocaleString('en-PK')}`,
      orders: Number(analytics.overview.totalOrders || 0).toLocaleString(),
      users: Number(analytics.overview.totalUsers || 0).toLocaleString(),
      products: Number(analytics.overview.totalProducts || 0).toLocaleString()
    };
  }, [analytics?.overview]);

  const memoizedChartData = useMemo(() => ({
    revenue: analytics?.revenueSeries || [],
    users: analytics?.usersSeries || [],
    products: analytics?.productsSeries || [],
    orderStatus: analytics?.orderStatusStats || []
  }), [analytics]);

  // Filter update functions
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'topLimit' && { topPage: 1 }) // Reset page when limit changes
    }));
  }, []);

  // Export functions
  const handleExportPDF = useCallback(async () => {
    setExportLoading(prev => ({ ...prev, pdf: true }));
    try {
      await exportDashboardPDF({
        analytics,
        chartRefs,
        siteName: 'Hafiz Tech'
      });
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }));
    }
  }, [analytics]);

  const handleExportExcel = useCallback(async () => {
    setExportLoading(prev => ({ ...prev, excel: true }));
    try {
      await exportDashboardExcel({ analytics });
    } catch (error) {
      console.error('Excel export failed:', error);
    } finally {
      setExportLoading(prev => ({ ...prev, excel: false }));
    }
  }, [analytics]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent rounded-full animate-spin" 
                 style={{ borderTopColor: theme.primary }}></div>
          </div>
          <p className="mt-6 text-lg font-medium" style={{ color: theme.text.secondary }}>
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10" style={{ backgroundColor: theme.background }}>
      {/* Header Section */}
      <div className=" shadow-sm border-b" 
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>
                Admin Dashboard
              </h1>
              <p className="mt-1" style={{ color: theme.text.secondary }}>
                Comprehensive analytics and management overview
              </p>
            </div>
            
            {/* Export Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                disabled={exportLoading.pdf}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                style={{ 
                  backgroundColor: theme.danger, 
                  color: theme.surface,
                  opacity: exportLoading.pdf ? 0.5 : 1
                }}
              >
                {exportLoading.pdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    📄 Export PDF
                  </>
                )}
              </button>
              
              <button
                onClick={handleExportExcel}
                disabled={exportLoading.excel}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                style={{ 
                  backgroundColor: theme.success, 
                  color: theme.surface,
                  opacity: exportLoading.excel ? 0.5 : 1
                }}
              >
                {exportLoading.excel ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    📊 Export Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Section */}
        <div className="mb-8 p-6 rounded-xl shadow-sm" style={{ backgroundColor: theme.surface }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                Group by:
              </label>
              <select 
                value={filters.groupBy} 
                onChange={(e) => updateFilter('groupBy', e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ 
                  borderColor: theme.border,
                  focusRingColor: theme.primary 
                }}
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                From:
              </label>
              <input 
                type="date" 
                value={filters.from} 
                onChange={(e) => updateFilter('from', e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ borderColor: theme.border }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                To:
              </label>
              <input 
                type="date" 
                value={filters.to} 
                onChange={(e) => updateFilter('to', e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ borderColor: theme.border }}
              />
            </div>
            
            {inlineLoading && (
              <div className="flex items-center gap-2 text-sm" style={{ color: theme.text.light }}>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                Updating...
              </div>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div ref={chartRefs.overview} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="relative overflow-hidden rounded-xl shadow-sm p-6 transition-transform hover:scale-105"
               style={{ backgroundColor: theme.surface }}>
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 rounded-full opacity-10"
                 style={{ backgroundColor: theme.success }}></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: `${theme.success}15`, color: theme.success }}>
                💰
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  Total Revenue
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.success }}>
                  {formattedOverview?.revenue || '₨0'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl shadow-sm p-6 transition-transform hover:scale-105"
               style={{ backgroundColor: theme.surface }}>
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 rounded-full opacity-10"
                 style={{ backgroundColor: theme.primary }}></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                📦
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  Total Orders
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                  {formattedOverview?.orders || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl shadow-sm p-6 transition-transform hover:scale-105"
               style={{ backgroundColor: theme.surface }}>
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 rounded-full opacity-10"
                 style={{ backgroundColor: theme.info }}></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: `${theme.info}15`, color: theme.info }}>
                👥
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  Total Users
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.info }}>
                  {formattedOverview?.users || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl shadow-sm p-6 transition-transform hover:scale-105"
               style={{ backgroundColor: theme.surface }}>
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 rounded-full opacity-10"
                 style={{ backgroundColor: theme.warning }}></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: `${theme.warning}15`, color: theme.warning }}>
                🏷️
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  Total Products
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.warning }}>
                  {formattedOverview?.products || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div ref={chartRefs.revenueRef} className="rounded-xl shadow-sm p-6" 
               style={{ backgroundColor: theme.surface }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                Revenue Trends
              </h3>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.success }}></div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={memoizedChartData.revenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.success} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis 
                  dataKey="label" 
                  stroke={theme.text.light}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme.text.light}
                  fontSize={12}
                  tickFormatter={(value) => `₨${Number(value).toLocaleString('en-PK', { notation: 'compact' })}`}
                />
                <Tooltip 
                  formatter={(value) => [`₨${Number(value).toLocaleString('en-PK')}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={theme.success} 
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Users Chart */}
          <div ref={chartRefs.usersRef} className="rounded-xl shadow-sm p-6" 
               style={{ backgroundColor: theme.surface }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                New Users
              </h3>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.info }}></div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={memoizedChartData.users}>
                <defs>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.info} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.info} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="label" stroke={theme.text.light} fontSize={12} />
                <YAxis stroke={theme.text.light} fontSize={12} />
                <Tooltip 
                  formatter={(value) => [value, 'Users']}
                  contentStyle={{ 
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke={theme.info} 
                  fill="url(#usersGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Products Chart */}
          <div ref={chartRefs.productsRef} className="rounded-xl shadow-sm p-6" 
               style={{ backgroundColor: theme.surface }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                New Products
              </h3>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.warning }}></div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={memoizedChartData.products}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="label" stroke={theme.text.light} fontSize={12} />
                <YAxis stroke={theme.text.light} fontSize={12} />
                <Tooltip 
                  formatter={(value) => [value, 'Products']}
                  contentStyle={{ 
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="products" 
                  fill={theme.warning}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Chart */}
          <div ref={chartRefs.statusRef} className="rounded-xl shadow-sm p-6" 
               style={{ backgroundColor: theme.surface }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                Order Status Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={memoizedChartData.orderStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {memoizedChartData.orderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="rounded-xl shadow-sm mb-8" style={{ backgroundColor: theme.surface }}>
          <div className="p-6 border-b" style={{ borderColor: theme.border }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                Top Selling Products
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filters.topSort}
                  onChange={(e) => updateFilter('topSort', e.target.value)}
                  className="px-3 py-2 rounded-lg border text-sm focus:ring-2 transition-all"
                  style={{ borderColor: theme.border }}
                >
                  <option value="totalSold">Quantity Sold</option>
                  <option value="revenue">Revenue</option>
                </select>
                <select
                  value={filters.topOrder}
                  onChange={(e) => updateFilter('topOrder', e.target.value)}
                  className="px-3 py-2 rounded-lg border text-sm focus:ring-2 transition-all"
                  style={{ borderColor: theme.border }}
                >
                  <option value="desc">Highest First</option>
                  <option value="asc">Lowest First</option>
                </select>
                <select
                  value={filters.topLimit}
                  onChange={(e) => updateFilter('topLimit', parseInt(e.target.value))}
                  className="px-3 py-2 rounded-lg border text-sm focus:ring-2 transition-all"
                  style={{ borderColor: theme.border }}
                >
                  <option value={5}>5 items</option>
                  <option value={10}>10 items</option>
                  <option value={20}>20 items</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: `${theme.secondary}10` }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.text.secondary }}>
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.text.secondary }}>
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.text.secondary }}>
                    Quantity Sold
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.text.secondary }}>
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.topProducts || []).map((product, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50 transition-colors" 
                      style={{ borderColor: theme.border }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
                           style={{ 
                             backgroundColor: index < 3 ? CHART_COLORS[index] : theme.secondary 
                           }}>
                        {(filters.topPage - 1) * filters.topLimit + index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium" style={{ color: theme.text.primary }}>
                        {product.product?.title || 'Unknown Product'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                        {product.totalSold}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold" style={{ color: theme.success }}>
                        ₨{Number(product.revenue || 0).toLocaleString('en-PK')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {analytics?.topProductsPagination?.pages > 1 && (
            <div className="flex justify-between items-center p-6 border-t" style={{ borderColor: theme.border }}>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                Page {analytics.topProductsPagination.page} of {analytics.topProductsPagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilter('topPage', Math.max(1, filters.topPage - 1))}
                  disabled={filters.topPage === 1}
                  className="px-4 py-2 rounded-lg border transition-all disabled:opacity-50"
                  style={{ borderColor: theme.border }}
                >
                  Previous
                </button>
                <button
                  onClick={() => updateFilter('topPage', filters.topPage + 1)}
                  disabled={filters.topPage === analytics?.topProductsPagination?.pages}
                  className="px-4 py-2 rounded-lg border transition-all disabled:opacity-50"
                  style={{ borderColor: theme.border }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        {analytics?.lowStockProducts?.length > 0 && (
          <div className="rounded-xl p-6 mb-8 border-l-4" 
               style={{ 
                 backgroundColor: `${theme.warning}10`, 
                 borderLeftColor: theme.warning 
               }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: theme.warning, color: theme.surface }}>
                ⚠️
              </div>
              <h3 className="text-lg font-semibold" style={{ color: theme.warning }}>
                Low Stock Alert
              </h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: theme.warning,
                      color: theme.surface
                    }}>
                {analytics.lowStockProducts.length} items
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.lowStockProducts.map((product) => (
                <div key={product._id} 
                     className="p-4 rounded-lg border transition-all hover:shadow-md"
                     style={{ 
                       backgroundColor: theme.surface,
                       borderColor: theme.warning
                     }}>
                  <h4 className="font-medium mb-2" style={{ color: theme.text.primary }}>
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: theme.text.secondary }}>
                      Stock:
                    </span>
                    <span className="px-2 py-1 rounded text-sm font-semibold"
                          style={{ 
                            backgroundColor: `${theme.danger}15`,
                            color: theme.danger
                          }}>
                      {product.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => router.push('/admin/products')}
            className="group p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{ backgroundColor: theme.surface }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors group-hover:scale-110"
                   style={{ 
                     backgroundColor: `${theme.primary}15`,
                     color: theme.primary
                   }}>
                📦
              </div>
              <div className="text-left">
                <h3 className="font-semibold" style={{ color: theme.text.primary }}>
                  Manage Products
                </h3>
                <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                  Add, edit, and organize products
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/orders')}
            className="group p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{ backgroundColor: theme.surface }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors group-hover:scale-110"
                   style={{ 
                     backgroundColor: `${theme.success}15`,
                     color: theme.success
                   }}>
                📋
              </div>
              <div className="text-left">
                <h3 className="font-semibold" style={{ color: theme.text.primary }}>
                  Manage Orders
                </h3>
                <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                  Process and track orders
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/users')}
            className="group p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{ backgroundColor: theme.surface }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors group-hover:scale-110"
                   style={{ 
                     backgroundColor: `${theme.info}15`,
                     color: theme.info
                   }}>
                👥
              </div>
              <div className="text-left">
                <h3 className="font-semibold" style={{ color: theme.text.primary }}>
                  Manage Users
                </h3>
                <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                  View and manage user accounts
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/settings')}
            className="group p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{ backgroundColor: theme.surface }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors group-hover:scale-110"
                   style={{ 
                     backgroundColor: `${theme.secondary}15`,
                     color: theme.secondary
                   }}>
                ⚙️
              </div>
              <div className="text-left">
                <h3 className="font-semibold" style={{ color: theme.text.primary }}>
                  Site Settings
                </h3>
                <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                  Configure system settings
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}