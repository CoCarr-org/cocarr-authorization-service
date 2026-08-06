// THE PLATFORM TAXONOMY — Product > Portal > Module > SubModule > Action.
//
// GENERATED — do not edit by hand. Run:
//     node scripts/generateTaxonomy.js
// after any change to cocarr-platform-web's navConfig.js, then re-seed.
//
// It is derived from the real navigation (not maintained beside it) so the IAM
// tree and the sidebar people actually use cannot drift apart. The dynamic UI
// renders from this, so anything missing here is a screen that vanishes.
//
// Product ownership, module keying and the sub-module-key-is-its-route rule are
// documented in scripts/generateTaxonomy.js alongside the code that applies them.
const PRODUCTS = [
  {
    "key": "platform",
    "name": "Platform",
    "icon": "shield",
    "sortOrder": 10,
    "portals": [
      {
        "key": "admin",
        "name": "Administration",
        "icon": "settings",
        "sortOrder": 10,
        "modules": [
          {
            "key": "adminAccounts",
            "name": "Administration",
            "route": "/dashboard/admin-accounts",
            "icon": "settings",
            "sortOrder": 10,
            "permissions": [
              {
                "key": "platform.adminAccounts.read",
                "action": "read"
              },
              {
                "key": "platform.adminAccounts.create",
                "action": "create"
              },
              {
                "key": "platform.adminAccounts.update",
                "action": "update"
              },
              {
                "key": "platform.adminAccounts.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/admin-accounts",
                "name": "Admin Accounts",
                "route": "/dashboard/admin-accounts",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "platform.adminAccounts.admin-accounts.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "roles",
            "name": "Teams & Access",
            "route": "/dashboard/teams-access",
            "icon": "settings",
            "sortOrder": 20,
            "permissions": [
              {
                "key": "platform.roles.read",
                "action": "read"
              },
              {
                "key": "platform.roles.create",
                "action": "create"
              },
              {
                "key": "platform.roles.update",
                "action": "update"
              },
              {
                "key": "platform.roles.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/teams-access",
                "name": "Roles & Permissions",
                "route": "/dashboard/teams-access",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "platform.roles.teams-access.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "auditLogs",
            "name": "Audit",
            "route": "/dashboard/admin-activity",
            "icon": "docs",
            "sortOrder": 30,
            "permissions": [
              {
                "key": "platform.auditLogs.read",
                "action": "read"
              },
              {
                "key": "platform.auditLogs.create",
                "action": "create"
              },
              {
                "key": "platform.auditLogs.update",
                "action": "update"
              },
              {
                "key": "platform.auditLogs.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/admin-activity",
                "name": "Admin Activity Logs",
                "route": "/dashboard/admin-activity",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "platform.auditLogs.admin-activity.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/audit",
                "name": "Audit Logs",
                "route": "/dashboard/audit",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "platform.auditLogs.audit.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "security",
            "name": "Security",
            "route": "/dashboard/admin-logins",
            "icon": "settings",
            "sortOrder": 40,
            "permissions": [
              {
                "key": "platform.security.read",
                "action": "read"
              },
              {
                "key": "platform.security.create",
                "action": "create"
              },
              {
                "key": "platform.security.update",
                "action": "update"
              },
              {
                "key": "platform.security.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/admin-logins",
                "name": "Login History",
                "route": "/dashboard/admin-logins",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "platform.security.admin-logins.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/security-settings",
                "name": "Authentication",
                "route": "/dashboard/security-settings",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "platform.security.security-settings.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "settings",
            "name": "Settings",
            "route": "/dashboard/general-settings",
            "icon": "settings",
            "sortOrder": 50,
            "permissions": [
              {
                "key": "platform.settings.read",
                "action": "read"
              },
              {
                "key": "platform.settings.create",
                "action": "create"
              },
              {
                "key": "platform.settings.update",
                "action": "update"
              },
              {
                "key": "platform.settings.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/general-settings",
                "name": "General",
                "route": "/dashboard/general-settings",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "platform.settings.general-settings.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/settings-business",
                "name": "Company Profile",
                "route": "/dashboard/settings-business",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "platform.settings.settings-business.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/settings-payments",
                "name": "Payment Gateways",
                "route": "/dashboard/settings-payments",
                "sortOrder": 30,
                "permissions": [
                  {
                    "key": "platform.settings.settings-payments.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/settings-maps",
                "name": "Maps",
                "route": "/dashboard/settings-maps",
                "sortOrder": 40,
                "permissions": [
                  {
                    "key": "platform.settings.settings-maps.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/settings-tax",
                "name": "Tax",
                "route": "/dashboard/settings-tax",
                "sortOrder": 50,
                "permissions": [
                  {
                    "key": "platform.settings.settings-tax.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/settings/preferences",
                "name": "Fees & Charges",
                "route": "/dashboard/settings/preferences",
                "sortOrder": 60,
                "permissions": [
                  {
                    "key": "platform.settings.preferences.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/policies",
                "name": "Policies",
                "route": "/dashboard/policies",
                "sortOrder": 70,
                "permissions": [
                  {
                    "key": "platform.settings.policies.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "integrations",
            "name": "Integrations",
            "route": "/dashboard/integrations",
            "icon": "settings",
            "sortOrder": 60,
            "permissions": [
              {
                "key": "platform.integrations.read",
                "action": "read"
              },
              {
                "key": "platform.integrations.create",
                "action": "create"
              },
              {
                "key": "platform.integrations.update",
                "action": "update"
              },
              {
                "key": "platform.integrations.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/integrations",
                "name": "Integrations",
                "route": "/dashboard/integrations",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "platform.integrations.home.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "systemHealth",
            "name": "System",
            "route": "/dashboard/system-health",
            "icon": "settings",
            "sortOrder": 70,
            "permissions": [
              {
                "key": "platform.systemHealth.read",
                "action": "read"
              },
              {
                "key": "platform.systemHealth.create",
                "action": "create"
              },
              {
                "key": "platform.systemHealth.update",
                "action": "update"
              },
              {
                "key": "platform.systemHealth.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/system-health",
                "name": "System Health",
                "route": "/dashboard/system-health",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "platform.systemHealth.system-health.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/developer/queue",
                "name": "Background Jobs",
                "route": "/dashboard/developer/queue",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "platform.systemHealth.developer.queue.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "organizations",
            "name": "Organizations",
            "route": "/dashboard/platform/organizations",
            "icon": "apps",
            "sortOrder": 80,
            "permissions": [
              {
                "key": "platform.organizations.read",
                "action": "read"
              },
              {
                "key": "platform.organizations.create",
                "action": "create"
              },
              {
                "key": "platform.organizations.update",
                "action": "update"
              },
              {
                "key": "platform.organizations.delete",
                "action": "delete"
              }
            ],
            "subModules": []
          },
          {
            "key": "iamTaxonomy",
            "name": "Products & Modules",
            "route": "/dashboard/platform/taxonomy",
            "icon": "apps",
            "sortOrder": 90,
            "permissions": [
              {
                "key": "platform.iamTaxonomy.read",
                "action": "read"
              },
              {
                "key": "platform.iamTaxonomy.create",
                "action": "create"
              },
              {
                "key": "platform.iamTaxonomy.update",
                "action": "update"
              },
              {
                "key": "platform.iamTaxonomy.delete",
                "action": "delete"
              }
            ],
            "subModules": []
          },
          {
            "key": "permissions",
            "name": "Permissions",
            "route": "/dashboard/platform/permissions",
            "icon": "settings",
            "sortOrder": 100,
            "permissions": [
              {
                "key": "platform.permissions.read",
                "action": "read"
              },
              {
                "key": "platform.permissions.create",
                "action": "create"
              },
              {
                "key": "platform.permissions.update",
                "action": "update"
              },
              {
                "key": "platform.permissions.delete",
                "action": "delete"
              }
            ],
            "subModules": []
          },
          {
            "key": "approvalChains",
            "name": "Approval Chains",
            "route": "/dashboard/platform/approval-chains",
            "icon": "docs",
            "sortOrder": 110,
            "permissions": [
              {
                "key": "platform.approvalChains.read",
                "action": "read"
              },
              {
                "key": "platform.approvalChains.create",
                "action": "create"
              },
              {
                "key": "platform.approvalChains.update",
                "action": "update"
              },
              {
                "key": "platform.approvalChains.delete",
                "action": "delete"
              }
            ],
            "subModules": []
          },
          {
            "key": "featureFlags",
            "name": "Feature Flags",
            "route": "/dashboard/platform/feature-flags",
            "icon": "settings",
            "sortOrder": 120,
            "permissions": [
              {
                "key": "platform.featureFlags.read",
                "action": "read"
              },
              {
                "key": "platform.featureFlags.create",
                "action": "create"
              },
              {
                "key": "platform.featureFlags.update",
                "action": "update"
              },
              {
                "key": "platform.featureFlags.delete",
                "action": "delete"
              }
            ],
            "subModules": []
          }
        ]
      }
    ]
  },
  {
    "key": "workspace",
    "name": "Workspace",
    "icon": "people",
    "sortOrder": 20,
    "portals": [
      {
        "key": "workspace",
        "name": "Workspace",
        "icon": "people",
        "sortOrder": 10,
        "modules": [
          {
            "key": "employees",
            "name": "Employees",
            "route": "/dashboard/workspace/employees",
            "icon": "people",
            "sortOrder": 10,
            "permissions": [
              {
                "key": "workspace.employees.read",
                "action": "read"
              },
              {
                "key": "workspace.employees.create",
                "action": "create"
              },
              {
                "key": "workspace.employees.update",
                "action": "update"
              },
              {
                "key": "workspace.employees.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/workspace/employees",
                "name": "Employees",
                "route": "/dashboard/workspace/employees",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "workspace.employees.workspace.employees.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/workspace/onboarding",
                "name": "Onboarding",
                "route": "/dashboard/workspace/onboarding",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "workspace.employees.workspace.onboarding.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "orgStructure",
            "name": "Organization",
            "route": "/dashboard/workspace/departments",
            "icon": "apps",
            "sortOrder": 20,
            "permissions": [
              {
                "key": "workspace.orgStructure.read",
                "action": "read"
              },
              {
                "key": "workspace.orgStructure.create",
                "action": "create"
              },
              {
                "key": "workspace.orgStructure.update",
                "action": "update"
              },
              {
                "key": "workspace.orgStructure.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/workspace/departments",
                "name": "Departments",
                "route": "/dashboard/workspace/departments",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "workspace.orgStructure.workspace.departments.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/workspace/designations",
                "name": "Designations",
                "route": "/dashboard/workspace/designations",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "workspace.orgStructure.workspace.designations.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/workspace/teams",
                "name": "Teams",
                "route": "/dashboard/workspace/teams",
                "sortOrder": 30,
                "permissions": [
                  {
                    "key": "workspace.orgStructure.workspace.teams.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "recruitment",
            "name": "Recruitment",
            "route": "/dashboard/workspace/candidates",
            "icon": "people",
            "sortOrder": 30,
            "permissions": [
              {
                "key": "workspace.recruitment.read",
                "action": "read"
              },
              {
                "key": "workspace.recruitment.create",
                "action": "create"
              },
              {
                "key": "workspace.recruitment.update",
                "action": "update"
              },
              {
                "key": "workspace.recruitment.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/workspace/candidates",
                "name": "Candidates",
                "route": "/dashboard/workspace/candidates",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "workspace.recruitment.workspace.candidates.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "accessRequests",
            "name": "Access Requests",
            "route": "/dashboard/workspace/access-requests",
            "icon": "docs",
            "sortOrder": 40,
            "permissions": [
              {
                "key": "workspace.accessRequests.read",
                "action": "read"
              },
              {
                "key": "workspace.accessRequests.create",
                "action": "create"
              },
              {
                "key": "workspace.accessRequests.update",
                "action": "update"
              },
              {
                "key": "workspace.accessRequests.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/workspace/access-requests",
                "name": "Access Requests",
                "route": "/dashboard/workspace/access-requests",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "workspace.accessRequests.workspace.access-requests.read",
                    "action": "read"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "key": "operations",
    "name": "Operations",
    "icon": "car",
    "sortOrder": 30,
    "portals": [
      {
        "key": "ops",
        "name": "Operations",
        "icon": "car",
        "sortOrder": 10,
        "modules": [
          {
            "key": "dashboard",
            "name": "Dashboard",
            "route": "/dashboard",
            "icon": "apps",
            "sortOrder": 10,
            "permissions": [
              {
                "key": "operations.dashboard.read",
                "action": "read"
              },
              {
                "key": "operations.dashboard.create",
                "action": "create"
              },
              {
                "key": "operations.dashboard.update",
                "action": "update"
              },
              {
                "key": "operations.dashboard.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard",
                "name": "Dashboard",
                "route": "/dashboard",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.dashboard.home.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "users",
            "name": "User Management",
            "route": "/dashboard/user-management",
            "icon": "people",
            "sortOrder": 20,
            "permissions": [
              {
                "key": "operations.users.read",
                "action": "read"
              },
              {
                "key": "operations.users.create",
                "action": "create"
              },
              {
                "key": "operations.users.update",
                "action": "update"
              },
              {
                "key": "operations.users.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/user-management",
                "name": "Overview",
                "route": "/dashboard/user-management",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.users.user-management.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/users",
                "name": "Customers",
                "route": "/dashboard/users",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.users.home.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/users/verification",
                "name": "KYC Verification Queue",
                "route": "/dashboard/users/verification",
                "sortOrder": 30,
                "permissions": [
                  {
                    "key": "operations.users.verification.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/users/documents",
                "name": "KYC & Documents",
                "route": "/dashboard/users/documents",
                "sortOrder": 40,
                "permissions": [
                  {
                    "key": "operations.users.documents.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/users/referrals",
                "name": "Referrals",
                "route": "/dashboard/users/referrals",
                "sortOrder": 50,
                "permissions": [
                  {
                    "key": "operations.users.referrals.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/wallet",
                "name": "Wallets",
                "route": "/dashboard/wallet",
                "sortOrder": 60,
                "permissions": [
                  {
                    "key": "operations.users.wallet.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "hosts",
            "name": "Hosts",
            "route": "/dashboard/hosts",
            "icon": "people",
            "sortOrder": 30,
            "permissions": [
              {
                "key": "operations.hosts.read",
                "action": "read"
              },
              {
                "key": "operations.hosts.create",
                "action": "create"
              },
              {
                "key": "operations.hosts.update",
                "action": "update"
              },
              {
                "key": "operations.hosts.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/hosts",
                "name": "Hosts / Partners",
                "route": "/dashboard/hosts",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.hosts.home.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/reports/driver",
                "name": "Driver Reports",
                "route": "/dashboard/reports/driver",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.hosts.reports.driver.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "payouts",
            "name": "Payouts & Settlements",
            "route": "/dashboard/finance/bank-accounts",
            "icon": "cash",
            "sortOrder": 40,
            "permissions": [
              {
                "key": "operations.payouts.read",
                "action": "read"
              },
              {
                "key": "operations.payouts.create",
                "action": "create"
              },
              {
                "key": "operations.payouts.update",
                "action": "update"
              },
              {
                "key": "operations.payouts.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/finance/bank-accounts",
                "name": "Host Bank Accounts",
                "route": "/dashboard/finance/bank-accounts",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.payouts.finance.bank-accounts.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/finance/settlements",
                "name": "Settlements",
                "route": "/dashboard/finance/settlements",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.payouts.finance.settlements.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/finance/invoices",
                "name": "Invoices",
                "route": "/dashboard/finance/invoices",
                "sortOrder": 30,
                "permissions": [
                  {
                    "key": "operations.payouts.finance.invoices.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "vehicles",
            "name": "Vehicles",
            "route": "/dashboard/vehicles",
            "icon": "car",
            "sortOrder": 50,
            "permissions": [
              {
                "key": "operations.vehicles.read",
                "action": "read"
              },
              {
                "key": "operations.vehicles.create",
                "action": "create"
              },
              {
                "key": "operations.vehicles.update",
                "action": "update"
              },
              {
                "key": "operations.vehicles.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/vehicles",
                "name": "Vehicles",
                "route": "/dashboard/vehicles",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.vehicles.home.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/vehicles/rc",
                "name": "Vehicle RC Details",
                "route": "/dashboard/vehicles/rc",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.vehicles.rc.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/availability-schedule",
                "name": "Scheduling",
                "route": "/dashboard/availability-schedule",
                "sortOrder": 30,
                "permissions": [
                  {
                    "key": "operations.vehicles.availability-schedule.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/settings/brands",
                "name": "Vehicle Brands",
                "route": "/dashboard/settings/brands",
                "sortOrder": 40,
                "permissions": [
                  {
                    "key": "operations.vehicles.settings.brands.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/settings/pickup-points",
                "name": "Pickup Points",
                "route": "/dashboard/settings/pickup-points",
                "sortOrder": 50,
                "permissions": [
                  {
                    "key": "operations.vehicles.settings.pickup-points.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "bookings",
            "name": "Bookings",
            "route": "/dashboard/rides",
            "icon": "car",
            "sortOrder": 60,
            "permissions": [
              {
                "key": "operations.bookings.read",
                "action": "read"
              },
              {
                "key": "operations.bookings.create",
                "action": "create"
              },
              {
                "key": "operations.bookings.update",
                "action": "update"
              },
              {
                "key": "operations.bookings.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/rides",
                "name": "Bookings",
                "route": "/dashboard/rides",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.bookings.rides.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/operations/trips",
                "name": "Trips",
                "route": "/dashboard/operations/trips",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.bookings.operations.trips.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/operations/damages",
                "name": "Damage Claims",
                "route": "/dashboard/operations/damages",
                "sortOrder": 30,
                "permissions": [
                  {
                    "key": "operations.bookings.operations.damages.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/support/complaints",
                "name": "Complaints",
                "route": "/dashboard/support/complaints",
                "sortOrder": 40,
                "permissions": [
                  {
                    "key": "operations.bookings.support.complaints.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "payments",
            "name": "Finance",
            "route": "/dashboard/payments",
            "icon": "cash",
            "sortOrder": 70,
            "permissions": [
              {
                "key": "operations.payments.read",
                "action": "read"
              },
              {
                "key": "operations.payments.create",
                "action": "create"
              },
              {
                "key": "operations.payments.update",
                "action": "update"
              },
              {
                "key": "operations.payments.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/payments",
                "name": "Transactions",
                "route": "/dashboard/payments",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.payments.home.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/dues",
                "name": "Dues",
                "route": "/dashboard/dues",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.payments.dues.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/finance/refunds",
                "name": "Refunds",
                "route": "/dashboard/finance/refunds",
                "sortOrder": 30,
                "permissions": [
                  {
                    "key": "operations.payments.finance.refunds.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "marketing",
            "name": "Marketing",
            "route": "/dashboard/offers",
            "icon": "cash",
            "sortOrder": 80,
            "permissions": [
              {
                "key": "operations.marketing.read",
                "action": "read"
              },
              {
                "key": "operations.marketing.create",
                "action": "create"
              },
              {
                "key": "operations.marketing.update",
                "action": "update"
              },
              {
                "key": "operations.marketing.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/offers",
                "name": "Coupons",
                "route": "/dashboard/offers",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.marketing.offers.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/membership",
                "name": "Promotions",
                "route": "/dashboard/membership",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.marketing.membership.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/marketing/campaigns",
                "name": "Email/SMS Campaigns",
                "route": "/dashboard/marketing/campaigns",
                "sortOrder": 30,
                "permissions": [
                  {
                    "key": "operations.marketing.campaigns.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/marketing/push",
                "name": "Push Notifications",
                "route": "/dashboard/marketing/push",
                "sortOrder": 40,
                "permissions": [
                  {
                    "key": "operations.marketing.push.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/marketing/referrals",
                "name": "Referral Program",
                "route": "/dashboard/marketing/referrals",
                "sortOrder": 50,
                "permissions": [
                  {
                    "key": "operations.marketing.referrals.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/marketing/referral-campaigns",
                "name": "Referral Campaigns",
                "route": "/dashboard/marketing/referral-campaigns",
                "sortOrder": 60,
                "permissions": [
                  {
                    "key": "operations.marketing.referral-campaigns.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/marketing/referral-analytics",
                "name": "Referral Analytics",
                "route": "/dashboard/marketing/referral-analytics",
                "sortOrder": 70,
                "permissions": [
                  {
                    "key": "operations.marketing.referral-analytics.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/settings/membership-types",
                "name": "Membership Types",
                "route": "/dashboard/settings/membership-types",
                "sortOrder": 80,
                "permissions": [
                  {
                    "key": "operations.marketing.settings.membership-types.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "support",
            "name": "Support",
            "route": "/dashboard/support",
            "icon": "docs",
            "sortOrder": 90,
            "permissions": [
              {
                "key": "operations.support.read",
                "action": "read"
              },
              {
                "key": "operations.support.create",
                "action": "create"
              },
              {
                "key": "operations.support.update",
                "action": "update"
              },
              {
                "key": "operations.support.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/support",
                "name": "Support Tickets",
                "route": "/dashboard/support",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.support.home.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/support/feedback",
                "name": "Feedback",
                "route": "/dashboard/support/feedback",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.support.feedback.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "reports",
            "name": "Reports",
            "route": "/dashboard/reports",
            "icon": "apps",
            "sortOrder": 100,
            "permissions": [
              {
                "key": "operations.reports.read",
                "action": "read"
              },
              {
                "key": "operations.reports.create",
                "action": "create"
              },
              {
                "key": "operations.reports.update",
                "action": "update"
              },
              {
                "key": "operations.reports.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/reports",
                "name": "Business Reports",
                "route": "/dashboard/reports",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.reports.home.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/reports/customer",
                "name": "Customer Reports",
                "route": "/dashboard/reports/customer",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.reports.customer.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/reports/performance",
                "name": "Performance Reports",
                "route": "/dashboard/reports/performance",
                "sortOrder": 30,
                "permissions": [
                  {
                    "key": "operations.reports.performance.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/reports/custom",
                "name": "Custom Reports",
                "route": "/dashboard/reports/custom",
                "sortOrder": 40,
                "permissions": [
                  {
                    "key": "operations.reports.custom.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/reports/exports",
                "name": "Export Centre",
                "route": "/dashboard/reports/exports",
                "sortOrder": 50,
                "permissions": [
                  {
                    "key": "operations.reports.exports.read",
                    "action": "read"
                  }
                ]
              }
            ]
          },
          {
            "key": "masterData",
            "name": "Master Data",
            "route": "/dashboard/settings/cities",
            "icon": "docs",
            "sortOrder": 110,
            "permissions": [
              {
                "key": "operations.masterData.read",
                "action": "read"
              },
              {
                "key": "operations.masterData.create",
                "action": "create"
              },
              {
                "key": "operations.masterData.update",
                "action": "update"
              },
              {
                "key": "operations.masterData.delete",
                "action": "delete"
              }
            ],
            "subModules": [
              {
                "key": "/dashboard/settings/cities",
                "name": "Service Areas",
                "route": "/dashboard/settings/cities",
                "sortOrder": 10,
                "permissions": [
                  {
                    "key": "operations.masterData.settings.cities.read",
                    "action": "read"
                  }
                ]
              },
              {
                "key": "/dashboard/settings/protection-plan",
                "name": "Protection Plans",
                "route": "/dashboard/settings/protection-plan",
                "sortOrder": 20,
                "permissions": [
                  {
                    "key": "operations.masterData.settings.protection-plan.read",
                    "action": "read"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

module.exports = { PRODUCTS };
