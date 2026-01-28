'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { getTeamMembers, addTeamMember, removeTeamMember, updateTeamMemberRole } from '@/lib/data';
import { TeamMember, TeamRole } from '@/types';
import { generateId } from '@/lib/utils';

export default function TeamPage() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');

  useEffect(() => {
    track('page_view', { page: 'team' });
    setTeam(getTeamMembers());
  }, [track]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const member = addTeamMember({
      userId: generateId(),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
    });

    track('team_member_invited', { role: inviteRole });
    setTeam([...team, member]);
    setShowInvite(false);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('member');
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) {
      removeTeamMember(id);
      setTeam(team.filter(m => m.id !== id));
    }
  };

  const handleRoleChange = (id: string, role: TeamRole) => {
    updateTeamMemberRole(id, role);
    setTeam(team.map(m => m.id === id ? { ...m, role } : m));
  };

  return (
    <div>
      <Header title="Équipe" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Membres de l&apos;équipe</h2>
            <p className="text-gray-500">{team.length} membre{team.length > 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => setShowInvite(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Inviter
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
              <div className="col-span-4">Membre</div>
              <div className="col-span-3">Rôle</div>
              <div className="col-span-3">Statut</div>
              <div className="col-span-2">Actions</div>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 p-0">
            {team.map((member) => {
              const isOwner = member.role === 'owner';
              const isSelf = member.userId === user?.id;

              return (
                <div key={member.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.name}
                        {isSelf && <span className="text-gray-400 ml-2">(vous)</span>}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="col-span-3">
                    {isOwner || isSelf ? (
                      <Badge variant={isOwner ? 'info' : 'default'}>
                        {member.role === 'owner' ? 'Propriétaire' :
                         member.role === 'admin' ? 'Administrateur' : 'Membre'}
                      </Badge>
                    ) : (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                      >
                        <option value="member">Membre</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    )}
                  </div>

                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">Actif</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    {!isOwner && !isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Invite modal */}
      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Inviter un membre">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            id="invite-name"
            label="Nom"
            type="text"
            required
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Jean Dupont"
          />
          <Input
            id="invite-email"
            label="Adresse email"
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="jean@example.com"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamRole)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="member">Membre</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!inviteEmail || !inviteName}>
              Envoyer l&apos;invitation
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
