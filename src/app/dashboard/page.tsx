'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Target,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/Loading';
import { formatRelativeDate } from '@/lib/utils';

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
};

const cardHoverVariants = {
  hover: { 
    y: -4, 
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 20 }
  },
};

const statCards = [
  {
    key: 'total',
    label: 'Total Tasks',
    icon: CheckSquare,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    lightBg: 'bg-blue-500/10',
  },
  {
    key: 'todo',
    label: 'To Do',
    icon: AlertCircle,
    gradient: 'from-slate-500 to-slate-600',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    lightBg: 'bg-slate-500/10',
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: Clock,
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    lightBg: 'bg-amber-500/10',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    lightBg: 'bg-emerald-500/10',
  },
];

const priorityColors: Record<string, string> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
};

const statusColors: Record<string, string> = {
  todo: 'default',
  'in-progress': 'info',
  completed: 'success',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/tasks?limit=5&sortBy=createdAt&sortOrder=desc', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.data.stats);
          setRecentTasks(data.data.tasks);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const completionRate = stats
    ? stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    if (completionRate >= 80) return "Outstanding! You're crushing it! 🔥";
    if (completionRate >= 50) return "Great progress! Keep up the momentum! 💪";
    if (completionRate >= 25) return "You're making headway! Stay focused! 🎯";
    return "Every task completed is a step forward! 🚀";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 border-0 shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl" />
          
          <CardContent className="py-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="text-white">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-3"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span className="text-primary-200 text-sm font-medium">{getGreeting()}</span>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold mb-3"
                >
                  Welcome back, {user?.firstName}! 
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-primary-100 text-lg"
                >
                  {stats?.total
                    ? `You have ${stats.total} tasks. ${stats.inProgress} in progress, ${stats.todo} pending.`
                    : 'Start managing your tasks today and boost your productivity.'}
                </motion.p>
                {stats && stats.total > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-2 text-amber-200 font-medium"
                  >
                    {getMotivationalMessage()}
                  </motion.p>
                )}
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="mt-6 md:mt-0"
              >
                <Link href="/dashboard/tasks">
                  <Button
                    variant="gradient"
                    size="lg"
                    className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Task
                  </Button>
                </Link>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            key={stat.key} 
            variants={itemVariants}
            whileHover="hover"
          >
            <motion.div variants={cardHoverVariants}>
              <Card hover className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="py-6">
                  {isLoading ? (
                    <div className="space-y-3">
                      <LoadingSkeleton height={48} width={48} variant="circular" />
                      <LoadingSkeleton height={32} width={60} />
                      <LoadingSkeleton height={16} width={80} />
                    </div>
                  ) : (
                    <>
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                      >
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <motion.p 
                        className="text-4xl font-bold text-slate-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200 }}
                      >
                        {stats ? stats[stat.key as keyof TaskStats] : 0}
                      </motion.p>
                      <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
                      {stat.key === 'completed' && stats && stats.total > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completionRate}%` }}
                              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-slate-500 font-medium">{completionRate}%</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Progress and Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-lg">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Completion Rate
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-600">Progress</span>
                </div>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  <LoadingSkeleton height={140} variant="circular" className="mx-auto w-36" />
                  <LoadingSkeleton height={20} />
                </div>
              ) : (
                <>
                  <div className="relative w-36 h-36 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="64"
                        stroke="#f1f5f9"
                        strokeWidth="14"
                        fill="none"
                      />
                      <motion.circle
                        cx="72"
                        cy="72"
                        r="64"
                        stroke="url(#progressGradient)"
                        strokeWidth="14"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 402' }}
                        animate={{ strokeDasharray: `${completionRate * 4.02} 402` }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span 
                        className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring' }}
                      >
                        {completionRate}%
                      </motion.span>
                      <span className="text-xs text-slate-400 font-medium">Complete</span>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-slate-600 font-medium">
                      {stats?.completed || 0} of {stats?.total || 0} tasks completed
                    </p>
                    {completionRate >= 50 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="flex items-center justify-center gap-1 text-amber-500"
                      >
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Great progress!</span>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full border-0 shadow-lg">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  Recent Tasks
                </h3>
                <Link
                  href="/dashboard/tasks"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group"
                >
                  View all
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50">
                      <LoadingSkeleton height={44} width={44} variant="circular" />
                      <div className="flex-1 space-y-2">
                        <LoadingSkeleton height={18} width="60%" />
                        <LoadingSkeleton height={14} width="40%" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentTasks.length > 0 ? (
                <AnimatePresence>
                  <div className="space-y-3">
                    {recentTasks.map((task, index) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href="/dashboard/tasks"
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 transition-all group"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                                task.status === 'completed'
                                  ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                                  : task.status === 'in-progress'
                                  ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                  : 'bg-gradient-to-br from-slate-400 to-slate-500'
                              }`}
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : task.status === 'in-progress' ? (
                                <Clock className="w-5 h-5 text-white" />
                              ) : (
                                <Target className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                                {task.title}
                              </p>
                              <p className="text-sm text-slate-500">
                                {formatRelativeDate(task.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                priorityColors[task.priority] as
                                  | 'default'
                                  | 'success'
                                  | 'warning'
                                  | 'danger'
                                  | 'info'
                              }
                            >
                              {task.priority}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-violet-100 rounded-2xl flex items-center justify-center">
                    <CheckSquare className="w-10 h-10 text-primary-600" />
                  </div>
                  <p className="text-slate-600 font-medium mb-1">No tasks yet</p>
                  <p className="text-sm text-slate-400 mb-4">Create your first task to get started</p>
                  <Link href="/dashboard/tasks">
                    <Button variant="gradient" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first task
                    </Button>
                  </Link>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
