import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Scissors, Phone, Lock, User, Mail, ChevronRight, Languages, AlertCircle, CheckCircle, Eye, EyeOff, Store, MapPin, Globe, ChevronDown, Check } from 'lucide-react';

export default function Login({ initialMode = 'login', onNavigate }) {
  const { login, registerUser, forgotPassword, resetPassword } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'forgot', 'reset'
  const [defaultLang, setDefaultLang] = useState(language);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const langOptions = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी (Hindi)', short: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు (Telugu)', short: 'తెలుగు' }
  ];
  
  // Forgot / Reset Password States
  const [resetPhone, setResetPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  
  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLangChange = (lang) => {
    setDefaultLang(lang);
    changeLanguage(lang);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!name || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const userData = await login(name, password, 'tailor');
      if (userData.role === 'tailor') {
        onNavigate('tailor_dashboard');
      } else {
        // Fallback (should not happen for tailor-only login page)
        onNavigate('home');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!name || !shopName || !phone || !address || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Phone number must contain at least 10 digits');
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      console.log("Calling registerUser from form...");
      const userData = await registerUser(
        name,
        phone,
        email || null,
        password,
        'tailor',
        defaultLang,
        shopName,
        address,
        true // Enable auto-login
      );
      console.log("registerUser resolved in form, user data:", userData);
      localStorage.setItem('just_registered', 'true');
      if (userData && userData.role === 'tailor') {
        console.log("Navigating to tailor_dashboard");
        onNavigate('tailor_dashboard');
      } else {
        console.log("Navigating to home");
        onNavigate('home');
      }
    } catch (err) {
      console.error("handleRegister catch:", err);
      alert("handleRegister failed: " + err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(phone);
      setResetPhone(phone);
      if (res.debug_code) {
        setSimulatedCode(res.debug_code);
        setSuccessMsg(`Reset code simulated successfully!`);
      } else {
        setSuccessMsg(res.message || 'If registered, you will receive a reset code.');
      }
      setMode('reset');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!resetCode || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetPhone, resetCode, password);
      setSuccessMsg('Password reset successfully! Please log in with your new password.');
      setMode('login');
      // Clear password states
      setPassword('');
      setConfirmPassword('');
      setResetCode('');
      setSimulatedCode('');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative animate-fade-in bg-gray-950 bg-stitch-grid">
      
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] glow-spot-purple opacity-70"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] glow-spot-blue opacity-70"></div>
        <div className="absolute top-[30%] right-[15%] w-[35%] h-[35%] glow-spot-pink opacity-50"></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-10 right-10 z-50">
        <button
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center space-x-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-300 transition cursor-pointer select-none"
        >
          <Globe className="w-4 h-4 text-purple-400" />
          <span>
            {language === 'en' ? 'EN' : language === 'hi' ? 'हिन्दी' : 'తెలుగు'}
          </span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isLangOpen && (
          <>
            {/* Click catcher background to close dropdown */}
            <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)}></div>
            
            {/* Dropdown Options */}
            <div className="absolute right-0 mt-2 w-44 rounded-2xl lang-dropdown-menu p-1 z-50 overflow-hidden">
              {langOptions.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    handleLangChange(opt.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex justify-between items-center ${
                    language === opt.code 
                      ? 'bg-purple-500/25 text-purple-300 font-bold border border-purple-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{opt.label}</span>
                  {language === opt.code && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="w-full max-w-xl space-y-6 z-10">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-3 cursor-pointer group" onClick={() => onNavigate('home')}>
          {/* Horizontal Brand Logo */}
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-purple-600/20 to-pink-500/20 border border-purple-500/40 rounded-2xl text-purple-400 group-hover:border-pink-400/50 group-hover:shadow-lg group-hover:shadow-pink-500/10 transition-all duration-300">
              <Scissors className="w-6 h-6 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white transition-all duration-300">
              {language === 'hi' ? (
                <>वस्त्र<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-black">सिलाई</span></>
              ) : language === 'te' ? (
                <>వస్త్ర<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-black">సిలై</span></>
              ) : (
                <>Vastra<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-black">Silai</span></>
              )}
            </h2>
          </div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">Tailor Portal</span>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative text-left hover:border-purple-500/25 hover:shadow-[0_0_50px_-12px_rgba(168,85,247,0.2)] transition-all duration-500">
          
          <div className="mb-6 text-center">
            <h3 className="text-white text-xl font-bold">
              {mode === 'login' ? 'Tailor Login' : 
               mode === 'register' ? 'Tailor Registration' : 
               mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {mode === 'login' ? 'Sign in to access your digital workspace' : 
               mode === 'register' ? 'Create an account to digitize your tailoring shop' : 
               mode === 'forgot' ? 'Enter your registered phone number to receive a reset code' : 
               'Enter the reset code and choose a new password'}
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tailor Name or Phone
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    key="login-username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    key="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input pl-10 pr-10 py-3 rounded-xl text-base"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => { setError(''); setSuccessMsg(''); setMode('forgot'); }}
                    className="text-xs text-purple-400 hover:text-purple-300 transition cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neon-btn py-3.5 rounded-xl font-medium text-white flex items-center justify-center space-x-2 text-base pt-2 cursor-pointer"
              >
                <span>{loading ? t('loading') : t('loginBtn')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Registration Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tailor Name *
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    key="register-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Shop Name *
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="w-5 h-5" />
                  </span>
                  <input
                    key="register-shopname"
                    type="text"
                    name="shopName"
                    autoComplete="off"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter shop name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Phone Number *
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    key="register-phone"
                    type="text"
                    name="phone"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Email Address (Optional)
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    key="register-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Address *
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <input
                    key="register-address"
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter shop address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password *</label>
                  <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                    <input
                      key="register-password"
                      type={showPassword ? "text" : "password"}
                      name="new-password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full glass-input pl-4 pr-10 py-3 rounded-xl text-base"
                      placeholder="••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm *</label>
                  <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                    <input
                      key="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm-password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full glass-input pl-4 pr-10 py-3 rounded-xl text-base"
                      placeholder="••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neon-btn py-3.5 rounded-xl font-medium text-white flex items-center justify-center space-x-2 text-base mt-2 cursor-pointer"
              >
                <span>{loading ? t('loading') : t('registerBtn')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    key="forgot-phone"
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base"
                    placeholder="Enter registered phone number"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neon-btn py-3.5 rounded-xl font-medium text-white flex items-center justify-center space-x-2 text-base pt-2 cursor-pointer"
              >
                <span>{loading ? t('loading') : 'Send Reset Code'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {simulatedCode && (
                <div className="p-3.5 bg-purple-600/10 border border-purple-500/20 text-purple-300 text-xs rounded-xl flex flex-col space-y-1 font-semibold">
                   <span>Simulated SMS Reset Code:</span>
                   <span className="text-white text-sm font-mono tracking-widest">{simulatedCode}</span>
                </div>
              )}

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Reset Code
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    key="reset-code"
                    type="text"
                    name="code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-base font-mono uppercase tracking-widest"
                    placeholder="VS-XXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    key="reset-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input pl-10 pr-10 py-3 rounded-xl text-base"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative focus-within:text-purple-400 text-gray-500 transition-colors duration-200">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    key="reset-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full glass-input pl-10 pr-10 py-3 rounded-xl text-base"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neon-btn py-3.5 rounded-xl font-medium text-white flex items-center justify-center space-x-2 text-base pt-2 cursor-pointer"
              >
                <span>{loading ? t('loading') : 'Reset Password'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Toggle register/login links */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            {mode === 'login' ? (
              <button
                onClick={() => { setError(''); setSuccessMsg(''); setMode('register'); }}
                className="text-sm text-gray-400 hover:text-purple-300 transition cursor-pointer"
              >
                Don't have an account? Register here
              </button>
            ) : (
              <button
                onClick={() => { 
                  setError(''); 
                  setSuccessMsg(''); 
                  setMode('login'); 
                  setPassword(''); 
                  setConfirmPassword(''); 
                  setResetCode(''); 
                  setSimulatedCode('');
                }}
                className="text-sm text-gray-400 hover:text-purple-300 transition cursor-pointer"
              >
                Already have an account? Login here
              </button>
            )}
          </div>

          {/* Back to Home link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold uppercase tracking-wider transition cursor-pointer"
            >
              ← Back to Homepage
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
