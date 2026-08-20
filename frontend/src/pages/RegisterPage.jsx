import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Loader2, ChevronDown, Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/Shared/AuthLayout";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Developer");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: "", color: "text-slate-400", width: "0%" };
    if (pwd.length < 6) return { label: "Weak", color: "text-rose-500", width: "33%" };
    if (pwd.length < 10) return { label: "Good", color: "text-amber-500", width: "66%" };
    return { label: "Strong", color: "text-emerald-500", width: "100%" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create account");
      }

      toast.success("Account created successfully! Please sign in.");
      navigate("/login");
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create your account
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Start turning requirements into engineering intelligence.
        </p>
      </div>

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
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
            className="w-full px-4 py-2.5 rounded-xl bg-[#edf3ff] border border-transparent focus:border-[#4d8bf8] focus:bg-white text-xs font-medium text-slate-800 focus:outline-none transition-all placeholder-slate-400"
          />
        </div>

        {/* Password Field with Show/Hide Eye */}
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
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#edf3ff] border border-transparent focus:border-[#4d8bf8] focus:bg-white text-xs font-medium text-slate-800 focus:outline-none transition-all placeholder-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <div className="h-1 w-full bg-slate-200 rounded-full mr-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    strength.label === "Weak"
                      ? "bg-rose-500"
                      : strength.label === "Good"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: strength.width }}
                />
              </div>
              <span className={`font-semibold shrink-0 ${strength.color}`}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password Field with Show/Hide Eye */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-[#edf3ff] border text-xs font-medium text-slate-800 focus:outline-none transition-all placeholder-slate-400 ${
                confirmPassword && confirmPassword !== password
                  ? "border-rose-300 focus:border-rose-500"
                  : "border-transparent focus:border-[#4d8bf8] focus:bg-white"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <span className="text-[11px] text-rose-500 font-medium mt-1 block">
              Passwords do not match
            </span>
          )}
        </div>

        {/* Role Selector Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Role
          </label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-xl bg-[#edf3ff] border border-transparent focus:border-[#4d8bf8] focus:bg-white text-xs font-medium text-slate-800 focus:outline-none transition-all cursor-pointer pr-10"
            >
              <option value="Developer">Developer</option>
              <option value="QA">QA Engineer</option>
              <option value="Admin">Admin</option>
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <span>Create Account &rarr;</span>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#4d8bf8] font-semibold hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}