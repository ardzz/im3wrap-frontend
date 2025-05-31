'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useIM3 } from '@/lib/hooks/use-im3';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  History,
  Package2,
  Smartphone,
  User,
  LogOut,
  CheckCircle,
  ChevronDown,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const { isIM3Linked } = useIM3();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navigationItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      active: isActive('/dashboard')
    },
    {
      href: '/packages',
      icon: Package2,
      label: 'Packages',
      active: isActive('/packages')
    },
    {
      href: '/transactions',
      icon: History,
      label: 'Transactions',
      active: isActive('/transactions')
    },
    {
      href: '/im3',
      icon: Smartphone,
      label: 'IM3 Account',
      active: isActive('/im3'),
      badge: isIM3Linked
    }
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">IM3Wrap</h1>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.active
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <CheckCircle className="h-3 w-3 text-green-600 ml-1" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Mobile + Desktop User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <h2 className="text-lg font-semibold">IM3Wrap</h2>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-base">
                            {getUserInitials(user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-base">{user.username}</p>
                          <p className="text-sm text-gray-500 break-all">{user.email || 'No email'}</p>
                        </div>
                      </div>
                      {isIM3Linked && (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs mt-3">
                          IM3 Account Linked
                        </Badge>
                      )}
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex-1 p-6">
                      <div className="space-y-2">
                        {navigationItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                item.active
                                  ? 'text-primary bg-primary/10'
                                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </nav>

                    {/* Mobile Footer Actions */}
                    <div className="border-t p-6 space-y-2">
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <User className="h-5 w-5" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden lg:flex">
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 h-10 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getUserInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getUserInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.username}</p>
                        <p className="text-xs text-gray-500 break-all">{user.email || 'No email'}</p>
                      </div>
                    </div>
                    {isIM3Linked && (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs mt-2">
                        IM3 Account Linked
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/im3" className="flex items-center cursor-pointer">
                      <Smartphone className="mr-2 h-4 w-4" />
                      IM3 Account
                      {isIM3Linked && (
                        <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/transactions" className="flex items-center cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      Transaction History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}