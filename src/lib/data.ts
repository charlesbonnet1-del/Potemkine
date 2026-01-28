import { Project, TeamMember, Task } from '@/types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { generateId } from './utils';

// Demo data initialization
export function initializeDemoData(userId: string): void {
  const existingProjects = getItem<Project[]>(STORAGE_KEYS.PROJECTS);
  if (existingProjects && existingProjects.length > 0) return;

  const projects: Project[] = [
    {
      id: generateId(),
      name: 'Site Web Refonte',
      description: 'Refonte complète du site web corporate',
      color: '#3B82F6',
      teamMembers: [userId],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        { id: generateId(), title: 'Maquettes UI/UX', status: 'done', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Développement frontend', status: 'in_progress', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Intégration API', status: 'in_progress', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Tests & QA', status: 'todo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Déploiement production', status: 'todo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
    },
    {
      id: generateId(),
      name: 'App Mobile v2',
      description: 'Nouvelle version de l\'application mobile',
      color: '#10B981',
      teamMembers: [userId],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        { id: generateId(), title: 'Analyse des besoins', status: 'done', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Architecture technique', status: 'done', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Module authentification', status: 'done', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Module notifications', status: 'in_progress', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Module paiement', status: 'todo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Publication stores', status: 'todo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
    },
    {
      id: generateId(),
      name: 'Marketing Q1',
      description: 'Campagnes marketing premier trimestre',
      color: '#F59E0B',
      teamMembers: [userId],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        { id: generateId(), title: 'Stratégie réseaux sociaux', status: 'in_progress', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Création contenus', status: 'todo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Email campaigns', status: 'todo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
    },
  ];

  setItem(STORAGE_KEYS.PROJECTS, projects);

  const team: TeamMember[] = [
    {
      id: generateId(),
      userId,
      name: 'Vous',
      email: 'vous@example.com',
      role: 'owner',
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      userId: generateId(),
      name: 'Marie Dupont',
      email: 'marie@example.com',
      role: 'admin',
      joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      userId: generateId(),
      name: 'Pierre Martin',
      email: 'pierre@example.com',
      role: 'member',
      joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  setItem(STORAGE_KEYS.TEAM, team);
}

// Projects CRUD
export function getProjects(): Project[] {
  return getItem<Project[]>(STORAGE_KEYS.PROJECTS) || [];
}

export function getProject(id: string): Project | undefined {
  const projects = getProjects();
  return projects.find(p => p.id === id);
}

export function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...data,
    id: generateId(),
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.push(newProject);
  setItem(STORAGE_KEYS.PROJECTS, projects);
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.PROJECTS, projects);
  return projects[index];
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length === projects.length) return false;
  setItem(STORAGE_KEYS.PROJECTS, filtered);
  return true;
}

// Tasks CRUD
export function addTask(projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task | null {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  project.tasks.push(newTask);
  project.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.PROJECTS, projects);
  return newTask;
}

export function updateTask(projectId: string, taskId: string, updates: Partial<Task>): Task | null {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const taskIndex = project.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return null;

  project.tasks[taskIndex] = {
    ...project.tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  project.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.PROJECTS, projects);
  return project.tasks[taskIndex];
}

export function deleteTask(projectId: string, taskId: string): boolean {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return false;

  const originalLength = project.tasks.length;
  project.tasks = project.tasks.filter(t => t.id !== taskId);
  if (project.tasks.length === originalLength) return false;

  project.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.PROJECTS, projects);
  return true;
}

// Team CRUD
export function getTeamMembers(): TeamMember[] {
  return getItem<TeamMember[]>(STORAGE_KEYS.TEAM) || [];
}

export function addTeamMember(data: Omit<TeamMember, 'id' | 'joinedAt' | 'lastActiveAt'>): TeamMember {
  const team = getTeamMembers();
  const newMember: TeamMember = {
    ...data,
    id: generateId(),
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  team.push(newMember);
  setItem(STORAGE_KEYS.TEAM, team);
  return newMember;
}

export function removeTeamMember(id: string): boolean {
  const team = getTeamMembers();
  const filtered = team.filter(m => m.id !== id);
  if (filtered.length === team.length) return false;
  setItem(STORAGE_KEYS.TEAM, filtered);
  return true;
}

export function updateTeamMemberRole(id: string, role: TeamMember['role']): TeamMember | null {
  const team = getTeamMembers();
  const index = team.findIndex(m => m.id === id);
  if (index === -1) return null;

  team[index].role = role;
  setItem(STORAGE_KEYS.TEAM, team);
  return team[index];
}
