import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  provider?: string;
  providerId?: string;
  emailVerified?: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: false, // Not required for OAuth users
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
    },
    providerId: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for checking if account is locked
userSchema.virtual('isAccountLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Skip if password not modified or not set (OAuth users)
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // If no password set (OAuth user), return false
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account if max attempts reached
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }

  await this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

// Create indexes (note: email already has unique: true which creates an index)
userSchema.index({ createdAt: -1 });
userSchema.index({ provider: 1, providerId: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
