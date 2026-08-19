import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/Shared/AuthLayout";

function calculatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Developer");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const strength = calculatePasswordStrength(password);
    const strengthLabel = ["Very weak", "Weak", "Okay", "Good", "Strong"][strength];

    async function handleRegister() {
        setError(null);
        try {
            const response = await fetch("http://localhost:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Registration failed");
            }

            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <AuthLayout>
            <h2>Create your account</h2>
            <p className="authSubtext">Start turning requirements into engineering intelligence.</p>

            {error && <p className="authErrorMessage">{error}</p>}

            <div className="authField">
                <label>Email</label>
                <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="authField">
                <label>Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="strengthBar">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={
                                i < strength
                                    ? `strengthSegment filled-${strength <= 1 ? "weak" : strength <= 2 ? "medium" : "strong"}`
                                    : "strengthSegment"
                            }
                        />
                    ))}
                </div>
                {password && <p className="strengthLabel">{strengthLabel}</p>}
            </div>

            <div className="authField">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Developer">Developer</option>
                    <option value="QA">QA</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>

            <button className="authSubmitButton" onClick={handleRegister}>
                Create Account →
            </button>

            <p className="authSwitchText">
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </AuthLayout>
    );
}

export default RegisterPage;