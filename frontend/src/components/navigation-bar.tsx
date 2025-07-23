"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Users,
  Stethoscope,
  UserCheck,
  Home,
  Menu,
  X,
  ChevronDown,
  Bell,
  LogOut,
  User,
} from "lucide-react";
import { useAssistanceRequests } from "@/hooks/use-assistance-requests";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface NavigationBarProps {
  className?: string;
}

export const NavigationBar = ({ className = "" }: NavigationBarProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pendingCount } = useAssistanceRequests();
  const { user, isAuthenticated, signOut, isSigningOut } = useAuth();

  // Determine color palette based on current page
  const getColorPalette = () => {
    if (pathname.includes('/staff')) {
      return {
        bg: '#F5E8DF', // Warm Sand
        border: '#EDDCC7', // Soft Beige
        icon: '#A66B42', // Rich Brown
        text: '#5D321A', // Dark Chocolate
        activeBg: '#EDDCC7',
        hoverBg: '#F5E8DF',
        ring: '#A66B42'
      };
    } else if (pathname.includes('/doctor')) {
      return {
        bg: '#EBF1F8', // Pale Sky
        border: '#D8E4F0', // Soft Steel
        icon: '#5C7B9E', // Ocean Blue
        text: '#243A56', // Midnight Blue
        activeBg: '#D8E4F0',
        hoverBg: '#EBF1F8',
        ring: '#5C7B9E'
      };
    } else {
      // Default green palette for home, patient, check-in
      return {
        bg: '#EDF5E9', // Soft Meadow
        border: '#E0ECDB', // Spring Dew
        icon: '#6B9A65', // Forest Green
        text: '#2D5A29', // Forest Shadow
        activeBg: '#E0ECDB',
        hoverBg: '#EDF5E9',
        ring: '#6B9A65'
      };
    }
  };

  const colors = getColorPalette();

  const navigationItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/check-in",
      label: "Check In",
      icon: Heart,
      active: pathname === "/check-in",
    },
    {
      href: "/patient",
      label: "Patient Portal",
      icon: UserCheck,
      active: pathname === "/patient",
    },
    {
      href: "/doctor",
      label: "Doctor Dashboard",
      icon: Stethoscope,
      active: pathname === "/doctor",
    },
    {
      href: "/staff",
      label: "Staff Dashboard",
      icon: Users,
      active: pathname === "/staff",
    },
  ];

  return (
    <nav 
      className={`border-b sticky top-0 z-50 ${className}`}
      style={{ 
        backgroundColor: colors.bg,
        borderColor: colors.border 
      }}
      role="banner"
      aria-label="Main navigation"
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-12">
          {/* Logo - Mobile Optimized */}
          <Link href="/" className="flex items-center gap-3" aria-label="CarePulse - Healthcare Management Home">
            <div className="w-8 h-8 md:w-6 md:h-6 rounded-sm flex items-center justify-center" style={{ backgroundColor: colors.icon }}>
              <Heart className="h-4 w-4 md:h-3.5 md:w-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="text-lg md:text-base font-bold md:font-semibold" style={{ color: colors.text }}>
              CarePulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main menu">
            {navigationItems.slice(1).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors rounded-xs focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                    item.active
                      ? "border"
                      : "text-gray-600 hover:text-gray-900 border border-transparent"
                  }`}
                  style={{
                    backgroundColor: item.active ? colors.activeBg : 'transparent',
                    color: item.active ? colors.text : undefined,
                    borderColor: item.active ? colors.border : 'transparent',
                    '--tw-ring-color': colors.ring
                  }}
                  onMouseEnter={(e) => {
                    if (!item.active) {
                      e.currentTarget.style.backgroundColor = colors.hoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                  {item.href === "/staff" && pendingCount > 0 && (
                    <span 
                      className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full"
                      aria-label={`${pendingCount} pending assistance requests`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-6 ml-6">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <User className="h-3.5 w-3.5" />
                  <span>{user.name || user.email}</span>
                </div>
                <Button
                  onClick={signOut}
                  disabled={isSigningOut}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </Button>
              </div>
            ) : (
              <div className="border-l border-gray-200 pl-6 ml-6">
                <Link href="/sign-in">
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <User className="h-3 w-3 mr-1" />
                    Sign in
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button - Improved Touch Target */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation - Enhanced Touch Experience */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200" role="navigation" aria-label="Mobile menu">
            <div className="space-y-2">
              {navigationItems.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={item.active ? "page" : undefined}
                    className={`flex items-center gap-4 px-4 py-3 text-base font-semibold transition-colors rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 border ${
                      item.active
                        ? "border"
                        : "text-gray-700 hover:text-gray-900 active:bg-gray-100 border-transparent"
                    }`}
                    style={{
                      backgroundColor: item.active ? colors.activeBg : 'transparent',
                      color: item.active ? colors.text : undefined,
                      borderColor: item.active ? colors.border : 'transparent',
                      '--tw-ring-color': colors.ring
                    }}
                    onMouseEnter={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.backgroundColor = colors.hoverBg;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {item.label}
                    {item.href === "/staff" && pendingCount > 0 && (
                      <span 
                        className="ml-auto px-2 py-1 bg-red-500 text-white text-sm font-medium rounded-full"
                        aria-label={`${pendingCount} pending assistance requests`}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* Mobile Auth Section - Enhanced Touch */}
              <div className="border-t pt-3 mt-3" style={{ borderColor: colors.border }}>
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 px-4 py-3 text-base text-gray-600 rounded-sm" style={{ backgroundColor: colors.bg }}>
                      <User className="h-5 w-5" />
                      <span className="font-medium">{user.name || user.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={isSigningOut}
                      className="flex items-center gap-4 px-4 py-3 text-base font-semibold text-gray-600 hover:text-gray-900 rounded-sm w-full text-left transition-colors active:scale-95"
                      style={{ 
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0ECDB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut className="h-5 w-5" />
                      {isSigningOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 text-base font-semibold text-gray-600 hover:text-gray-900 rounded-sm transition-colors active:scale-95"
                    style={{ 
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0ECDB'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User className="h-5 w-5" />
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};