// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  subscription: Subscription;
  onboardingCompleted: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  weeklyDigest: boolean;
  projectUpdates: boolean;
  teamMentions: boolean;
}

// Subscription types
export type PlanType = 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'canceling';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  features: string[];
  projectLimit: number;
  teamMemberLimit: number;
}

export interface Subscription {
  planId: PlanType;
  status: SubscriptionStatus;
  trialEndsAt?: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentFailedAt?: string;
  paymentRetryCount?: number;
}

// Project types
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  tasks: Task[];
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

// Team types
export type TeamRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  joinedAt: string;
  lastActiveAt: string;
}

// Analytics types
export type AnalyticsEventType =
  | 'page_view'
  | 'signup_started'
  | 'signup_completed'
  | 'trial_started'
  | 'trial_expiring_soon'
  | 'trial_expired'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'cancellation_initiated'
  | 'cancellation_completed'
  | 'cancellation_prevented'
  | 'payment_failed'
  | 'payment_recovered'
  | 'project_created'
  | 'task_created'
  | 'task_completed'
  | 'team_member_invited'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'feature_used';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventType: AnalyticsEventType;
  properties?: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

// Onboarding types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

// Report types
export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
}

export interface TeamStats {
  totalMembers: number;
  activeMembersThisWeek: number;
  tasksCompletedThisWeek: number;
}
