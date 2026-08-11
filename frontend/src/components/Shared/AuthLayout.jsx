import "../../css/Auth.css";
import DevAssistLogo from "../../assets/DevAssistLogo.png";

function AuthLayout({ children }) {
    return (
        <div className="authPage">
            <div className="authPanel">
                <div className="authBrandSide">
                    <div className="authLogo">
                        <img src={DevAssistLogo} alt="DevAssist logo" />
                        <div className="authLogoText">
                            <span className="authLogoName">DevAssist</span>
                            <span className="authLogoTagline">AI Development Assistant</span>
                        </div>
                    </div>

                    <div className="authPitchCard">
                        <h2>AI-Powered Requirement Intelligence</h2>
                        <p>
                            Upload a requirement document and get instant AI-generated
                            summaries, acceptance criteria, API specs, and dev tasks.
                        </p>
                        <div className="authStats">
                            <div>
                                <span className="statNumber">10x</span>
                                <span className="statLabel">Faster Analysis</span>
                            </div>
                            <div>
                                <span className="statNumber">0%</span>
                                <span className="statLabel">Context Lost</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="authFormSide">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;