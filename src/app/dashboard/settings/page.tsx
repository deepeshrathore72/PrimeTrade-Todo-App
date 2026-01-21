'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Palette, HelpCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
              <p className="text-sm text-slate-500">
                Manage your notification preferences
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Email Notifications</p>
              <p className="text-sm text-slate-500">
                Receive email updates about your tasks
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Task Reminders</p>
              <p className="text-sm text-slate-500">
                Get reminded about upcoming due dates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">Weekly Summary</p>
              <p className="text-sm text-slate-500">
                Receive a weekly summary of your progress
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
              <p className="text-sm text-slate-500">
                Customize how the app looks
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">Theme</p>
              <p className="text-sm text-slate-500">Select your preferred theme</p>
            </div>
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="light">Light</option>
              <option value="dark" disabled>Dark (Coming soon)</option>
              <option value="system" disabled>System (Coming soon)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Privacy & Security</h2>
              <p className="text-sm text-slate-500">
                Manage your data and security
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Two-Factor Authentication</p>
              <p className="text-sm text-slate-500">
                Add an extra layer of security
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">Export Data</p>
              <p className="text-sm text-slate-500">
                Download a copy of your data
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Help & Support</h2>
              <p className="text-sm text-slate-500">
                Get help and learn more
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <a
            href="#"
            className="flex items-center justify-between py-3 border-b border-slate-100 hover:bg-slate-50 -mx-6 px-6 transition-colors"
          >
            <div>
              <p className="font-medium text-slate-900">Documentation</p>
              <p className="text-sm text-slate-500">Learn how to use the app</p>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-400" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between py-3 border-b border-slate-100 hover:bg-slate-50 -mx-6 px-6 transition-colors"
          >
            <div>
              <p className="font-medium text-slate-900">Contact Support</p>
              <p className="text-sm text-slate-500">We&apos;re here to help</p>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-400" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-6 px-6 transition-colors"
          >
            <div>
              <p className="font-medium text-slate-900">Privacy Policy</p>
              <p className="text-sm text-slate-500">How we handle your data</p>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-400" />
          </a>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Delete Account</p>
              <p className="text-sm text-slate-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="danger" size="sm" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
