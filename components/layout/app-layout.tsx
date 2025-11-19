'use client';

import { Sidebar } from './sidebar';
import { useResponsive } from '@/hooks/common/use-responsive';
import { useTransitionStyles } from '@/hooks/common/use-transition-styles';
import { SidebarProvider, useSidebar } from '@/hooks/common/use-sidebar';

type AppLayoutProps = {
  children: React.ReactNode;
};

// Create an inner layout component that uses the sidebar context
function AppLayoutInner({ children }: AppLayoutProps) {
  // Use our shared responsive hooks with updated breakpoints
  const { useBottomNav, useCollapsibleSidebar, useFixedSidebar } = useResponsive();
  const { contentStyles } = useTransitionStyles();
  const { sidebarOpen } = useSidebar();

  // Main app layout with sidebar - always show sidebar since this component
  // is only used by pages that should have sidebar
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Only rendered on tablet/desktop */}
      {!useBottomNav && <Sidebar isDesktopSidebar={true} />}
      
      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col"
        style={{
          transition: 'all 0.3s ease-in-out',
          width: '100%',
        }}
      >
        {/* Content with responsive padding based on sidebar state */}
        <main 
          className="flex-1 overflow-y-auto"
          style={{
            ...contentStyles,
            transition: 'all 0.3s ease-in-out',
            // Add bottom padding on mobile for the navigation bar
            paddingBottom: useBottomNav ? '4rem' : contentStyles.paddingBottom,
            // Add left padding on desktop/tablet if sidebar is visible
            paddingLeft: !useBottomNav ? 
              (sidebarOpen ? '1rem' : '0.5rem') : 
              contentStyles.paddingLeft,
          }}
        >
          {children}
        </main>
      </div>
      
      {/* Bottom Navigation for mobile */}
      {useBottomNav && <Sidebar isDesktopSidebar={false} />}
    </div>
  );
}// Main layout component that provides the sidebar context
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SidebarProvider>
  );
}