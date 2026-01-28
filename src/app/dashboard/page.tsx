'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { getProjects, getTeamMembers } from '@/lib/data';
import { Project, TeamMember } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    track('page_view', { page: 'dashboard' });
    setProjects(getProjects());
    setTeam(getTeamMembers());
  }, [track]);

  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'done').length, 0);
  const inProgressTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'in_progress').length, 0);

  const stats = [
    { label: 'Projets actifs', value: projects.length, icon: FolderIcon, color: 'bg-blue-100 text-blue-600' },
    { label: 'Tâches totales', value: totalTasks, icon: TaskIcon, color: 'bg-purple-100 text-purple-600' },
    { label: 'En cours', value: inProgressTasks, icon: ClockIcon, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Terminées', value: completedTasks, icon: CheckIcon, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div>
      <Header title={`Bonjour, ${user?.name?.split(' ')[0]} !`} />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent projects */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Projets récents</h2>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm">Voir tout</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>Aucun projet pour le moment</p>
                  <Link href="/dashboard/projects/new">
                    <Button variant="primary" size="sm" className="mt-2">
                      Créer un projet
                    </Button>
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {projects.slice(0, 5).map((project) => (
                    <li key={project.id}>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{project.name}</p>
                          <p className="text-sm text-gray-500">
                            {project.tasks.filter(t => t.status === 'done').length}/{project.tasks.length} tâches terminées
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatDate(project.updatedAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Team activity */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Équipe</h2>
              <Link href="/dashboard/team">
                <Button variant="ghost" size="sm">Gérer</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {team.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>Aucun membre dans l&apos;équipe</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {team.slice(0, 5).map((member) => (
                    <li key={member.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role === 'owner' ? 'Propriétaire' :
                         member.role === 'admin' ? 'Admin' : 'Membre'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-semibold text-gray-900">Actions rapides</h3>
              <p className="text-sm text-gray-500">Accédez rapidement aux fonctionnalités principales</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/projects/new">
                <Button>Nouveau projet</Button>
              </Link>
              <Link href="/dashboard/team">
                <Button variant="outline">Inviter un membre</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function TaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
