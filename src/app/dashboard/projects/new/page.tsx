'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { createProject } from '@/lib/data';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    track('page_view', { page: 'new_project' });
  }, [track]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    const project = createProject({
      name,
      description,
      color,
      teamMembers: [user.id],
    });

    track('project_created', { projectId: project.id, name });
    router.push(`/dashboard/projects/${project.id}`);
  };

  return (
    <div>
      <Header title="Nouveau projet" />

      <div className="p-6 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="name"
                label="Nom du projet"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon nouveau projet"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description (optionnel)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Décrivez votre projet..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Couleur
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full transition-transform ${
                        color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={!name || submitting}>
                  {submitting ? 'Création...' : 'Créer le projet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
