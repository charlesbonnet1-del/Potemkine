'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  key: keyof typeof defaultSettings;
}

const defaultSettings = {
  emailNotifications: true,
  weeklyDigest: true,
  projectUpdates: true,
  teamMentions: true,
};

const notificationSettings: NotificationSetting[] = [
  {
    id: 'email',
    label: 'Notifications par email',
    description: 'Recevez des notifications importantes par email',
    key: 'emailNotifications',
  },
  {
    id: 'digest',
    label: 'Résumé hebdomadaire',
    description: 'Recevez un résumé de l\'activité chaque semaine',
    key: 'weeklyDigest',
  },
  {
    id: 'projects',
    label: 'Mises à jour des projets',
    description: 'Soyez notifié des changements dans vos projets',
    key: 'projectUpdates',
  },
  {
    id: 'mentions',
    label: 'Mentions d\'équipe',
    description: 'Recevez une notification quand vous êtes mentionné',
    key: 'teamMentions',
  },
];

export default function NotificationsPage() {
  const { user, updatePreferences } = useAuth();
  const { track } = useAnalytics();
  const [settings, setSettings] = useState(user?.preferences || defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    track('page_view', { page: 'notifications_settings' });
  }, [track]);

  useEffect(() => {
    if (user?.preferences) {
      setSettings(user.preferences);
    }
  }, [user]);

  const handleToggle = (key: keyof typeof defaultSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updatePreferences(settings);
    track('feature_used', { feature: 'update_notifications' });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <Header title="Notifications" />

      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Préférences de notification</h2>
            <p className="text-sm text-gray-500">
              Choisissez comment et quand vous souhaitez être notifié
            </p>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {notificationSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-medium text-gray-900">{setting.label}</h3>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={settings[setting.key]}
                  onClick={() => handleToggle(setting.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings[setting.key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings[setting.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 mt-6">
          <Button onClick={handleSave}>
            Enregistrer les préférences
          </Button>
          {saved && (
            <span className="text-sm text-green-600">Préférences enregistrées !</span>
          )}
        </div>
      </div>
    </div>
  );
}
