import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, CreditCard, Bell, Ruler, Clock, CheckCircle, Truck, RefreshCw, Scissors, ArrowLeft, Store, MapPin, AlertTriangle, Search } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export default function CustomerPortal() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  // Selection and data states
  const [tailors, setTailors] = useState([]);
  const [selectedTailor, setSelectedTailor] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [shopFilter, setShopFilter] = useState('');

  const filteredTailors = tailors.filter(tailor => {
    const shopName = (tailor.shop_name || `${tailor.name}'s Shop`).toLowerCase();
    const tailorName = (tailor.name || '').toLowerCase();
    const address = (tailor.address || '').toLowerCase();
    const searchLower = shopFilter.toLowerCase();
    return shopName.includes(searchLower) || tailorName.includes(searchLower) || address.includes(searchLower);
  });

  useEffect(() => {
    if (localStorage.getItem('just_registered') === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('just_registered');
    }
    fetchTailors();
  }, []);

  const fetchTailors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/customer/tailors`);
      setTailors(res.data);
    } catch (err) {
      console.error("Error loading tailors list:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectTailorShop = async (tailor) => {
    setSelectedTailor(tailor);
    setLoadingDetails(true);
    try {
      const res = await axios.get(`${API_URL}/customer/tailor/${tailor.id}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error loading customer tailor details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBack = () => {
    setSelectedTailor(null);
    setDashboardData(null);
  };

  const handleRefresh = async () => {
    if (selectedTailor) {
      setLoadingDetails(true);
      try {
        const res = await axios.get(`${API_URL}/customer/tailor/${selectedTailor.id}`);
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error refreshing details:", err);
      } finally {
        setLoadingDetails(false);
      }
    } else {
      fetchTailors();
    }
  };

  // Helper to compute progress bar width percentage
  const getProgressPercent = (status) => {
    if (status === 'Pending') return '0%';
    if (status === 'In Progress') return '50%';
    if (status === 'Ready') return '100%';
    if (status === 'Delivered') return '100%';
    return '0%';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-left">
      {showWelcome && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎉</span>
            <span className="font-semibold">Successfully registered! Welcome to your VastraSilai AI customer portal.</span>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-emerald-400 hover:text-emerald-300 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Conditionally Render Header */}
      {!selectedTailor || loadingDetails || (dashboardData && !dashboardData.is_registered) ? (
        /* STANDARD WELCOME HEADER BAR (when not viewing a shop's dashboard) */
        <div className="flex justify-between items-center bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute -left-12 -top-12 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/15 border border-purple-500/30 text-purple-400 rounded-2xl shadow-inner shadow-purple-950/20">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-extrabold text-white leading-tight">
                {t('welcomeCustomer', { name: user?.name })}
              </h1>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mt-0.5">{t('customerDashboard')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/5 hover:border-purple-500/20 transition duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl px-4 py-2 text-xs font-extrabold tracking-wider uppercase transition duration-300 cursor-pointer hover:scale-105 active:scale-95"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      ) : (
        /* UNIFIED RECORD VIEW HEADER (when viewing dashboard) */
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-purple-900/20 via-indigo-900/15 to-transparent border border-white/10 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden">
          {/* Ambient Background Glow */}
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-2xl border border-white/5 hover:border-purple-500/30 transition duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 shadow-md self-start"
              title="Go back to shops"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Avatar with dynamic initials and premium gradient */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-950/50 border border-purple-400/30">
                {(dashboardData?.customer_name || user?.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white font-heading mt-1 leading-tight tracking-tight">
                  {dashboardData?.customer_name || user?.name}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-1 flex items-center">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  Linked Phone: <span className="text-gray-300 font-semibold ml-1">{user?.phone}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Tailor Shop details & Actions */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Tailor Shop details pill */}
            <div className="flex items-center space-x-3 bg-white/5 border border-white/5 py-2.5 px-4 rounded-2xl">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Tailor Shop</span>
                <span className="text-xs font-bold text-white block mt-0.5">{selectedTailor.shop_name || selectedTailor.name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/5 hover:border-purple-500/20 transition duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase transition duration-300 cursor-pointer hover:scale-105 active:scale-95"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection flow */}
      {!selectedTailor ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white font-heading">Select Your Tailor Shop</h2>
              <p className="text-sm text-gray-400">Choose a shop below to view your tailoring records, measurements, and orders.</p>
            </div>
            
            {/* Search Filter input */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-200" />
              <input
                type="text"
                value={shopFilter}
                onChange={(e) => setShopFilter(e.target.value)}
                placeholder="Search by shop, tailor, or location..."
                className="w-full glass-input pl-11 pr-4 py-2.5 rounded-xl text-sm text-white transition-all duration-200"
              />
            </div>
          </div>

          {filteredTailors.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center text-gray-500 text-sm">
              <Store className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p>No tailor shops match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTailors.map(tailor => (
                <div
                  key={tailor.id}
                  onClick={() => selectTailorShop(tailor)}
                  className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-purple-500/30 transition shadow-lg hover:shadow-purple-950/10 cursor-pointer flex flex-col justify-between group animate-fade-in"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-purple-600/10 text-purple-400 rounded-2xl group-hover:bg-purple-600/20 transition">
                        <Store className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Tailor Shop
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                        {tailor.shop_name || `${tailor.name}'s Shop`}
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        Tailor: <span className="text-gray-300">{tailor.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-6 flex items-center text-xs text-gray-500 font-semibold">
                    <MapPin className="w-4 h-4 text-purple-400/60 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{tailor.address || "Address not provided"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loadingDetails ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="text-gray-400 text-sm">Verifying records with {selectedTailor.shop_name || selectedTailor.name}...</span>
        </div>
      ) : dashboardData && !dashboardData.is_registered ? (
        // NOT REGISTERED VIEW
        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-red-500/20 space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-950/20">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-heading">Not Registered at Shop</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Your registered customer phone number (<span className="text-white font-semibold">{user?.phone}</span>) is not linked in <span className="text-purple-400 font-bold">{selectedTailor.shop_name || selectedTailor.name}</span>'s records.
            </p>
          </div>


          <button
            onClick={handleBack}
            className="neon-btn px-6 py-3 rounded-xl font-bold text-white text-xs uppercase tracking-wider flex items-center justify-center space-x-2 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tailor Shops</span>
          </button>
        </div>
      ) : (
        // REGISTERED DASHBOARD VIEW
        <div className="space-y-8 animate-fade-in">
          {/* Unified header rendered at the page top replaces this section */}

          {/* KPI stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase">{t('cardOrders')}</span>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">{dashboardData?.orders.length}</h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase">{t('remainingBalance')}</span>
                <h3 className="text-2xl font-bold text-amber-400 tracking-tight mt-0.5">
                  ₹{dashboardData?.orders.reduce((sum, o) => sum + o.balance_amount, 0) || 0}
                </h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-pink-600/10 text-pink-400 rounded-xl relative">
                <Bell className="w-6 h-6" />
                {dashboardData?.notifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping"></span>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase">Active Alerts</span>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">{dashboardData?.notifications.length}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Col: Order Tracking */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-2 pb-2">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                <h2 className="font-heading text-lg font-bold text-white">{t('trackOrderStatus')}</h2>
              </div>

              {dashboardData?.orders.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center text-gray-500 text-sm">
                  <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p>No active orders found at this tailor shop.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dashboardData?.orders.map(order => (
                    <div key={order.id} className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
                      
                      {/* Title & Price */}
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div>
                          <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{t(order.cloth_type)}</span>
                          <h3 className="text-lg font-bold text-white mt-1">Order Number: #{1000 + order.id}</h3>
                          {order.description && (
                            <p className="text-xs text-gray-400 mt-1.5 italic">{order.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 font-semibold uppercase">Price</span>
                          <h4 className="text-xl font-bold text-white">₹{order.total_amount}</h4>
                        </div>
                      </div>

                      {/* Horizontal Progress tracker */}
                      <div className="space-y-4 py-2">
                        <div className="relative flex justify-between">
                          {/* Tracking background line */}
                          <div className="absolute top-3.5 left-0 right-0 h-1 bg-white/5 -z-10 rounded-full"></div>
                          <div 
                            className="absolute top-3.5 left-0 h-1 bg-purple-500 -z-10 rounded-full transition-all duration-500"
                            style={{ width: getProgressPercent(order.status) }}
                          ></div>

                          {/* Step 1: Order Created */}
                          <div className="flex flex-col items-center text-center space-y-1 z-10">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                              order.status === 'Pending' 
                                ? 'bg-amber-500 border-amber-400 text-gray-950 scale-110 shadow-lg shadow-amber-950/20' 
                                : 'bg-purple-600 border-purple-500 text-white'
                            }`}>
                              <Clock className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-bold ${order.status === 'Pending' ? 'text-amber-400' : 'text-gray-400'}`}>
                              Order Created
                            </span>
                          </div>

                          {/* Step 2: Stitching Started */}
                          <div className="flex flex-col items-center text-center space-y-1 z-10">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                              order.status === 'In Progress'
                                ? 'bg-amber-500 border-amber-400 text-gray-950 scale-110 shadow-lg shadow-amber-950/20'
                                : ['In Progress', 'Ready', 'Delivered'].includes(order.status)
                                  ? 'bg-purple-600 border-purple-500 text-white'
                                  : 'bg-gray-900 border-white/10 text-gray-500'
                            }`}>
                              <Scissors className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-bold ${
                              order.status === 'In Progress' 
                                ? 'text-amber-400' 
                                : ['In Progress', 'Ready', 'Delivered'].includes(order.status)
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                            }`}>
                              Stitching Started
                            </span>
                          </div>

                          {/* Step 3: Ready */}
                          <div className="flex flex-col items-center text-center space-y-1 z-10">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                              order.status === 'Ready'
                                ? 'bg-amber-500 border-amber-400 text-gray-950 scale-110 shadow-lg shadow-amber-950/20'
                                : ['Ready', 'Delivered'].includes(order.status)
                                  ? 'bg-purple-600 border-purple-500 text-white'
                                  : 'bg-gray-900 border-white/10 text-gray-500'
                            }`}>
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-bold ${
                              order.status === 'Ready' 
                                ? 'text-amber-400' 
                                : ['Ready', 'Delivered'].includes(order.status)
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                            }`}>
                              Ready
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="border-t border-white/5 pt-4 space-y-4">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>Order Pricing Details</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                            <span className="text-gray-500 block uppercase font-semibold text-[9px] mb-0.5">{t('amountPaid').replace(' (₹)', '')}</span>
                            <strong className="text-emerald-400 text-xs font-semibold">₹{order.advance_amount}</strong>
                          </div>
                          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                            <span className="text-gray-500 block uppercase font-semibold text-[9px] mb-0.5">{t('remainingBalance')}</span>
                            <strong className={`text-xs font-semibold ${order.balance_amount > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                              ₹{order.balance_amount}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Booking & Delivery Date card */}
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-xs flex justify-between items-center gap-4">
                        <div className="flex space-x-6 sm:space-x-12">
                          <div>
                            <span className="text-gray-500 block uppercase font-semibold text-[9px] mb-0.5">{t('booked')}</span>
                            <strong className="text-white font-heading text-xs sm:text-sm">{order.order_date}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 block uppercase font-semibold text-[9px] mb-0.5">{t('deliveryDate')}</span>
                            <strong className="text-purple-400 font-heading text-xs sm:text-sm">{order.delivery_date}</strong>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' :
                          order.payment_status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {order.payment_status === 'Paid' ? t('paymentPaid') :
                           order.payment_status === 'Partially Paid' ? t('paymentPartiallyPaid') :
                           t('paymentPending')}
                        </span>
                      </div>

                      {/* Payment installments history */}
                      {order.payments && order.payments.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Payment Installments Logs</span>
                          <div className="space-y-1.5">
                            {order.payments.map((p, idx) => (
                              <div key={p.id} className="flex justify-between items-center text-xs py-1.5 border-t border-white/5 text-gray-300">
                                <span>Installment #{idx + 1} ({p.payment_method})</span>
                                <span className="font-bold text-emerald-400">+ ₹{p.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Notifications list & Measurements */}
            <div className="space-y-6">
              
              {/* Notifications feed */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white font-heading">Reminders & Alerts</h3>
                </div>

                {dashboardData?.notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">{t('noNotifications')}</p>
                ) : (
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                    {dashboardData?.notifications.map(n => (
                      <div key={n.id} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1 text-xs">
                        <div className="font-bold text-white">{n.title}</div>
                        <p className="text-[11px] text-gray-400">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer measurements viewer */}
              {dashboardData?.measurements && (
                <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                    <Ruler className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-bold text-white font-heading">{t('measurementsTitle')}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'chest', label: t('chest') },
                      { key: 'waist', label: t('waist') },
                      { key: 'shoulder', label: t('shoulder') },
                      { key: 'sleeve', label: t('sleeve') },
                      { key: 'length', label: t('length') },
                      { key: 'neck', label: t('neck') },
                      { key: 'hip', label: t('hip') }
                    ].map(field => (
                      <div key={field.key} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-gray-500 uppercase">{field.label.split(' ')[0]}</span>
                        <strong className="text-white">
                          {dashboardData.measurements[field.key] ? `${dashboardData.measurements[field.key]}"` : '-'}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {dashboardData.measurements.notes && (
                    <div className="text-xs bg-white/5 p-3 rounded-xl border border-white/5 text-gray-400 text-left">
                      <span className="font-bold text-white block mb-1">Tailor Notes:</span>
                      {dashboardData.measurements.notes}
                    </div>
                  )}

                  {dashboardData.measurements.reference_image_url && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Reference Sketch</span>
                      <div className="bg-white/5 border border-white/5 rounded-xl p-2 h-32 flex items-center justify-center overflow-hidden">
                        <img
                          src={dashboardData.measurements.reference_image_url}
                          alt="Reference Sketch"
                          className="max-h-full object-contain rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
