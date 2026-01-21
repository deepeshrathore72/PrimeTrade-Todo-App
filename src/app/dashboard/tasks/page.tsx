'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Edit3,
  MoreVertical,
  X,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner, LoadingSkeleton } from '@/components/ui/Loading';
import { toast } from '@/components/ui/Toaster';
import { formatDate, formatRelativeDate, cn } from '@/lib/utils';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  tags: string[];
}

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const statusColors: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  todo: <AlertCircle className="w-4 h-4" />,
  'in-progress': <Clock className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
};

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  tags: [],
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await fetch(`/api/tasks?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data.tasks);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setFormData(initialFormData);
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      tags: task.tags,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleOpenDeleteModal = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      };

      const url = selectedTask ? `/api/tasks/${selectedTask._id}` : '/api/tasks';
      const method = selectedTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          selectedTask ? 'Task updated' : 'Task created',
          data.message
        );
        setShowModal(false);
        fetchTasks();
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((d: { field: string; message: string }) => {
            fieldErrors[d.field] = d.message;
          });
          setErrors(fieldErrors);
        } else {
          toast.error('Error', data.error || 'Something went wrong');
        }
      }
    } catch (error) {
      toast.error('Error', 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${selectedTask._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Task deleted', 'The task has been removed');
        setShowDeleteModal(false);
        fetchTasks();
      } else {
        const data = await response.json();
        toast.error('Error', data.error || 'Failed to delete task');
      }
    } catch (error) {
      toast.error('Error', 'Failed to delete task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Status updated', `Task marked as ${newStatus.replace('-', ' ')}`);
        fetchTasks();
      }
    } catch (error) {
      toast.error('Error', 'Failed to update status');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter || priorityFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Tasks</h2>
          <p className="text-slate-600 mt-1">
            {total} task{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={hasActiveFilters ? 'border-primary-500 text-primary-600' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <Select
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    options={[{ value: '', label: 'All Statuses' }, ...statusOptions]}
                  />
                  <Select
                    label="Priority"
                    value={priorityFilter}
                    onChange={(e) => {
                      setPriorityFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    options={[{ value: '', label: 'All Priorities' }, ...priorityOptions]}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <LoadingSkeleton height={40} width={40} />
                  <div className="flex-1 space-y-2">
                    <LoadingSkeleton height={20} width="60%" />
                    <LoadingSkeleton height={14} width="40%" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : tasks.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <motion.div
                key={task._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="group">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Status Toggle */}
                      <button
                        onClick={() =>
                          handleStatusChange(
                            task,
                            task.status === 'completed' ? 'todo' : 'completed'
                          )
                        }
                        className={cn(
                          'mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-300 hover:border-green-500'
                        )}
                      >
                        {task.status === 'completed' && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3
                              className={cn(
                                'font-medium text-slate-900',
                                task.status === 'completed' && 'line-through text-slate-500'
                              )}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <Badge
                                className={statusColors[task.status]}
                                size="sm"
                              >
                                {statusIcons[task.status]}
                                <span className="ml-1">
                                  {task.status.replace('-', ' ')}
                                </span>
                              </Badge>
                              <Badge
                                className={priorityColors[task.priority]}
                                size="sm"
                              >
                                {task.priority}
                              </Badge>
                              {task.dueDate && (
                                <Badge variant="outline" size="sm">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatRelativeDate(task.dueDate)}
                                </Badge>
                              )}
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="outline" size="sm">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(task)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDeleteModal(task)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {hasActiveFilters ? 'No tasks found' : 'No tasks yet'}
              </h3>
              <p className="text-slate-500 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={handleOpenCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedTask ? 'Edit Task' : 'Create Task'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter task title"
            error={errors.title}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Enter task description (optional)"
            rows={3}
            error={errors.description}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as TaskFormData['status'],
                }))
              }
              options={statusOptions}
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as TaskFormData['priority'],
                }))
              }
              options={priorityOptions}
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tags
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 p-0.5 hover:bg-slate-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
        size="sm"
      >
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete &quot;{selectedTask?.title}&quot;? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isSubmitting}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
