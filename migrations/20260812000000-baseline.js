// BASELINE — the schema as it stood when migrations were adopted.
//
// GENERATED, then frozen. Captured with SHOW CREATE TABLE from a database built
// by the db.sync({alter:true}) this replaces, so these statements are exactly
// what an environment already has — rather than a hand transcription of 21
// models, where a wrong column type would be invisible on every existing
// database (the baseline skips tables that exist) and would only surface the
// first time somebody built a fresh one.
//
// Frozen on purpose: never regenerate this file. A baseline describes the schema
// at ITS point in history; regenerating it later rewrites history to match
// whatever the models say then, which is the one thing a migration must not do.
//
// ORDER IS DERIVED, NOT GUESSED. The sequence below is a topological sort of the
// 19 foreign keys in information_schema — a table is created only after every
// table it points at. MySQL rejects it otherwise, and with 21 tables the order
// is not something to eyeball.
//
// Each table is created ONLY if absent, and the migration is recorded either
// way, so both cases end correct:
//   FRESH     no tables            -> all 21 created, in FK order
//   EXISTING  built by alter-sync  -> nothing created, just recorded
//
// This supersedes scripts/syncTables.js for new environments. That script stays
// as the emergency repair for a database whose alter-sync aborted partway
// BEFORE migrations were adopted — the situation that lost roleAssignments.
const STATEMENTS = [
  {
    table: "approvalChains",
    ddl: "CREATE TABLE `approvalChains` (\n  `id` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `requestType` varchar(255) NOT NULL,\n  `organizationId` varchar(255) DEFAULT NULL,\n  `description` text,\n  `isActive` tinyint(1) DEFAULT '1',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`),\n  KEY `approval_chains_request_type` (`requestType`),\n  KEY `approval_chains_organization_id` (`organizationId`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "auditLogs",
    ddl: "CREATE TABLE `auditLogs` (\n  `id` varchar(255) NOT NULL,\n  `actorUid` varchar(255) DEFAULT NULL,\n  `action` varchar(255) NOT NULL,\n  `targetType` varchar(255) DEFAULT NULL,\n  `targetId` varchar(255) DEFAULT NULL,\n  `changes` json DEFAULT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  KEY `audit_logs_target_type_target_id` (`targetType`,`targetId`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "featureFlags",
    ddl: "CREATE TABLE `featureFlags` (\n  `id` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `description` text,\n  `isEnabled` tinyint(1) NOT NULL DEFAULT '0',\n  `scopeType` enum('global','product','portal','organization') NOT NULL DEFAULT 'global',\n  `scopeId` varchar(255) DEFAULT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`),\n  KEY `feature_flags_key` (`key`),\n  KEY `feature_flags_scope_type_scope_id` (`scopeType`,`scopeId`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "globalSettings",
    ddl: "CREATE TABLE `globalSettings` (\n  `id` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `value` text,\n  `valueType` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',\n  `category` varchar(255) DEFAULT NULL,\n  `description` text,\n  `isSecret` tinyint(1) NOT NULL DEFAULT '0',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`),\n  KEY `global_settings_key` (`key`),\n  KEY `global_settings_category` (`category`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "organizations",
    ddl: "CREATE TABLE `organizations` (\n  `id` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `type` enum('company','business_unit','division','branch') NOT NULL DEFAULT 'company',\n  `parentId` varchar(255) DEFAULT NULL,\n  `description` text,\n  `isActive` tinyint(1) DEFAULT '1',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`),\n  KEY `organizations_parent_id` (`parentId`),\n  KEY `organizations_key` (`key`),\n  CONSTRAINT `organizations_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `organizations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "permissionSets",
    ddl: "CREATE TABLE `permissionSets` (\n  `id` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `description` text,\n  `isSystem` tinyint(1) DEFAULT '0',\n  `isActive` tinyint(1) DEFAULT '1',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "policies",
    ddl: "CREATE TABLE `policies` (\n  `id` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `effect` enum('allow','deny') NOT NULL DEFAULT 'allow',\n  `permissionKey` varchar(255) NOT NULL,\n  `principalId` varchar(255) DEFAULT NULL,\n  `roleId` varchar(255) DEFAULT NULL,\n  `resource` varchar(255) DEFAULT NULL,\n  `condition` json DEFAULT NULL,\n  `priority` int DEFAULT '100',\n  `isActive` tinyint(1) DEFAULT '1',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`),\n  KEY `policies_principal_id` (`principalId`),\n  KEY `policies_role_id` (`roleId`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "products",
    ddl: "CREATE TABLE `products` (\n  `id` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `icon` varchar(255) DEFAULT NULL,\n  `sortOrder` int NOT NULL DEFAULT '0',\n  `description` text,\n  `isActive` tinyint(1) DEFAULT '1',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "roles",
    ddl: "CREATE TABLE `roles` (\n  `id` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `description` text,\n  `isSuperAdmin` tinyint(1) DEFAULT '0',\n  `isSystem` tinyint(1) DEFAULT '0',\n  `department` varchar(255) DEFAULT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "approvalRequests",
    ddl: "CREATE TABLE `approvalRequests` (\n  `id` varchar(255) NOT NULL,\n  `chainId` varchar(255) NOT NULL,\n  `requestType` varchar(255) NOT NULL,\n  `subjectType` varchar(255) NOT NULL,\n  `subjectId` varchar(255) NOT NULL,\n  `organizationId` varchar(255) DEFAULT NULL,\n  `requestedByPrincipalId` varchar(255) DEFAULT NULL,\n  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',\n  `currentStepOrder` int DEFAULT '1',\n  `summary` varchar(255) DEFAULT NULL,\n  `metadata` json DEFAULT NULL,\n  `decidedAt` datetime DEFAULT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  KEY `chainId` (`chainId`),\n  KEY `approval_requests_request_type` (`requestType`),\n  KEY `approval_requests_status` (`status`),\n  KEY `approval_requests_subject_type_subject_id` (`subjectType`,`subjectId`),\n  CONSTRAINT `approvalrequests_ibfk_1` FOREIGN KEY (`chainId`) REFERENCES `approvalChains` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "approvalSteps",
    ddl: "CREATE TABLE `approvalSteps` (\n  `id` varchar(255) NOT NULL,\n  `chainId` varchar(255) NOT NULL,\n  `stepOrder` int NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `approverRoleId` varchar(255) DEFAULT NULL,\n  `approverPrincipalId` varchar(255) DEFAULT NULL,\n  `requiredApprovals` int NOT NULL DEFAULT '1',\n  `slaHours` int DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT '1',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `approval_steps_chain_id_step_order` (`chainId`,`stepOrder`),\n  KEY `approval_steps_approver_role_id` (`approverRoleId`),\n  CONSTRAINT `approvalsteps_ibfk_1` FOREIGN KEY (`chainId`) REFERENCES `approvalChains` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,\n  CONSTRAINT `approvalsteps_ibfk_2` FOREIGN KEY (`approverRoleId`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "delegations",
    ddl: "CREATE TABLE `delegations` (\n  `id` varchar(255) NOT NULL,\n  `fromPrincipalId` varchar(255) NOT NULL,\n  `toPrincipalId` varchar(255) NOT NULL,\n  `roleId` varchar(255) NOT NULL,\n  `reason` varchar(255) DEFAULT NULL,\n  `startsAt` datetime NOT NULL,\n  `expiresAt` datetime DEFAULT NULL,\n  `revokedAt` datetime DEFAULT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  KEY `roleId` (`roleId`),\n  KEY `delegations_to_principal_id` (`toPrincipalId`),\n  KEY `delegations_from_principal_id` (`fromPrincipalId`),\n  CONSTRAINT `delegations_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "portals",
    ddl: "CREATE TABLE `portals` (\n  `id` varchar(255) NOT NULL,\n  `productId` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `icon` varchar(255) DEFAULT NULL,\n  `sortOrder` int NOT NULL DEFAULT '0',\n  `description` text,\n  `isActive` tinyint(1) DEFAULT '1',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`),\n  KEY `portals_product_id` (`productId`),\n  CONSTRAINT `portals_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "roleAssignments",
    ddl: "CREATE TABLE `roleAssignments` (\n  `id` varchar(255) NOT NULL,\n  `principalId` varchar(255) NOT NULL,\n  `roleId` varchar(255) NOT NULL,\n  `scope` varchar(255) DEFAULT NULL,\n  `organizationId` varchar(255) DEFAULT NULL,\n  `grantedByUid` varchar(255) DEFAULT NULL,\n  `reason` varchar(255) DEFAULT NULL,\n  `expiresAt` datetime DEFAULT NULL,\n  `revokedAt` datetime DEFAULT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  KEY `organizationId` (`organizationId`),\n  KEY `role_assignments_principal_id` (`principalId`),\n  KEY `role_assignments_role_id` (`roleId`),\n  CONSTRAINT `roleassignments_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON UPDATE CASCADE,\n  CONSTRAINT `roleassignments_ibfk_2` FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "rolePermissionSets",
    ddl: "CREATE TABLE `rolePermissionSets` (\n  `id` varchar(255) NOT NULL,\n  `roleId` varchar(255) NOT NULL,\n  `permissionSetId` varchar(255) NOT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `rolePermissionSets_permissionSetId_roleId_unique` (`roleId`,`permissionSetId`),\n  UNIQUE KEY `role_permission_sets_role_id_permission_set_id` (`roleId`,`permissionSetId`),\n  KEY `permissionSetId` (`permissionSetId`),\n  CONSTRAINT `rolepermissionsets_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,\n  CONSTRAINT `rolepermissionsets_ibfk_2` FOREIGN KEY (`permissionSetId`) REFERENCES `permissionSets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "approvalDecisions",
    ddl: "CREATE TABLE `approvalDecisions` (\n  `id` varchar(255) NOT NULL,\n  `requestId` varchar(255) NOT NULL,\n  `stepId` varchar(255) DEFAULT NULL,\n  `stepOrder` int NOT NULL,\n  `stepName` varchar(255) DEFAULT NULL,\n  `decision` enum('approved','rejected') NOT NULL,\n  `decidedByPrincipalId` varchar(255) NOT NULL,\n  `note` varchar(255) DEFAULT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  KEY `approval_decisions_request_id` (`requestId`),\n  KEY `approval_decisions_decided_by_principal_id` (`decidedByPrincipalId`),\n  CONSTRAINT `approvaldecisions_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `approvalRequests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "modules",
    ddl: "CREATE TABLE `modules` (\n  `id` varchar(255) NOT NULL,\n  `portalId` varchar(255) DEFAULT NULL,\n  `key` varchar(255) NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `route` varchar(255) DEFAULT NULL,\n  `icon` varchar(255) DEFAULT NULL,\n  `sortOrder` int NOT NULL DEFAULT '0',\n  `description` text,\n  `isActive` tinyint(1) DEFAULT '1',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`),\n  KEY `modules_portal_id` (`portalId`),\n  CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`portalId`) REFERENCES `portals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "subModules",
    ddl: "CREATE TABLE `subModules` (\n  `id` varchar(255) NOT NULL,\n  `moduleId` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `route` varchar(255) DEFAULT NULL,\n  `icon` varchar(255) DEFAULT NULL,\n  `sortOrder` int NOT NULL DEFAULT '0',\n  `description` text,\n  `isActive` tinyint(1) DEFAULT '1',\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`),\n  KEY `sub_modules_module_id` (`moduleId`),\n  KEY `sub_modules_key` (`key`),\n  CONSTRAINT `submodules_ibfk_1` FOREIGN KEY (`moduleId`) REFERENCES `modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "permissions",
    ddl: "CREATE TABLE `permissions` (\n  `id` varchar(255) NOT NULL,\n  `key` varchar(255) NOT NULL,\n  `moduleId` varchar(255) DEFAULT NULL,\n  `subModuleId` varchar(255) DEFAULT NULL,\n  `action` varchar(255) DEFAULT NULL,\n  `description` text,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `key` (`key`),\n  KEY `permissions_module_id` (`moduleId`),\n  KEY `permissions_sub_module_id` (`subModuleId`),\n  KEY `permissions_key` (`key`),\n  CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`moduleId`) REFERENCES `modules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,\n  CONSTRAINT `permissions_ibfk_2` FOREIGN KEY (`subModuleId`) REFERENCES `subModules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "permissionSetPermissions",
    ddl: "CREATE TABLE `permissionSetPermissions` (\n  `id` varchar(255) NOT NULL,\n  `permissionSetId` varchar(255) NOT NULL,\n  `permissionId` varchar(255) NOT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `permissionSetPermissions_permissionId_permissionSetId_unique` (`permissionSetId`,`permissionId`),\n  UNIQUE KEY `permission_set_permissions_permission_set_id_permission_id` (`permissionSetId`,`permissionId`),\n  KEY `permissionId` (`permissionId`),\n  CONSTRAINT `permissionsetpermissions_ibfk_1` FOREIGN KEY (`permissionSetId`) REFERENCES `permissionSets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,\n  CONSTRAINT `permissionsetpermissions_ibfk_2` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
  {
    table: "rolePermissions",
    ddl: "CREATE TABLE `rolePermissions` (\n  `id` varchar(255) NOT NULL,\n  `roleId` varchar(255) NOT NULL,\n  `permissionId` varchar(255) NOT NULL,\n  `createdAt` datetime NOT NULL,\n  `updatedAt` datetime NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `rolePermissions_permissionId_roleId_unique` (`roleId`,`permissionId`),\n  UNIQUE KEY `role_permissions_role_id_permission_id` (`roleId`,`permissionId`),\n  KEY `permissionId` (`permissionId`),\n  CONSTRAINT `rolepermissions_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,\n  CONSTRAINT `rolepermissions_ibfk_2` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
  },
];

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.showAllTables();
    const have = new Set(existing.map((t) => (typeof t === 'string' ? t : t.tableName)));

    for (const { table, ddl } of STATEMENTS) {
      if (have.has(table)) continue;
      await queryInterface.sequelize.query(ddl);
    }
  },

  // DELIBERATELY REFUSES. Rolling back the baseline drops every table in the
  // IAM service — every role, assignment, policy and audit record. Losing this
  // schema does not break one screen: bootstrapOwnerService writes a
  // roleAssignment at AUTHENTICATION time, so every authenticated request on the
  // whole platform 500s.
  async down() {
    throw new Error(
      'The baseline cannot be rolled back — it would drop every IAM table, and IAM is on '
      + 'the authentication path for the entire platform. Restore from a backup instead.',
    );
  },
};
