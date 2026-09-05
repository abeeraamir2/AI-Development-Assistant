// src/pages/settings/SettingsPage.jsx
import React, { useState } from "react";
import { Toaster } from "sonner";
import SettingsNavigation from "../../components/Settings/SettingsNavigation";
import ProfileSection from "../../components/Settings/ProfileSection";
import SecuritySection from "../../components/Settings/SecuritySection";
import NotificationsSection from "../../components/Settings/NotificationsSection";
import AppearanceSection from "../../components/Settings/AppearanceSection";
import AccountSection from "../../components/Settings/AccountSection";

export default function SettingsPage({
  authToken,
  userRole,
  userEmail,
  theme,
  setTheme,
  onLogout,
}) {
  const [activeSection, setActiveSection] = useState("profile");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            userEmail={userEmail}
            userRole={userRole}
            authToken={authToken}
          />
        );
      case "security":
        return <SecuritySection authToken={authToken} />;
      case "notifications":
        return <NotificationsSection authToken={authToken} />;
      case "appearance":
        return <AppearanceSection theme={theme} setTheme={setTheme} />;
      case "account":
        return (
          <AccountSection
            userEmail={userEmail}
            userRole={userRole}
            authToken={authToken}
            onLogout={onLogout}
          />
        );
      default:
        return (
          <ProfileSection
            userEmail={userEmail}
            userRole={userRole}
            authToken={authToken}
          />
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Toaster position="top-right" richColors />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Manage your personal profile, credentials, notifications, and application preferences.
          </p>
        </div>

        {/* Settings Layout: Left Nav + Right Content Area */}
        <div className="flex flex-col lg:flex-row items-start gap-6 pt-2">
          {/* Navigation */}
          <SettingsNavigation
            activeSection={activeSection}
            onSelectSection={setActiveSection}
          />

          {/* Active Section Content Container */}
          <div className="flex-1 w-full min-w-0">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
