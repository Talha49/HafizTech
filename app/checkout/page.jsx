'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useCartStore, useAuthStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, ShoppingBag, CreditCard, MapPin, Phone, User, CheckCircle, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    address: user?.address || '',
    contact: user?.contact || '',
  });

  // Perform client-side redirects after mount
  useEffect(() => {
    if (!isAuthenticated) {
      setIsRedirecting(true);
      router.replace('/auth/login');
      return;
    }
    if (items.length === 0) {
      setIsRedirecting(true);
      router.replace('/cart');
    }
  }, [isAuthenticated, items.length, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const confirmOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingAddress,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        setIsModalOpen(false);
        router.push(`/orders?success=true&orderId=${order._id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Checkout
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Shipping Form - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shipping Information</h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <Phone className="h-4 w-4" />
                      <span>Contact Number</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.contact}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, contact: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>Shipping Address</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white resize-none"
                      placeholder="Enter your complete delivery address"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Place Order</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8 sticky top-32">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto scrollbar-hide">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                    <div className="relative h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{item.brand} - {item.model}</p>
                      <p className="text-sm font-medium text-blue-600">Qty: {item.quantity}</p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">₨{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₨{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span>Shipping</span>
                  </div>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">₨{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Payment Info</h3>
                    <p className="text-sm text-blue-700">
To finalize your purchase, please proceed to checkout. You&apos;ll find the onboarding process straightforward, and it&apos;ll walk you through the steps to buy or book your chosen product.                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Order Confirmation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-2xl font-bold">Complete Your Order</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-4 sm:p-6">
                <div className="space-y-6 sm:space-y-8">
                  
                  {/* Online Payment Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-blue-900">Online Payment</h3>
                    </div>
                    
                    <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
                      Transfer the total amount to the account below, then send your payment receipt along with order details to our contact number.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-semibold text-gray-600">Bank Details</span>
                            <span className="font-mono text-gray-900 bg-white px-3 py-2 rounded-lg border text-xs sm:text-sm break-all">Meezan Bank</span>
                          </div>
                         
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-semibold text-gray-600">IBAN</span>
                            <span className="font-mono text-gray-900 bg-white px-3 py-2 rounded-lg border text-xs sm:text-sm break-all">PK72 MEZN 0008 0101 0904 4033
</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-semibold text-gray-600">Account No</span>
                            <span className="font-mono text-gray-900 bg-white px-3 py-2 rounded-lg border text-xs sm:text-sm">0801 0109044033
</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-semibold text-gray-600">Account Title</span>
                            <span className="text-gray-900 bg-white px-3 py-2 rounded-lg border text-xs sm:text-sm font-semibold">FAHEEM MUBEEN</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-semibold text-gray-600">Contact</span>
                            <span className="font-mono text-gray-900 bg-white px-3 py-2 rounded-lg border text-xs sm:text-sm">+92 301 7638491</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Physical Store Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-200/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-green-900">Visit Our Store</h3>
                    </div>
                    
                    <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
                      Prefer shopping in person? Visit our physical store for a hands-on experience.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-gray-600">Store Address</span>
                        <span className="text-gray-900 bg-white px-3 py-2 rounded-lg border text-xs sm:text-sm leading-relaxed">
                          Shop No# 62/11 Atalian Shoes Street, Bank Road Saddar, Rawalpindi, Pakistan
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-gray-600">Contact</span>
                        <span className="font-mono text-gray-900 bg-white px-3 py-2 rounded-lg border text-xs sm:text-sm">+92 301 7638491</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOrder}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Confirming...</span>
                    </div>
                  ) : (
                    'Confirm Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}