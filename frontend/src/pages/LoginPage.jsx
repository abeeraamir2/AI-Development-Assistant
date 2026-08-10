import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Auth.css";

function LoginPage({ setAuthToken, setUserRole }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        setError(null);

        try {
        const response = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
            email,
            password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
            errorData.detail || "Login failed"
            );
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
        <div className="auth-page">

        {/* LEFT SIDE */}
        <div className="auth-brand">

            <div className="brand-logo">
            <span className="brand-icon">▣</span>

            <span>DevPilot</span>

            <span className="brand-badge">
                AI Development Assistant
            </span>
            </div>


            <div className="brand-content">

            <h1>
                Turn requirements into
                <br />
                implementation-ready
                <br />
                intelligence.
            </h1>

            <p>
                Analyze software requirements and transform them
                into structured engineering artifacts with AI.
                Streamline your workflow from ideation to deployment.
            </p>

            </div>


            <div className="brand-footer">
            <span>♧</span>
            Built for developers, analysts, and modern engineering teams.
            </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="auth-form-section">

            <div className="auth-card login-card">

            <h2>
                Welcome back
            </h2>

            <p className="auth-subtitle">
                Sign in to continue to your AI workspace.
            </p>


            <form onSubmit={handleLogin}>

                {/* EMAIL */}

                <div className="form-group">

                <label>
                    Email address
                </label>

                <div className="input-wrapper">

                    <span className="input-icon">
                    ✉
                    </span>

                    <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />

                </div>

                </div>


                {/* PASSWORD */}

                <div className="form-group">

                <label>
                    Password
                </label>

                <div className="input-wrapper">

                    <span className="input-icon">
                    🔒
                    </span>

                    <input
                    type={
                        showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    required
                    />

                    <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                        setShowPassword(!showPassword)
                    }
                    >
                    {showPassword ? "◉" : "◌"}
                    </button>

                </div>

                </div>


                {/* REMEMBER / FORGOT */}

                <div className="login-options">

                <label className="remember-me">

                    <input
                    type="checkbox"
                    />

                    <span>
                    Remember me
                    </span>

                </label>


                <button
                    type="button"
                    className="forgot-password"
                    onClick={() => {
                    // We'll implement this later
                    }}
                >
                    Forgot password?
                </button>

                </div>


                {/* ERROR */}

                {error && (
                <div className="auth-error">
                    {error}
                </div>
                )}


                {/* LOGIN BUTTON */}

                <button
                type="submit"
                className="auth-submit"
                >
                Sign In
                <span>→</span>
                </button>

            </form>


            {/* DIVIDER */}

            <div className="divider">
                <span>OR</span>
            </div>


            {/* SOCIAL LOGIN */}

            <div className="social-buttons">

                <button
                type="button"
                className="social-button"
                >
                <span className="google-icon">
                    G
                </span>

                Continue with Google
                </button>


                <button
                type="button"
                className="social-button"
                >
                <span>
                    ◉
                </span>

                Continue with GitHub
                </button>

            </div>


            {/* SIGNUP */}

            <p className="auth-switch">

                Don't have an account?

                <button
                type="button"
                onClick={() => navigate("/signup")}
                >
                Create account
                </button>

            </p>

            </div>

        </div>

        </div>
    );
}

export default LoginPage;