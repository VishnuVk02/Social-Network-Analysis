import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from './authSlice';
import { 
  BarChart3, 
  User, 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Globe, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  Loader2,
  Sparkles
} from 'lucide-react';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Stepper State: 1 (Account Type), 2 (Details), 3 (Security), 4 (Complete)
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('INDIVIDUAL'); // 'INDIVIDUAL' | 'ORGANIZATION'

  // Individual Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Organization Form Fields
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgType, setOrgType] = useState('Company');
  const [industry, setIndustry] = useState('Technology');
  const [country, setCountry] = useState('United States');
  const [orgSize, setOrgSize] = useState('11-50');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Security Fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation Error state
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // If already authenticated and step !== 4, redirect to home
  useEffect(() => {
    if (isAuthenticated && step !== 4) {
      setStep(4);
    }
  }, [isAuthenticated]);

  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
    setValidationError('');
    setStep(2);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (accountType === 'INDIVIDUAL') {
      if (!name.trim() || !email.trim()) {
        setValidationError('Please enter your name and email address.');
        return;
      }
    } else {
      if (!orgName.trim() || !adminName.trim() || !adminEmail.trim()) {
        setValidationError('Please complete the organization name, administrator name, and email.');
        return;
      }
    }
    setStep(3);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    const payload = {
      accountType,
      password,
      ...(accountType === 'INDIVIDUAL' ? { name, email } : {
        orgName,
        orgEmail: orgEmail || adminEmail,
        orgType,
        industry,
        country,
        orgSize,
        adminName,
        adminEmail
      })
    };

    dispatch(registerUser(payload))
      .unwrap()
      .then(() => {
        setStep(4);
      })
      .catch((err) => {
        setValidationError(err || 'Registration failed');
      });
  };

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-slate-700' };
    if (password.length < 6) return { label: 'Weak', color: 'bg-rose-500' };
    if (password.length < 10) return { label: 'Medium', color: 'bg-amber-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 relative overflow-y-auto select-none">
      
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-midnight-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pine-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Glass Container */}
      <div className="w-full max-w-3xl glass-panel p-8 md:p-10 rounded-3xl shadow-2xl relative z-10 space-y-8 my-8 border border-midnight-700/60 bg-midnight-900/85">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Telemetron</h1>
          <p className="text-xs md:text-sm text-pine-300/80">
            Cross-Platform Analytics & Intelligence Platform
          </p>
        </div>

        {/* Progress Stepper (01 Account -> 02 Details -> 03 Security -> 04 Complete) */}
        <div className="flex items-center justify-between max-w-xl mx-auto border-b border-slate-800 pb-6 text-xs">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-brand-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-brand-500 text-white' : 'bg-slate-800'}`}>1</span>
            <span className="hidden sm:inline">Account</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-800"></div>

          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-brand-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-brand-500 text-white' : 'bg-slate-800'}`}>2</span>
            <span className="hidden sm:inline">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-800"></div>

          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-brand-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-brand-500 text-white' : 'bg-slate-800'}`}>3</span>
            <span className="hidden sm:inline">Security</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-800"></div>

          <div className={`flex items-center space-x-2 ${step === 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-emerald-500 text-white' : 'bg-slate-800'}`}>4</span>
            <span className="hidden sm:inline">Complete</span>
          </div>
        </div>

        {/* Global Error Banners */}
        {(validationError || error) && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 text-center font-medium">
            {validationError || error}
          </div>
        )}

        {/* STEP 1: ACCOUNT TYPE SELECTION */}
        {step === 1 && (
          <div className="space-y-6 transition-all duration-500 ease-in-out">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">How will you use Telemetron?</h2>
              <p className="text-xs text-slate-400">Select the account type that best matches your workflow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Individual Card */}
              <div 
                onClick={() => handleAccountTypeSelect('INDIVIDUAL')}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group space-y-4 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">For Myself</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Personal analytics, creator tracking, YouTube & GitHub telemetry, and independent research.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-brand-400 group-hover:translate-x-1 transition-transform">
                  <span>Register Individual Account</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Organization Card */}
              <div 
                onClick={() => handleAccountTypeSelect('ORGANIZATION')}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group space-y-4 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">For My Organization</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Enterprise team workspaces, employee account management, group channels, and organization analytics.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Register Organization Account</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS STAGE */}
        {step === 2 && (
          <form onSubmit={handleDetailsSubmit} className="space-y-6 transition-all duration-500 ease-in-out">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {accountType === 'INDIVIDUAL' ? 'Personal Details' : 'Organization & Administrator Details'}
                </h2>
                <p className="text-xs text-slate-400">Provide profile information for your Telemetron setup.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Type</span>
              </button>
            </div>

            {/* Individual Form Fields */}
            {accountType === 'INDIVIDUAL' ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl glass-input text-white outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl glass-input text-white outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Organization Form Fields */
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-emerald-400" />
                    Organization Profile
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Organization Name</label>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Acme Technologies Inc."
                        className="w-full px-3 py-2.5 text-xs rounded-xl glass-input text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Organization Email (Optional)</label>
                      <input
                        type="email"
                        value={orgEmail}
                        onChange={(e) => setOrgEmail(e.target.value)}
                        placeholder="contact@acme.com"
                        className="w-full px-3 py-2.5 text-xs rounded-xl glass-input text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Industry</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-900 text-slate-200 border border-slate-800 outline-none focus:border-emerald-500"
                      >
                        <option value="Technology">Technology & Software</option>
                        <option value="Finance">Financial Services</option>
                        <option value="Media">Media & Entertainment</option>
                        <option value="Education">Education & Academia</option>
                        <option value="Retail">E-Commerce & Retail</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Organization Size</label>
                      <select
                        value={orgSize}
                        onChange={(e) => setOrgSize(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-900 text-slate-200 border border-slate-800 outline-none focus:border-emerald-500"
                      >
                        <option value="1-10">1-10 Employees</option>
                        <option value="11-50">11-50 Employees</option>
                        <option value="51-200">51-200 Employees</option>
                        <option value="200+">200+ Enterprise</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-brand-400" />
                    Organization Admin Credentials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Admin Full Name</label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        className="w-full px-3 py-2.5 text-xs rounded-xl glass-input text-white outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Admin Work Email</label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="s.jenkins@acme.com"
                        className="w-full px-3 py-2.5 text-xs rounded-xl glass-input text-white outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Continue to Security</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SECURITY STAGE */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6 transition-all duration-500 ease-in-out">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Security & Password</h2>
                <p className="text-xs text-slate-400">Create a secure password to protect your Telemetron account.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Details</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl glass-input text-white outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password && (
                  <div className="flex items-center space-x-2 pt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: password.length > 9 ? '100%' : password.length > 5 ? '60%' : '30%' }}></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl glass-input text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-bold text-sm shadow-glass-brand flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Configuring Account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: ONBOARDING COMPLETION */}
        {step === 4 && (
          <div className="text-center space-y-6 py-6 transition-all duration-500 ease-in-out">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {accountType === 'INDIVIDUAL' ? (
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-white">Welcome to Telemetron!</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your individual account is ready. Access YouTube Analytics, GitHub Analytics, and Trends Index.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-white">Your Organization is Ready</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Telemetron workspace configured for <strong className="text-white">{orgName}</strong>. You are registered as Organization Admin ({adminName}).
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {accountType === 'ORGANIZATION' && (
                <>
                  <button
                    onClick={() => navigate('/groups')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  >
                    Create Workspace Groups
                  </button>
                </>
              )}

              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-xs font-bold text-white shadow-glass-brand transition-all cursor-pointer"
              >
                Go to Telemetron Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Footer Link */}
        <div className="border-t border-slate-800/80 pt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 font-bold hover:underline">
            Sign In to Telemetron
          </Link>
        </div>

      </div>
    </div>
  );
}
