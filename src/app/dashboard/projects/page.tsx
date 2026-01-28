'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { getProjects, deleteProject } from '@/lib/data';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const { track } = useAnalytics();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    track('page_view', { page: 'projects' });
    setProjects(getProjects());
  }, [track]);

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      deleteProject(id);
      setProjects(getProjects());
      track('feature_used', { feature: 'delete_project' });
    }
  };

  return (
    <div>
      <Header title="Projets" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tous les projets</h2>
            <p className="text-gray-500">{projects.length} projet{projects.length > 1 ? 's' : ''}</p>
          </div>
          <Link href="/dashboard/projects/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouveau projet
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mx-auto mb-4">
                <FolderIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet</h3>
              <p className="text-gray-500 mb-4">Commencez par créer votre premier projet</p>
              <Link href="/dashboard/projects/new">
                <Button>Créer un projet</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const completed = project.tasks.filter(t => t.status === 'done').length;
              const total = project.tasks.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;

              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      </div>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Progression</span>
                        <span className="font-medium text-gray-900">{completed}/{total}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Mis à jour {formatDate(project.updatedAt)}
                      </span>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          Ouvrir
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
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

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
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
