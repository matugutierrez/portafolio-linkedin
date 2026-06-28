import type { ReactNode } from "react";
import { SiteSidebar, MobileTopBar } from "./site-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ChatWidget } from "./chat-widget";
import { OsThemeSwitcher } from "./os-theme-switcher";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <SiteSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar />
        <main className="flex-1 px-4 sm:px-6 lg:px-12 py-8 pb-24 lg:pb-12 lg:pt-4 max-w-7xl w-full mx-auto">
          <div className="hidden lg:flex items-center justify-end mb-4">
            <OsThemeSwitcher floating={false} />
          </div>
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <ChatWidget />
    </div>
  );
}
