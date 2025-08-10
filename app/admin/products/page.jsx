'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  Trash2, Edit, Plus, Upload, X, Search, Filter, 
  Package, DollarSign, Warehouse, AlertTriangle,
  Eye, Grid, List
} from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Professional theme (consistent with dashboard)
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

// Debounce hook
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

export default function AdminProducts() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 7;
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'all', // 'all', 'in-stock', 'low-stock', 'out-of-stock'
    sortBy: 'title',
    sortOrder: 'asc'
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    brand: '',
    model: '',
    variant: '',
    images: []
  });

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchProducts();
  }, [isAuthenticated, user, router]);

  // Filter products when filters change
  useEffect(() => {
    filterProducts();
  }, [products, debouncedSearch, filters.category, filters.status, filters.sortBy, filters.sortOrder]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.category, filters.status, filters.sortBy, filters.sortOrder]);

  // Memoized calculations
  const productStats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.quantity > 5).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    return { total, inStock, lowStock, outOfStock, totalValue };
  }, [products]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.filter(Boolean);
  }, [products]);

  // Derived pagination values
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredProducts.length / pageSize)), [filteredProducts.length]);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(filteredProducts.length, startIndex + pageSize);
  const paginatedProducts = useMemo(() => filteredProducts.slice(startIndex, startIndex + pageSize), [filteredProducts, startIndex, pageSize]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter products
  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (debouncedSearch) {
      const searchTerm = debouncedSearch.toLowerCase();
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.model?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Status filter
    switch (filters.status) {
      case 'in-stock':
        filtered = filtered.filter(product => product.quantity > 5);
        break;
      case 'low-stock':
        filtered = filtered.filter(product => product.quantity > 0 && product.quantity <= 5);
        break;
      case 'out-of-stock':
        filtered = filtered.filter(product => product.quantity === 0);
        break;
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      // Handle special cases
      if (filters.sortBy === 'price' || filters.sortBy === 'quantity') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    setFilteredProducts(filtered);
  }, [products, debouncedSearch, filters]);

  // Update filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Image upload
  const handleImageUpload = useCallback(async (files) => {
    setUploading(true);
    const uploadedImages = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(data.url);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedImages]
    }));
    setUploading(false);
  }, []);

  const removeImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  // Form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const url = editingProduct 
      ? `/api/products/${editingProduct._id}` 
      : '/api/products';
    
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
        }),
      });

      if (response.ok) {
        fetchProducts();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  }, [formData, editingProduct, fetchProducts]);

  // Delete product
  const handleDelete = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  }, [fetchProducts]);

  // Edit product
  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      brand: product.brand,
      model: product.model,
      variant: product.variant || '',
      images: product.images || []
    });
    setShowModal(true);
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      quantity: '',
      brand: '',
      model: '',
      variant: '',
      images: []
    });
  }, []);

  // Get stock status
  const getStockStatus = useCallback((quantity) => {
    if (quantity === 0) return { label: 'Out of Stock', color: theme.danger, bg: `${theme.danger}15` };
    if (quantity <= 5) return { label: 'Low Stock', color: theme.warning, bg: `${theme.warning}15` };
    return { label: 'In Stock', color: theme.success, bg: `${theme.success}15` };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent rounded-full animate-spin" 
                 style={{ borderTopColor: theme.primary }}></div>
          </div>
          <p className="mt-6 text-lg font-medium" style={{ color: theme.text.secondary }}>
            Loading Products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10" style={{ backgroundColor: theme.background }}>
        {/* Header */}
      <div className=" shadow-sm border-b" 
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>
                Product Management
              </h1>
              <p className="mt-1" style={{ color: theme.text.secondary }}>
                Manage your inventory and product catalog
              </p>
            </div>
            
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              style={{ backgroundColor: theme.primary, color: theme.surface }}
          >
            <Plus size={20} />
              Add New Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="rounded-xl shadow-sm p-6 transition-transform hover:scale-105"
               style={{ backgroundColor: theme.surface }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                <Package />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  Total Products
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                  {productStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-sm p-6 transition-transform hover:scale-105"
               style={{ backgroundColor: theme.surface }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: `${theme.success}15`, color: theme.success }}>
                <Warehouse />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  In Stock
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.success }}>
                  {productStats.inStock}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-sm p-6 transition-transform hover:scale-105"
               style={{ backgroundColor: theme.surface }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: `${theme.warning}15`, color: theme.warning }}>
                <AlertTriangle />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  Low Stock
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.warning }}>
                  {productStats.lowStock}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-sm p-6 transition-transform hover:scale-105"
               style={{ backgroundColor: theme.surface }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: `${theme.danger}15`, color: theme.danger }}>
                <X />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  Out of Stock
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.danger }}>
                  {productStats.outOfStock}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-sm p-6 transition-transform hover:scale-105"
               style={{ backgroundColor: theme.surface }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                   style={{ backgroundColor: `${theme.info}15`, color: theme.info }}>
                <DollarSign />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  Inventory Value
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.info }}>
                  ₨{productStats.totalValue.toLocaleString('en-PK')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="rounded-xl shadow-sm p-6 mb-8" style={{ backgroundColor: theme.surface }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                     style={{ color: theme.text.light }} />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ borderColor: theme.border }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="px-4 py-3 rounded-lg border focus:ring-2 transition-all"
              style={{ borderColor: theme.border }}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="px-4 py-3 rounded-lg border focus:ring-2 transition-all"
              style={{ borderColor: theme.border }}
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-4 py-3 rounded-lg border focus:ring-2 transition-all"
              style={{ borderColor: theme.border }}
            >
              <option value="title">Name</option>
              <option value="price">Price</option>
              <option value="quantity">Stock</option>
              <option value="category">Category</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter('sortOrder', e.target.value)}
              className="px-4 py-3 rounded-lg border focus:ring-2 transition-all"
              style={{ borderColor: theme.border }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            {/* View Toggle */}
            <div className="flex rounded-lg border" style={{ borderColor: theme.border }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-l-lg transition-all ${viewMode === 'grid' ? 'text-white' : ''}`}
                style={{ 
                  backgroundColor: viewMode === 'grid' ? theme.primary : 'transparent',
                  color: viewMode === 'grid' ? theme.surface : theme.text.secondary
                }}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-r-lg transition-all ${viewMode === 'list' ? 'text-white' : ''}`}
                style={{ 
                  backgroundColor: viewMode === 'list' ? theme.primary : 'transparent',
                  color: viewMode === 'list' ? theme.surface : theme.text.secondary
                }}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between flex-wrap gap-3" style={{ borderColor: theme.border }}>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              Showing {filteredProducts.length === 0 ? 0 : startIndex + 1}-{endIndex} of {filteredProducts.length} filtered (total {products.length})
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                style={{ borderColor: theme.border, color: theme.text.secondary }}
              >
                Prev
              </button>
              <span className="text-sm" style={{ color: theme.text.secondary }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                style={{ borderColor: theme.border, color: theme.text.secondary }}
              >
                Next
          </button>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantity);
              
              return (
                <div key={product._id} 
                     className="rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                     style={{ backgroundColor: theme.surface }}>
              <div className="relative h-48">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                      <div className="w-full h-full flex items-center justify-center"
                           style={{ backgroundColor: `${theme.secondary}10` }}>
                        <Package size={48} style={{ color: theme.text.light }} />
                  </div>
                )}
                    
                    {/* Stock status overlay */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: stockStatus.bg,
                              color: stockStatus.color
                            }}>
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2" 
                          style={{ color: theme.text.primary }}>
                        {product.title}
                      </h3>
                      <p className="text-sm" style={{ color: theme.text.secondary }}>
                        {product.brand} • {product.model}
                      </p>
                      <p className="text-xs mt-1 px-2 py-1 rounded-full inline-block"
                         style={{ 
                           backgroundColor: `${theme.info}10`,
                           color: theme.info
                         }}>
                        {product.category}
                      </p>
              </div>
              
                <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold" style={{ color: theme.primary }}>
                        ₨{Number(product.price).toLocaleString('en-PK')}
                      </span>
                      <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                        Stock: {product.quantity}
                      </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all hover:shadow-md"
                        style={{ 
                          backgroundColor: theme.success, 
                          color: theme.surface 
                        }}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all hover:shadow-md"
                        style={{ 
                          backgroundColor: theme.danger, 
                          color: theme.surface 
                        }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl shadow-sm overflow-hidden" 
               style={{ backgroundColor: theme.surface }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: `${theme.secondary}10` }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold" 
                        style={{ color: theme.text.secondary }}>
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" 
                        style={{ color: theme.text.secondary }}>
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" 
                        style={{ color: theme.text.secondary }}>
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" 
                        style={{ color: theme.text.secondary }}>
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" 
                        style={{ color: theme.text.secondary }}>
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold" 
                        style={{ color: theme.text.secondary }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => {
                    const stockStatus = getStockStatus(product.quantity);
                    
                    return (
                      <tr key={product._id} 
                          className="border-t hover:bg-gray-50 transition-colors" 
                          style={{ borderColor: theme.border }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                                 style={{ backgroundColor: `${theme.secondary}10` }}>
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.title}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={20} style={{ color: theme.text.light }} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: theme.text.primary }}>
                                {product.title}
                              </p>
                              <p className="text-sm" style={{ color: theme.text.secondary }}>
                                {product.brand} • {product.model}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${theme.info}10`,
                                  color: theme.info
                                }}>
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold" style={{ color: theme.primary }}>
                            ₨{Number(product.price).toLocaleString('en-PK')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium" style={{ color: theme.text.primary }}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: stockStatus.bg,
                                  color: stockStatus.color
                                }}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 rounded-lg transition-all hover:shadow-md"
                              style={{ 
                                backgroundColor: `${theme.success}15`,
                                color: theme.success
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 rounded-lg transition-all hover:shadow-md"
                              style={{ 
                                backgroundColor: `${theme.danger}15`,
                                color: theme.danger
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-16">
            <Package size={64} className="mx-auto mb-4" style={{ color: theme.text.light }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.text.primary }}>
              No products found
            </h3>
            <p className="mb-6" style={{ color: theme.text.secondary }}>
              {products.length === 0 
                ? "Get started by adding your first product"
                : "Try adjusting your filters to see more results"
              }
            </p>
            {products.length === 0 && (
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ backgroundColor: theme.primary, color: theme.surface }}
              >
                <Plus size={20} />
                Add Your First Product
              </button>
            )}
          </div>
        )}
        </div>

      {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col"
               style={{ backgroundColor: theme.surface }}>
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b" style={{ borderColor: theme.border }}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: theme.text.secondary }}>
                    {editingProduct ? 'Update product information' : 'Create a new product listing'}
                  </p>
                </div>
                  <button
                    onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: theme.text.secondary }}
                  >
                    <X size={24} />
                  </button>
                </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: theme.text.primary }}>
                    <Package size={20} />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" 
                             style={{ color: theme.text.secondary }}>
                        Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                        style={{ borderColor: theme.border }}
                        placeholder="Enter product title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" 
                             style={{ color: theme.text.secondary }}>
                        Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                        style={{ borderColor: theme.border }}
                        placeholder="e.g., Electronics, Clothing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" 
                             style={{ color: theme.text.secondary }}>
                        Brand *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                        style={{ borderColor: theme.border }}
                        placeholder="e.g., Apple, Samsung"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" 
                             style={{ color: theme.text.secondary }}>
                        Model *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                        style={{ borderColor: theme.border }}
                        placeholder="e.g., iPhone 14, Galaxy S23"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" 
                             style={{ color: theme.text.secondary }}>
                        Variant
                      </label>
                      <input
                        type="text"
                        value={formData.variant}
                        onChange={(e) => setFormData({...formData, variant: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                        style={{ borderColor: theme.border }}
                        placeholder="e.g., Pro Max, 128GB"
                      />
                    </div>
                  </div>
                    </div>

                {/* Pricing & Inventory */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: theme.text.primary }}>
                    <DollarSign size={20} />
                    Pricing & Inventory
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" 
                             style={{ color: theme.text.secondary }}>
                        Price (PKR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 font-medium"
                              style={{ color: theme.text.secondary }}>
                          ₨
                        </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                          style={{ borderColor: theme.border }}
                          placeholder="0.00"
                      />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" 
                             style={{ color: theme.text.secondary }}>
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                        style={{ borderColor: theme.border }}
                        placeholder="0"
                      />
                    </div>
                    </div>
                  </div>

                {/* Description */}
                  <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: theme.text.primary }}>
                    <Edit size={20} />
                    Product Description
                  </h3>
                    <ReactQuill
                      value={formData.description}
                      onChange={(value) => setFormData({...formData, description: value})}
                      modules={{
                        toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                          [{'list': 'ordered'}, {'list': 'bullet'}],
                        ['blockquote', 'code-block'],
                        ['link'],
                          ['clean']
                        ],
                      }}
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`
                    }}
                    placeholder="Describe your product features, specifications, and benefits..."
                    />
                  </div>

                {/* Image Upload */}
                  <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: theme.text.primary }}>
                    <Upload size={20} />
                    Product Images
                  </h3>
                  
                  {/* Upload Area */}
                  <div className="border-2 border-dashed rounded-lg p-8 transition-colors hover:border-blue-300"
                       style={{ borderColor: theme.border }}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                        className="hidden"
                        id="image-upload"
                      disabled={uploading}
                      />
                      <label
                        htmlFor="image-upload"
                      className={`cursor-pointer flex flex-col items-center ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                           style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                        <Upload size={32} />
                      </div>
                      <h4 className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>
                        {uploading ? 'Uploading images...' : 'Upload Product Images'}
                      </h4>
                      <p className="text-sm text-center mb-2" style={{ color: theme.text.secondary }}>
                        Drag and drop your images here, or click to browse
                      </p>
                      <p className="text-xs" style={{ color: theme.text.light }}>
                        PNG, JPG, JPEG up to 10MB each
                      </p>
                      </label>
                    </div>

                  {/* Loading indicator */}
                    {uploading && (
                      <div className="mt-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-sm" style={{ color: theme.text.secondary }}>
                          Uploading images...
                        </span>
                      </div>
                      </div>
                    )}

                  {/* Image Preview Grid */}
                    {formData.images.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3" style={{ color: theme.text.secondary }}>
                        Uploaded Images ({formData.images.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border"
                                 style={{ borderColor: theme.border }}>
                            <Image
                              src={image}
                              alt={`Product image ${index + 1}`}
                              width={150}
                              height={150}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                              style={{ backgroundColor: theme.danger, color: theme.surface }}
                            >
                              <X size={14} />
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium"
                                   style={{ backgroundColor: theme.primary, color: theme.surface }}>
                                Main
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      </div>
                    )}
                  </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t flex gap-4" style={{ borderColor: theme.border }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-6 rounded-lg font-medium transition-all border"
                style={{ 
                  borderColor: theme.border,
                  color: theme.text.secondary,
                  backgroundColor: 'transparent'
                }}
                    >
                      Cancel
                    </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 py-3 px-6 rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: theme.primary, 
                  color: theme.surface
                }}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  editingProduct ? 'Update Product' : 'Create Product'
                )}
              </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}