const { createCrudService } = require('./crudFactory');
const { CustomError } = require('../middlewares/error');
const { ApprovalChain, ApprovalStep, Role } = require('../models');
const audit = require('./auditService');

const crud = createCrudService({
  model: ApprovalChain,
  entityType: 'ApprovalChain',
  searchable: ['key', 'name', 'requestType'],
  allowed: ['key', 'name', 'requestType', 'organizationId', 'description', 'isActive'],
});

const withSteps = {
  include: [{
    model: ApprovalStep,
    as: 'steps',
    include: [{ model: Role, as: 'approverRole', attributes: ['id', 'key', 'name'] }],
  }],
  order: [[{ model: ApprovalStep, as: 'steps' }, 'stepOrder', 'ASC']],
};

async function getWithSteps(id) {
  const chain = await ApprovalChain.findByPk(id, withSteps);
  if (!chain) throw new CustomError('ApprovalChain not found', 404, 'NOT_FOUND');
  return chain;
}

// The chain a given request type must follow. An org-specific chain wins over
// the platform default, so a business unit can require an extra signature
// without every other org inheriting it.
async function forRequestType(requestType, organizationId = null) {
  const candidates = await ApprovalChain.findAll({ where: { requestType, isActive: true }, ...withSteps });
  if (candidates.length === 0) return null;
  return candidates.find((c) => organizationId && c.organizationId === organizationId)
    || candidates.find((c) => !c.organizationId)
    || null;
}

// Replace the chain's steps wholesale. Order is taken from array POSITION, not
// from a client-supplied stepOrder: two steps claiming the same position is an
// ambiguous chain, and it would surface later as a request stuck at a rung
// nobody can name. Renumbering here makes that unrepresentable.
async function setSteps(id, steps, actorUid) {
  await crud.getById(id);
  const list = Array.isArray(steps) ? steps : [];
  if (list.some((s) => !s.name)) throw new CustomError('every step needs a name', 400, 'VALIDATION_ERROR');
  if (list.some((s) => !s.approverRoleId && !s.approverPrincipalId)) {
    throw new CustomError('every step needs an approverRoleId or approverPrincipalId', 400, 'VALIDATION_ERROR');
  }
  await ApprovalStep.destroy({ where: { chainId: id } });
  await ApprovalStep.bulkCreate(list.map((s, i) => ({
    chainId: id,
    stepOrder: i + 1,
    name: s.name,
    approverRoleId: s.approverRoleId || null,
    approverPrincipalId: s.approverPrincipalId || null,
    requiredApprovals: s.requiredApprovals || 1,
    slaHours: s.slaHours || null,
  })));
  await audit.log({
    actorUid, action: 'approvalChain.setSteps', targetType: 'approvalChain', targetId: id, changes: { steps: list.length },
  });
  return getWithSteps(id);
}

module.exports = {
  ...crud, getById: getWithSteps, setSteps, forRequestType,
};
