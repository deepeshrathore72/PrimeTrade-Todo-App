'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'JWT-based authentication with password hashing for maximum security.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with Next.js for optimal performance and SEO.',
  },
  {
    icon: BarChart3,
    title: 'Powerful Dashboard',
    description: 'Manage tasks, track progress, and boost productivity.',
  },
  {
    icon: CheckCircle,
    title: 'Task Management',
    description: 'Full CRUD operations with search, filter, and status tracking.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
              <span className="text-xl font-bold text-slate-800">PrimeTrade</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Powered by Next.js & MongoDB
              </span>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6"
            >
              Manage Your Tasks
              <br />
              <span className="gradient-text">Like a Pro</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-600 max-w-2xl mx-auto mb-10"
            >
              A powerful, secure, and scalable task management dashboard built with
              modern technologies. Boost your productivity today.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth/register">
                <Button size="lg" className="group">
                  Start Free Today
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Sign In to Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 blur-3xl rounded-3xl transform -rotate-1"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Total Tasks', value: '24', color: 'bg-blue-500' },
                    { label: 'In Progress', value: '8', color: 'bg-yellow-500' },
                    { label: 'Completed', value: '16', color: 'bg-green-500' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 text-sm">{stat.label}</span>
                        <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                      </div>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { title: 'Design System Update', status: 'completed', priority: 'high' },
                    { title: 'API Integration', status: 'in-progress', priority: 'medium' },
                    { title: 'Database Migration', status: 'todo', priority: 'low' },
                  ].map((task, i) => (
                    <motion.div
                      key={task.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            task.status === 'completed'
                              ? 'bg-green-500'
                              : task.status === 'in-progress'
                              ? 'bg-yellow-500'
                              : 'bg-slate-300'
                          }`}
                        ></div>
                        <span className="text-slate-700">{task.title}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with security and scalability in mind, our platform provides all the
              tools you need to manage your tasks efficiently.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group"
              >
                <div className="bg-slate-50 rounded-2xl p-6 h-full card-hover border border-slate-100">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users who are already managing their tasks more
                efficiently with our platform.
              </p>
              <Link href="/auth/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-primary-50 inline-flex items-center whitespace-nowrap"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">PT</span>
            </div>
            <span className="text-slate-600 text-sm">
              © 2026 PrimeTrade. All rights reserved.
            </span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-600">
            <Link href="#" className="hover:text-primary-600 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary-600 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
