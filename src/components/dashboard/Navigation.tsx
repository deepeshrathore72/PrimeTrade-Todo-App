'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
              <span className="text-lg font-bold text-slate-800">PrimeTrade</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 transition-colors ${
                      isActive
                        ? 'text-primary-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-primary-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center p-3 rounded-lg bg-slate-50">
              {user && (
                <Avatar
                  src={user.avatar}
                  fallback={getInitials(user.firstName, user.lastName)}
                  size="md"
                />
              )}
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center w-full px-4 py-3 mt-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const Header: React.FC<{
  onMenuClick: () => void;
  title: string;
}> = ({ onMenuClick, title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-4"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/dashboard/profile">
            {user && (
              <Avatar
                src={user.avatar}
                fallback={getInitials(user.firstName, user.lastName)}
                size="sm"
                className="cursor-pointer hover:ring-primary-300"
              />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
