import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import AuthLayout from "../components/Shared/AuthLayout";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // For HttpOnly Cookies
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid login credentials");
      }

      const data = await res.json();
      
      // Store token if returned (for backward compatibility)
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }
      
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Toaster position="top-right" richColors />
      
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-slate-500 mt-1.5">
          Log in to continue analyzing requirements.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="w-full px-4 py-3 rounded-xl bg-[#edf3ff] border border-transparent focus:border-[#3b82f6] focus:bg-white text-xs font-medium text-slate-800 focus:outline-none transition-all placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            className="w-full px-4 py-3 rounded-xl bg-[#edf3ff] border border-transparent focus:border-[#3b82f6] focus:bg-white text-xs font-medium text-slate-800 focus:outline-none transition-all placeholder-slate-400"
          />
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <span>Log In &rarr;</span>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-8 text-center text-xs text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-[#3b82f6] font-semibold hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}