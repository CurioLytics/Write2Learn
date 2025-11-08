'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { signOut } from '@/services/client/auth-service';
import { useResponsive } from '@/hooks/common/use-responsive';
import { zIndex } from '@/utils/z-index';
import { cn } from '@/utils/ui';
import { useSidebar } from '@/hooks/common/use-sidebar';

import {
  Home,
  BookOpen,
  MessageCircle,
  BookOpenCheck,
  LogIn,
  LogOut,
} from 'lucide-react';

import styles from './sidebar.module.css';

const navigationItems = [
  { name: 'Home', href: '/dashboard', iconComponent: Home },
  { name: 'Journal', href: '/journal', iconComponent: BookOpen },
  { name: 'Role-play', href: '/roleplay', iconComponent: MessageCircle },
  { name: 'Vocab Hub', href: '/vocab', iconComponent: BookOpenCheck },
];

interface SidebarProps {
  isDesktopSidebar?: boolean;
}

export function Sidebar({ isDesktopSidebar = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { useBottomNav } = useResponsive();
  const { sidebarOpen } = useSidebar();

  if (isDesktopSidebar && useBottomNav) return null;
  if (!isDesktopSidebar && !useBottomNav) return null;

  if (isDesktopSidebar) {
    return (
      <nav
        className={cn(styles.sidebar, styles.collapsed)}
        style={{
          zIndex: zIndex.desktopNavigation,
        }}
      >
        <div className="flex flex-col items-center h-full py-4 gap-2">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center justify-center mb-4"
          >
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo.svg"
                alt="Write2Learn"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Nav Items */}
          <div className="flex flex-col items-center gap-3 flex-grow">
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.iconComponent;
              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      styles.navItem,
                      isActive ? styles.active : styles.inactive
                    )}
                  >
                    <Icon
                      size={22}
                      className={cn(
                        'transition-colors duration-200',
                        isActive
                          ? 'stroke-primary fill-primary/10'
                          : 'stroke-gray-500 group-hover:stroke-primary'
                      )}
                    />
                  </Link>

                  {/* Tooltip label */}
                  <span className={styles.tooltip}>{item.name}</span>
                </div>
              );
            })}
          </div>

          {/* User section */}
          <div className="mt-auto pt-4 border-t border-gray-200 w-full flex flex-col items-center">
            {user ? (
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
                className={cn(styles.navItem, styles.inactive)}
              >
                <LogOut
                  size={22}
                  className="stroke-gray-500 hover:stroke-primary transition-colors duration-200"
                />
              </button>
            ) : (
              <Link
                href="/auth"
                className={cn(styles.navItem, styles.inactive)}
              >
                <LogIn
                  size={22}
                  className="stroke-gray-500 hover:stroke-primary transition-colors duration-200"
                />
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Mobile bottom nav (giữ nguyên)
  return (
    <nav
      className={styles.mobileNav}
      style={{ zIndex: zIndex.mobileNavigation }}
    >
      <div className="flex justify-around items-center py-2 px-1">
        {navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.iconComponent;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                styles.navItem,
                isActive ? styles.active : styles.inactive,
                'flex-col'
              )}
            >
              <Icon
                size={24}
                className={cn(
                  isActive
                    ? 'stroke-primary fill-primary/10'
                    : 'stroke-gray-500'
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
