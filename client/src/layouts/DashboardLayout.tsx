import { NavLink, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/context/AuthContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

interface NavItem {
  label: string;
  to: string;
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  roleLabel: string;
}

export function DashboardLayout({ navItems, roleLabel }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="flex w-60 flex-col border-r border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-5 py-4">
          <p className="font-display text-lg font-semibold text-brand-600">{t("common.appName")}</p>
          <p className="text-xs text-ink-500">{roleLabel}</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-ink-100 p-3">
          <LanguageToggle />
          <p className="truncate px-2 text-xs text-ink-500">{user?.email}</p>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-ink-100"
          >
            <LogOut size={16} /> {t("common.logout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}