'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { getProjects, getTeamMembers } from '@/lib/data';
import { Project, TeamMember } from '@/types';

export default function ReportsPage() {
  const { track, getEvents } = useAnalytics();
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    track('page_view', { page: 'reports' });
    setProjects(getProjects());
    setTeam(getTeamMembers());
  }, [track]);

  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'done').length, 0);
  const inProgressTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'in_progress').length, 0);
  const todoTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'todo').length, 0);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const events = getEvents();
  const recentEvents = events.slice(-10).reverse();

  return (
    <div>
      <Header title="Rapports" />

      <div className="p-6 space-y-6">
        {/* Overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Taux de complétion"
            value={`${completionRate}%`}
            subtitle={`${completedTasks} sur ${totalTasks} tâches`}
            icon={<ChartIcon className="h-6 w-6" />}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Projets actifs"
            value={projects.length.toString()}
            subtitle="En cours"
            icon={<FolderIcon className="h-6 w-6" />}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Membres équipe"
            value={team.length.toString()}
            subtitle="Actifs"
            icon={<UsersIcon className="h-6 w-6" />}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Événements"
            value={events.length.toString()}
            subtitle="Analytics"
            icon={<ActivityIcon className="h-6 w-6" />}
            color="bg-yellow-100 text-yellow-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Distribution des tâches</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProgressBar label="À faire" value={todoTasks} max={totalTasks} color="bg-gray-500" />
                <ProgressBar label="En cours" value={inProgressTasks} max={totalTasks} color="bg-blue-500" />
                <ProgressBar label="Terminé" value={completedTasks} max={totalTasks} color="bg-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Projects performance */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Performance par projet</h3>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun projet</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => {
                    const total = project.tasks.length;
                    const completed = project.tasks.filter(t => t.status === 'done').length;
                    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                      <div key={project.id} className="flex items-center gap-4">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {project.name}
                            </span>
                            <span className="text-sm text-gray-500">{rate}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${rate}%`, backgroundColor: project.color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Activité récente (Analytics)</h3>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune activité enregistrée</p>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{formatEventType(event.eventType)}</p>
                      {event.properties && Object.keys(event.properties).length > 0 && (
                        <p className="text-xs text-gray-500">
                          {JSON.stringify(event.properties)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressBar({ label, value, max, color }: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function formatEventType(type: string): string {
  const map: Record<string, string> = {
    'page_view': 'Page consultée',
    'signup_started': 'Inscription commencée',
    'signup_completed': 'Inscription terminée',
    'trial_started': 'Essai démarré',
    'trial_expiring_soon': 'Essai expire bientôt',
    'trial_expired': 'Essai expiré',
    'subscription_upgraded': 'Abonnement mis à niveau',
    'subscription_downgraded': 'Abonnement réduit',
    'cancellation_initiated': 'Annulation initiée',
    'cancellation_completed': 'Annulation confirmée',
    'cancellation_prevented': 'Annulation évitée',
    'payment_failed': 'Paiement échoué',
    'payment_recovered': 'Paiement récupéré',
    'project_created': 'Projet créé',
    'task_created': 'Tâche créée',
    'task_completed': 'Tâche terminée',
    'team_member_invited': 'Membre invité',
    'onboarding_step_completed': 'Étape onboarding',
    'onboarding_completed': 'Onboarding terminé',
    'feature_used': 'Fonctionnalité utilisée',
  };
  return map[type] || type;
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
