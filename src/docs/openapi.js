module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Cocarr Authorization Service (IAM)',
    version: '0.1.0',
    description: 'Policy-based IAM: products/portals/modules, permissions, roles, assignments '
      + '(with temporary access), policies (allow/deny), delegation, audit and permission resolution.',
  },
  servers: [{ url: '/v1' }],
  tags: [{ name: 'Taxonomy' }, { name: 'Roles' }, { name: 'Access' }, { name: 'Resolution' }, { name: 'Audit' }, { name: 'Health' }],
  paths: {
    '/health': { get: { tags: ['Health'], summary: 'Liveness', responses: { 200: { description: 'ok' } } } },
    '/products': { get: { tags: ['Taxonomy'], summary: 'List products' }, post: { tags: ['Taxonomy'], summary: 'Create product' } },
    '/portals': { get: { tags: ['Taxonomy'], summary: 'List portals' }, post: { tags: ['Taxonomy'], summary: 'Create portal' } },
    '/modules': { get: { tags: ['Taxonomy'], summary: 'List modules' }, post: { tags: ['Taxonomy'], summary: 'Create module' } },
    '/permissions': { get: { tags: ['Taxonomy'], summary: 'List permissions' }, post: { tags: ['Taxonomy'], summary: 'Create permission' } },
    '/roles': { get: { tags: ['Roles'], summary: 'List roles' }, post: { tags: ['Roles'], summary: 'Create role' } },
    '/roles/{id}/permissions': { put: { tags: ['Roles'], summary: 'Set a role’s permissions ({ permissionIds })' } },
    '/assignments': { post: { tags: ['Access'], summary: 'Assign role to principal ({ principalId, roleId, expiresAt? }) — expiresAt = temporary access' } },
    '/assignments/principal/{principalId}': { get: { tags: ['Access'], summary: 'Assignments for a principal (?activeOnly=true)' } },
    '/policies': { get: { tags: ['Access'], summary: 'List policies' }, post: { tags: ['Access'], summary: 'Create allow/deny policy' } },
    '/delegations': { get: { tags: ['Access'], summary: 'List delegations' }, post: { tags: ['Access'], summary: 'Delegate a role for a window' } },
    '/principals/{principalId}/permissions': { get: { tags: ['Resolution'], summary: 'Effective permissions for a principal' } },
    '/authorize': { post: { tags: ['Resolution'], summary: 'Decision point ({ principalId, permission }) -> { allow, reason }' } },
    '/audit': { get: { tags: ['Audit'], summary: 'Access-change audit log' } },
  },
};
