import type { ModuleNode, PermissionPayload, SubmoduleNode, FeatureNode, ApiNode } from '@/modules/roleAccess/types';
import type { SidebarItem } from '@/config/sidebar';

const normalizeRoute = (value?: string | null) =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '/');

const normalizeName = (value?: string | null) =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, ' ')
    .replace(/\s+/g, ' ');

const hasId = (value?: string | number | null) => value !== undefined && value !== null && value !== '';

const getAccessibleValues = (permissions?: PermissionPayload | null) => ({
  moduleIds: new Set((permissions?.moduleIds ?? []).map(String)),
  subModuleIds: new Set((permissions?.subModuleIds ?? []).map(String)),
  featureIds: new Set((permissions?.featureIds ?? []).map(String)),
  apiIds: new Set((permissions?.apiIds ?? []).map(String)),
  moduleNames: new Set((permissions?.moduleNames ?? []).map((item) => normalizeName(item))),
  subModuleNames: new Set((permissions?.subModuleNames ?? []).map((item) => normalizeName(item))),
  featureNames: new Set((permissions?.featureNames ?? []).map((item) => normalizeName(item))),
  apiNames: new Set((permissions?.apiNames ?? []).map((item) => normalizeName(item))),
});

const isNodeAllowed = (
  nodeType: 'module' | 'submodule' | 'feature' | 'api',
  node: { id?: string | number; name?: string; route?: string },
  permissions?: PermissionPayload | null,
): boolean => {
  if (!permissions) {
    return true;
  }

  const values = getAccessibleValues(permissions);
  const normalizedName = normalizeName(node.name);

  if (nodeType === 'api') {
    if (hasId(node.id) && values.apiIds.has(String(node.id))) {
      return true;
    }

    return normalizedName.length > 0 && values.apiNames.has(normalizedName);
  }

  if (nodeType === 'feature') {
    if (hasId(node.id) && values.featureIds.has(String(node.id))) {
      return true;
    }

    return normalizedName.length > 0 && values.featureNames.has(normalizedName);
  }

  if (nodeType === 'submodule') {
    if (hasId(node.id) && values.subModuleIds.has(String(node.id))) {
      return true;
    }

    return normalizedName.length > 0 && values.subModuleNames.has(normalizedName);
  }

  if (hasId(node.id) && values.moduleIds.has(String(node.id))) {
    return true;
  }

  return normalizedName.length > 0 && values.moduleNames.has(normalizedName);
};

const nodeMatchesRoute = (node: { route?: string }, pathname: string) => {
  const normalizedPath = normalizeRoute(pathname);
  const normalizedRoute = normalizeRoute(node.route);

  if (!normalizedRoute) {
    return false;
  }

  return normalizedPath === normalizedRoute || normalizedPath.startsWith(`${normalizedRoute}/`);
};

const hasAccessibleDescendant = (
  tree: ModuleNode[],
  pathname: string,
  permissions?: PermissionPayload | null,
): boolean => {
  for (const module of tree) {
    if (nodeMatchesRoute(module, pathname) && isNodeAllowed('module', module, permissions)) {
      return true;
    }

    for (const feature of module.features ?? []) {
      if (nodeMatchesRoute(feature, pathname) && isNodeAllowed('feature', feature, permissions)) {
        return true;
      }

      for (const api of feature.apis ?? []) {
        if (nodeMatchesRoute(api, pathname) && isNodeAllowed('api', api, permissions)) {
          return true;
        }
      }
    }

    for (const api of module.apis ?? []) {
      if (nodeMatchesRoute(api, pathname) && isNodeAllowed('api', api, permissions)) {
        return true;
      }
    }

    for (const submodule of module.submodules ?? []) {
      if (nodeMatchesRoute(submodule, pathname) && isNodeAllowed('submodule', submodule, permissions)) {
        return true;
      }

      for (const feature of submodule.features ?? []) {
        if (nodeMatchesRoute(feature, pathname) && isNodeAllowed('feature', feature, permissions)) {
          return true;
        }

        for (const api of feature.apis ?? []) {
          if (nodeMatchesRoute(api, pathname) && isNodeAllowed('api', api, permissions)) {
            return true;
          }
        }
      }

      for (const api of submodule.apis ?? []) {
        if (nodeMatchesRoute(api, pathname) && isNodeAllowed('api', api, permissions)) {
          return true;
        }
      }
    }
  }

  return false;
};

export const isSuperAdminRole = (role?: string | null): boolean => {
  const normalized = String(role ?? '').trim().toLowerCase();
  return normalized === 'superadmin' || normalized === 'super admin' || normalized === 'super_admin' || normalized.includes('superadmin');
};

const hasExactAllowedNode = (
  tree: ModuleNode[],
  pathname: string,
  permissions?: PermissionPayload | null,
): boolean => {
  const normalizedPath = normalizeRoute(pathname);

  for (const module of tree) {
    if (normalizeRoute(module.route) === normalizedPath) {
      if (isNodeAllowed('module', module, permissions)) {
        return true;
      }
    }

    for (const feature of module.features ?? []) {
      if (normalizeRoute(feature.route) === normalizedPath) {
        if (isNodeAllowed('feature', feature, permissions)) {
          return true;
        }
      }

      for (const api of feature.apis ?? []) {
        if (normalizeRoute(api.route) === normalizedPath) {
          if (isNodeAllowed('api', api, permissions)) {
            return true;
          }
        }
      }
    }

    for (const api of module.apis ?? []) {
      if (normalizeRoute(api.route) === normalizedPath) {
        if (isNodeAllowed('api', api, permissions)) {
          return true;
        }
      }
    }

    for (const submodule of module.submodules ?? []) {
      if (normalizeRoute(submodule.route) === normalizedPath) {
        if (isNodeAllowed('submodule', submodule, permissions)) {
          return true;
        }
      }

      for (const feature of submodule.features ?? []) {
        if (normalizeRoute(feature.route) === normalizedPath) {
          if (isNodeAllowed('feature', feature, permissions)) {
            return true;
          }
        }

        for (const api of feature.apis ?? []) {
          if (normalizeRoute(api.route) === normalizedPath) {
            if (isNodeAllowed('api', api, permissions)) {
              return true;
            }
          }
        }
      }

      for (const api of submodule.apis ?? []) {
        if (normalizeRoute(api.route) === normalizedPath) {
          if (isNodeAllowed('api', api, permissions)) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

const hasAllowedDescendant = (module: ModuleNode, permissions?: PermissionPayload | null): boolean => {
  for (const feature of module.features ?? []) {
    if (isNodeAllowed('feature', feature, permissions)) {
      return true;
    }

    for (const api of feature.apis ?? []) {
      if (isNodeAllowed('api', api, permissions)) {
        return true;
      }
    }
  }

  for (const api of module.apis ?? []) {
    if (isNodeAllowed('api', api, permissions)) {
      return true;
    }
  }

  for (const submodule of module.submodules ?? []) {
    if (isNodeAllowed('submodule', submodule, permissions)) {
      return true;
    }

    for (const feature of submodule.features ?? []) {
      if (isNodeAllowed('feature', feature, permissions)) {
        return true;
      }

      for (const api of feature.apis ?? []) {
        if (isNodeAllowed('api', api, permissions)) {
          return true;
        }
      }
    }

    for (const api of submodule.apis ?? []) {
      if (isNodeAllowed('api', api, permissions)) {
        return true;
      }
    }
  }

  return false;
};

const hasAllowedDescendantInSubmodule = (submodule: SubmoduleNode, permissions?: PermissionPayload | null): boolean => {
  for (const feature of submodule.features ?? []) {
    if (isNodeAllowed('feature', feature, permissions)) {
      return true;
    }

    for (const api of feature.apis ?? []) {
      if (isNodeAllowed('api', api, permissions)) {
        return true;
      }
    }
  }

  for (const api of submodule.apis ?? []) {
    if (isNodeAllowed('api', api, permissions)) {
      return true;
    }
  }

  return false;
};

const hasAllowedDescendantInFeature = (feature: FeatureNode, permissions?: PermissionPayload | null): boolean => {
  for (const api of feature.apis ?? []) {
    if (isNodeAllowed('api', api, permissions)) {
      return true;
    }
  }

  return false;
};

export const hasAccessToRoute = (
  tree: ModuleNode[],
  pathname: string,
  permissions?: PermissionPayload | null,
  userRole?: string | null,
): boolean => {
  if (isSuperAdminRole(userRole)) {
    return true;
  }

  if (!tree.length) {
    return true;
  }

  if (!permissions) {
    return true;
  }

  if (permissions?.moduleIds?.length === 0 && permissions?.subModuleIds?.length === 0 && permissions?.featureIds?.length === 0 && permissions?.apiIds?.length === 0) {
    return false;
  }

  return hasExactAllowedNode(tree, pathname, permissions);
};

export const hasAccessToFeature = (
  tree: ModuleNode[],
  route?: string,
  permissions?: PermissionPayload | null,
  featureName?: string,
  userRole?: string | null,
): boolean => {
  if (isSuperAdminRole(userRole)) {
    return true;
  }

  if (!tree.length || !permissions) {
    return true;
  }

  const normalizedRoute = normalizeRoute(route);
  const normalizedName = normalizeRoute(featureName);

  const matchesNode = (node: { name?: string; route?: string }, targetRoute?: string, targetName?: string) => {
    const routeMatches = targetRoute ? normalizeRoute(node.route) === targetRoute : false;
    const nameMatches = targetName ? normalizeRoute(node.name) === targetName : false;
    return routeMatches || nameMatches;
  };

  for (const module of tree) {
    for (const feature of module.features ?? []) {
      if (matchesNode(feature, normalizedRoute, normalizedName)) {
        return isNodeAllowed('feature', feature, permissions);
      }

      for (const api of feature.apis ?? []) {
        if (matchesNode(api, normalizedRoute, normalizedName)) {
          return isNodeAllowed('api', api, permissions);
        }
      }
    }

    for (const api of module.apis ?? []) {
      if (matchesNode(api, normalizedRoute, normalizedName)) {
        return isNodeAllowed('api', api, permissions);
      }
    }

    for (const submodule of module.submodules ?? []) {
      if (matchesNode(submodule, normalizedRoute, normalizedName)) {
        return isNodeAllowed('submodule', submodule, permissions);
      }

      for (const feature of submodule.features ?? []) {
        if (matchesNode(feature, normalizedRoute, normalizedName)) {
          return isNodeAllowed('feature', feature, permissions);
        }

        for (const api of feature.apis ?? []) {
          if (matchesNode(api, normalizedRoute, normalizedName)) {
            return isNodeAllowed('api', api, permissions);
          }
        }
      }

      for (const api of submodule.apis ?? []) {
        if (matchesNode(api, normalizedRoute, normalizedName)) {
          return isNodeAllowed('api', api, permissions);
        }
      }
    }
  }

  return false;
};

const hasVisibleAccessNode = (node: any): boolean => {
  if (!node) {
    return false;
  }

  if (node.checked === true || node.indeterminate === true) {
    return true;
  }

  if (Array.isArray(node.submodules) && node.submodules.some(hasVisibleAccessNode)) {
    return true;
  }

  if (Array.isArray(node.features) && node.features.some(hasVisibleAccessNode)) {
    return true;
  }

  if (Array.isArray(node.apis) && node.apis.some((api: any) => api.checked === true || api.indeterminate === true)) {
    return true;
  }

  return false;
};

const hasAccessForSidebarRoute = (tree: ModuleNode[], pathname: string): boolean => {
  const targetPath = normalizeRoute(pathname);

  const walk = (nodes: any[]): boolean => {
    for (const node of nodes) {
      if (!node) continue;

      const nodeRoute = normalizeRoute(node.route);
      if (nodeRoute === targetPath && hasVisibleAccessNode(node)) {
        return true;
      }

      if (Array.isArray(node.submodules) && walk(node.submodules)) {
        return true;
      }

      if (Array.isArray(node.features) && walk(node.features)) {
        return true;
      }

      if (Array.isArray(node.apis) && node.apis.some((api: any) => normalizeRoute(api.route) === targetPath && (api.checked === true || api.indeterminate === true))) {
        return true;
      }
    }

    return false;
  };

  return walk(tree);
};

export const filterSidebarItems = (
  items: SidebarItem[],
  tree: ModuleNode[],
  permissions?: PermissionPayload | null,
  userRole?: string | null,
): SidebarItem[] => {
  if (isSuperAdminRole(userRole)) {
    return items;
  }

  return items.reduce<SidebarItem[]>((acc, item) => {
    if (item.children?.length) {
      const visibleChildren = item.children.filter((child) => hasAccessForSidebarRoute(tree, child.href));

      if (visibleChildren.length > 0) {
        acc.push({ ...item, children: visibleChildren });
      }

      return acc;
    }

    if (item.href && hasAccessForSidebarRoute(tree, item.href)) {
      acc.push(item);
    }

    return acc;
  }, []);
};

export const getNodeAccessLabel = (node: { checked?: boolean; indeterminate?: boolean }) => {
  if (node.checked) {
    return 'allowed';
  }

  if (node.indeterminate) {
    return 'partial';
  }

  return 'denied';
};