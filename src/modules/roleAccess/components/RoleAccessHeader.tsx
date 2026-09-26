import type { RoleAccessHeaderProps } from '@/modules/roleAccess/types';

export default function RoleAccessHeader({
  roles,
  selectedRoleId,
  permissions,
}: RoleAccessHeaderProps) {
  const selectedRole = roles.find((role) => String(role.id) === String(selectedRoleId));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Permission Manager</h1>
        <p className="text-sm text-slate-400">Role Access Management</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-primary">Role</p>
          <p className="mt-2 text-xl font-semibold text-primary">
            {selectedRole?.name || 'No role selected'}
          </p>
        </div>
        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-primary">Total APIs</p>
          <p className="mt-2 text-xl font-semibold text-primary">{permissions.totalApis}</p>
        </div>
        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-primary">Allowed</p>
          <p className="mt-2 text-xl font-semibold text-primary">{permissions.allowedApis}</p>
          <p className="text-xs text-slate-500 mt-2">Denied {permissions.deniedApis}</p>
        </div>
      </div>
    </div>
  );
}
