import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import { User, Building2, Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Fair', color: 'bg-orange-500' },
      { strength: 3, label: 'Good', color: 'bg-yellow-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' },
      { strength: 5, label: 'Very Strong', color: 'bg-green-600' },
    ];

    return levels[Math.min(strength, 5)];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      console.log("Registration success:", response.data);
      
      toast.success("Account created successfully!", {
        icon: "🎉",
        duration: 2000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration Error:", error);
      const errorMsg =
        error.response?.data?.detail || "Registration failed. Try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center py-12 px-4">
      <Toaster position="top-center" />

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        
        {/* Card Header with Logo/Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join CampusCareer</h1>
          <p className="text-gray-600">Start your journey to the perfect opportunity</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8">
          
          {/* Role Selector - Modern Toggle Style */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              I'm joining as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "student" })}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                  formData.role === "student"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-xl ${
                    formData.role === "student" ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    <User className={`w-5 h-5 ${
                      formData.role === "student" ? "text-blue-600" : "text-gray-400"
                    }`} />
                  </div>
                  <span className={`font-semibold text-sm ${
                    formData.role === "student" ? "text-blue-900" : "text-gray-600"
                  }`}>
                    Student
                  </span>
                </div>
                {formData.role === "student" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "company" })}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                  formData.role === "company"
                    ? "border-purple-600 bg-purple-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-xl ${
                    formData.role === "company" ? "bg-purple-100" : "bg-gray-100"
                  }`}>
                    <Building2 className={`w-5 h-5 ${
                      formData.role === "company" ? "text-purple-600" : "text-gray-400"
                    }`} />
                  </div>
                  <span className={`font-semibold text-sm ${
                    formData.role === "company" ? "text-purple-900" : "text-gray-600"
                  }`}>
                    Company
                  </span>
                </div>
                {formData.role === "company" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  </div>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name / Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.role === "company" ? "Company Name" : "Full Name"}
              </label>
              <div className="relative">
                {formData.role === "company" ? (
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  placeholder={
                    formData.role === "company" ? "Tech Solutions Inc." : "John Doe"
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  placeholder="mail@example.com"
                />
              </div>
            </div>

            {/* Password with Strength Indicator */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use 8+ characters with letters, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                Sign in instead
              </Link>
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>By registering, you agree to our Terms & Privacy Policy</p>
          </div>
        </div>

        {/* Benefits Section Below Card */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">10K+</div>
            <div className="text-xs text-gray-600">Active Users</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
            <div className="text-2xl font-bold text-purple-600 mb-1">500+</div>
            <div className="text-xs text-gray-600">Companies</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
            <div className="text-2xl font-bold text-green-600 mb-1">95%</div>
            <div className="text-xs text-gray-600">Match Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;