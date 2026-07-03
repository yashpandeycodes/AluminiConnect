export type AppRole = 'STUDENT' | 'ALUMNI' | 'ADMIN';

export function hasRole(userRole: string | undefined | null, allowedRoles: AppRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as AppRole);
}
