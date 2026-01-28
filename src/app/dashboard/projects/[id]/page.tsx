'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { getProject, updateTask, addTask, deleteTask } from '@/lib/data';
import { Project, Task, TaskStatus } from '@/types';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'À faire', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'En cours', color: 'bg-blue-100' },
  { id: 'done', title: 'Terminé', color: 'bg-green-100' },
];

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { track } = useAnalytics();
  const [project, setProject] = useState<Project | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColumn, setNewTaskColumn] = useState<TaskStatus>('todo');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const loadProject = useCallback(() => {
    const p = getProject(params.id as string);
    if (p) {
      setProject(p);
    } else {
      router.push('/dashboard/projects');
    }
  }, [params.id, router]);

  useEffect(() => {
    track('page_view', { page: 'project_kanban', projectId: params.id });
    loadProject();
  }, [track, params.id, loadProject]);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask || !project || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    const wasCompleted = draggedTask.status === 'done';
    const isNowCompleted = status === 'done';

    updateTask(project.id, draggedTask.id, { status });

    if (!wasCompleted && isNowCompleted) {
      track('task_completed', { projectId: project.id, taskId: draggedTask.id });
    }

    loadProject();
    setDraggedTask(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newTaskTitle) return;

    const task = addTask(project.id, {
      title: newTaskTitle,
      status: newTaskColumn,
    });

    if (task) {
      track('task_created', { projectId: project.id, taskId: task.id });
      loadProject();
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!project) return;
    deleteTask(project.id, taskId);
    loadProject();
  };

  const openAddTaskModal = (column: TaskStatus) => {
    setNewTaskColumn(column);
    setShowAddTask(true);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title={project.name} />

      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map((column) => {
            const tasks = project.tasks.filter(t => t.status === column.id);

            return (
              <div
                key={column.id}
                className="w-80 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <Card className={`flex-1 ${column.color} border-0`}>
                  <CardHeader className="flex items-center justify-between bg-transparent">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                      <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-600">
                        {tasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => openAddTaskModal(column.id)}
                      className="p-1 rounded hover:bg-white/50 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-2 bg-transparent">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-move hover:shadow-md transition-shadow ${
                          draggedTask?.id === task.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                        )}
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Glissez une tâche ici
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add task modal */}
      <Modal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        title="Nouvelle tâche"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input
            id="task-title"
            label="Titre de la tâche"
            type="text"
            required
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Ma nouvelle tâche"
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddTask(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!newTaskTitle}>
              Ajouter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
