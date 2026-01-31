// Mock authentication module for Medius AI Platform

export type UserRole = 'ADMIN' | 'APPROVER' | 'AP_CLERK' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatarUrl: string | null;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 'usr_admin_001',
    email: 'admin@medius.demo',
    name: 'Kevin Owens',
    role: 'ADMIN',
    tenantId: 'tenant_001',
    avatarUrl: null,
  },
  APPROVER: {
    id: 'usr_approver_001',
    email: 'approver@medius.demo',
    name: 'Sarah Chen',
    role: 'APPROVER',
    tenantId: 'tenant_001',
    avatarUrl: null,
  },
  AP_CLERK: {
    id: 'usr_clerk_001',
    email: 'clerk@medius.demo',
    name: 'James Rodriguez',
    role: 'AP_CLERK',
    tenantId: 'tenant_001',
    avatarUrl: null,
  },
  VIEWER: {
    id: 'usr_viewer_001',
    email: 'viewer@medius.demo',
    name: 'Emily Park',
    role: 'VIEWER',
    tenantId: 'tenant_001',
    avatarUrl: null,
  },
};

const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 4,
  APPROVER: 3,
  AP_CLERK: 2,
  VIEWER: 1,
};

export function getCurrentUser(): User {
  return DEMO_USERS.ADMIN;
}

export function hasRole(user: User, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
}

export function canApprove(user: User): boolean {
  return user.role === 'ADMIN' || user.role === 'APPROVER';
}

export function isAdmin(user: User): boolean {
  return user.role === 'ADMIN';
}

export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    APPROVER: 'Approver',
    AP_CLERK: 'AP Clerk',
    VIEWER: 'Viewer',
  };
  return labels[role];
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    ADMIN: '#165DFF',
    APPROVER: '#00B42A',
    AP_CLERK: '#FF7D00',
    VIEWER: '#4E5969',
  };
  return colors[role];
}
