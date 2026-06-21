"use client";

import { Activity, BarChart2, Bell, ChevronLeft, Compass, Filter, Settings, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useDashboard } from "@/context/DashboardContext";
import { Tooltip } from "@/components/ui/Tooltip";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/", icon: Activity, label: "Live Feed" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/watchlist", icon: Compass, label: "Watchlist" },
  { href: "/wallets", icon: Wallet, label: "Wallets" },
  { href: "/alerts", icon: Bell, label: "Alerts", badge: "3" },
  { href: "/filters", icon: Filter, label: "Filters" },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarLinkProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

function SidebarLink({ item, isActive, collapsed }: SidebarLinkProps) {
  const Icon = item.icon;

  const inner = (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
        "text-text-secondary hover:text-text-primary",
        isActive
          ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/15"
          : "hover:bg-surface-3"
      )}
    >
      <Icon
        size={16}
        strokeWidth={isActive ? 2.5 : 1.75}
        className={cn("shrink-0", isActive && "text-accent-cyan")}
      />
      {!collapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
      {item.badge && !collapsed && (
        <span className="ml-auto text-2xs font-bold px-1.5 py-0.5 rounded-full bg-accent-red text-white min-w-[18px] text-center">
          {item.badge}
        </span>
      )}
      {item.badge && collapsed && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-red" />
      )}
    </Link>
  );

  if (collapsed) {
    return <Tooltip content={item.label} side="right">{inner}</Tooltip>;
  }

  return inner;
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useDashboard();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 h-screen sticky top-0",
        "bg-surface-1 border-r border-border-subtle",
        "transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-14 px-3 border-b border-border-subtle shrink-0",
        sidebarCollapsed ? "justify-center" : "gap-2.5")}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shrink-0">
          <Activity size={14} className="text-white" strokeWidth={2.5} />
        </div>
        {!sidebarCollapsed && (
          <span className="text-md font-bold gradient-text-cyan tracking-tight">Whale Tracker</span>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {PRIMARY_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-3 border-t border-border-subtle space-y-0.5">
        {BOTTOM_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            collapsed={sidebarCollapsed}
          />
        ))}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
            "text-text-secondary hover:text-text-primary hover:bg-surface-3",
            "transition-colors duration-150",
            sidebarCollapsed && "justify-center"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={16}
            strokeWidth={1.75}
            className={cn("shrink-0 transition-transform duration-300", sidebarCollapsed && "rotate-180")}
          />
          {!sidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
