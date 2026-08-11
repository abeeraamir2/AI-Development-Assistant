import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/Shared/AuthLayout";

function LoginPage({ setAuthToken, setUserRole }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleLogin() {
        setError(null);
        try {
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Login failed");
            }

            const data = await response.json();
            setAuthToken(data.access_token);
            setUserRole(data.role);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <AuthLayout>
            <h2>Welcome back</h2>
            <p className="authSubtext">Log in to continue analyzing requirements.</p>

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
            </div>

            <button className="authSubmitButton" onClick={handleLogin}>
                Log In →
            </button>

            <p className="authSwitchText">
                Don't have an account? <Link to="/register">Sign up</Link>
            </p>
        </AuthLayout>
    );
}

export default LoginPage;