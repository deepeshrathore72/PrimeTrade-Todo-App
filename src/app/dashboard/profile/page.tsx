'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, FileText, Camera, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from '@/components/ui/Toaster';
import { getInitials, formatDate } from '@/lib/utils';
import { updateProfileSchema, changePasswordSchema, setPasswordSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export default function ProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hasPassword, setHasPassword] = useState(true); // Assume true, will be updated
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Check if user is OAuth and whether they have a password set
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user?.provider && user.provider !== 'credentials') {
        setIsOAuthUser(true);
        // Fetch user profile to check if password is set
        try {
          const response = await fetch('/api/user/profile', {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            // If the user has provider but no password indication, they don't have password
            // We'll check this server-side when they try to change password
            setHasPassword(data.data?.user?.provider === 'credentials');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
        }
      } else {
        setIsOAuthUser(false);
        setHasPassword(true);
      }
    };
    checkUserStatus();
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      updateProfileSchema.parse(formData);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile updated', 'Your profile has been updated successfully.');
        updateUser(data.data.user);
        setIsEditing(false);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((d: { field: string; message: string }) => {
            fieldErrors[d.field] = d.message;
          });
          setErrors(fieldErrors);
        } else {
          toast.error('Error', data.error || 'Failed to update profile');
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Error', 'Something went wrong');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setIsSubmitting(true);

    try {
      // Use different validation for OAuth users setting password for first time
      if (isOAuthUser && !hasPassword) {
        setPasswordSchema.parse({
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmNewPassword,
        });
      } else {
        changePasswordSchema.parse(passwordData);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (response.ok) {
        const successMessage = isOAuthUser && !hasPassword 
          ? 'Password set successfully! You can now login with email and password.'
          : 'Your password has been updated successfully.';
        toast.success(isOAuthUser && !hasPassword ? 'Password set' : 'Password changed', successMessage);
        setShowPasswordModal(false);
        setHasPassword(true); // Now they have a password
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((d: { field: string; message: string }) => {
            fieldErrors[d.field] = d.message;
          });
          setPasswordErrors(fieldErrors);
        } else {
          toast.error('Error', data.error || 'Failed to change password');
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setPasswordErrors(fieldErrors);
      } else {
        toast.error('Error', 'Something went wrong');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Profile Card */}
      <Card>
        <CardHeader className="border-b-0 pb-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar
                    src={formData.avatar}
                    fallback={getInitials(formData.firstName, formData.lastName)}
                    size="xl"
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <Input
                    label="Avatar URL"
                    value={formData.avatar}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, avatar: e.target.value }))
                    }
                    placeholder="https://example.com/avatar.jpg"
                    error={errors.avatar}
                  />
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  leftIcon={<User className="w-5 h-5" />}
                  error={errors.firstName}
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  error={errors.lastName}
                />
              </div>

              {/* Email (readonly) */}
              <Input
                label="Email"
                value={user.email}
                leftIcon={<Mail className="w-5 h-5" />}
                disabled
                helperText="Email cannot be changed"
              />

              {/* Bio */}
              <Textarea
                label="Bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Tell us about yourself..."
                rows={4}
                error={errors.bio}
              />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Display Mode */}
              <div className="flex items-center space-x-6">
                <Avatar
                  src={user.avatar}
                  fallback={getInitials(user.firstName, user.lastName)}
                  size="xl"
                />
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-slate-500">{user.email}</p>
                </div>
              </div>

              {user.bio && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <p className="mt-1 text-slate-600">{user.bio}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Security</h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage your password and security settings
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Show alert for OAuth users without password */}
          {isOAuthUser && !hasPassword && !showPasswordModal && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  No password set
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  You signed up with {user?.provider === 'google' ? 'Google' : 'GitHub'}. Set a password to also login with email and password.
                </p>
              </div>
            </div>
          )}

          {showPasswordModal ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Only show current password field for users who already have a password */}
              {(!isOAuthUser || hasPassword) && (
                <div className="relative">
                  <Input
                    label="Current Password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={passwordErrors.currentPassword}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                    }
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}

              <div className="relative">
                <Input
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  leftIcon={<Lock className="w-5 h-5" />}
                  error={passwordErrors.newPassword}
                  helperText="At least 6 characters with uppercase, lowercase, and number"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                  }
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmNewPassword: e.target.value,
                    }))
                  }
                  leftIcon={<Lock className="w-5 h-5" />}
                  error={passwordErrors.confirmNewPassword}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                  }
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmNewPassword: '',
                    });
                    setPasswordErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {isOAuthUser && !hasPassword ? 'Set Password' : 'Change Password'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Password</p>
                <p className="text-sm text-slate-500">
                  {isOAuthUser && !hasPassword ? 'Not set' : '••••••••••••'}
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                {isOAuthUser && !hasPassword ? 'Set Password' : 'Change Password'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
