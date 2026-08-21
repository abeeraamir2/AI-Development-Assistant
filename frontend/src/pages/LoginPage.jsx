import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/Shared/AuthLayout";
import { consumeAuthToastMessage } from "../utils/handleAuthError";

export default function LoginPage({ setAuthToken, setUserRole, setUserEmail }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const message = consumeAuthToastMessage();
    if (message) {
      toast.error(message);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid email or password");
      }

      const data = await res.json();
      
      // Backend response fields check (token, role, email, name)
      const token = data.access_token || data.token || "logged_in_token";
      const role = data.role || data.user?.role || "Developer";
      const userMail = data.email || data.user?.email || email;
      const userName = data.name || data.user?.name || userMail.split("@")[0];

      // 1. Save in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", userMail);
      localStorage.setItem("userName", userName);

      // 2. Update App.jsx State immediately so Router unblocks
      if (setAuthToken) setAuthToken(token);
      if (setUserRole) setUserRole(role);
      if (setUserEmail) setUserEmail(userMail);

      toast.success(`Welcome back, ${userName}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Log in to continue analyzing requirements.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            className="w-full h-11 px-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#4d8bf8] focus:ring-3 focus:ring-[#4d8bf8]/15 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#4d8bf8] focus:ring-3 focus:ring-[#4d8bf8]/15 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 h-11 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <span>Log In &rarr;</span>
          )}
        </button>
      </form>

      {/* Switch Link */}
      <div className="mt-8 text-center text-xs text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-[#4d8bf8] font-bold hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}