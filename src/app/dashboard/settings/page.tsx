'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { track } = useAnalytics();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    track('page_view', { page: 'settings' });
  }, [track]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email });
    track('feature_used', { feature: 'update_profile' });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const settingsLinks = [
    {
      title: 'Abonnement et facturation',
      description: 'Gérez votre plan et vos informations de paiement',
      href: '/dashboard/settings/billing',
      icon: CreditCardIcon,
    },
    {
      title: 'Notifications',
      description: 'Configurez vos préférences de notifications',
      href: '/dashboard/settings/notifications',
      icon: BellIcon,
    },
  ];

  return (
    <div>
      <Header title="Paramètres" />

      <div className="p-6 max-w-4xl space-y-6">
        {/* Profile settings */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-2xl font-bold">
                  {name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{name}</h3>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="name"
                  label="Nom complet"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  id="email"
                  label="Adresse email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button type="submit">
                  Enregistrer les modifications
                </Button>
                {saved && (
                  <span className="text-sm text-green-600">Modifications enregistrées !</span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Settings navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                    <link.icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{link.title}</h3>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <h2 className="text-lg font-semibold text-red-900">Zone de danger</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Supprimer le compte</h3>
                <p className="text-sm text-gray-500">
                  Supprimez définitivement votre compte et toutes vos données
                </p>
              </div>
              <Button variant="danger">
                Supprimer le compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
