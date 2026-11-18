import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export interface MapsPlaceChunk {
  title: string;
  uri: string;
  placeId?: string;
  snippet?: string;
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull().default(''),
  role: text('role').notNull().default('viewer'),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
});

export const portalSettings = pgTable('portal_settings', {
  id: serial('id').primaryKey(),
  settingKey: text('setting_key').notNull().unique(),
  maintenanceMode: boolean('maintenance_mode').notNull().default(false),
  maintenanceMessage: text('maintenance_message')
    .notNull()
    .default('System is currently under scheduled maintenance. Please check back shortly.'),
  notificationMessage: text('notification_message')
    .notNull()
    .default('All systems operational'),
  defaultEmiInsurance: text('default_emi_insurance').notNull().default('double'),
  defaultThemeMode: text('default_theme_mode').notNull().default('light'),
  scene3dDefaultMode: boolean('scene_3d_default_mode').notNull().default(true),
  featurePermissionsJson: jsonb('feature_permissions_json')
    .$type<Record<string, boolean>>()
    .notNull(),
  updatedByEmail: text('updated_by_email').notNull().default('system'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const branchControls = pgTable('branch_controls', {
  id: serial('id').primaryKey(),
  branchName: text('branch_name').notNull().unique(),
  priorityStatus: text('priority_status').notNull().default('normal'),
  isLocked: boolean('is_locked').notNull().default(false),
  adminNote: text('admin_note').notNull().default(''),
  updatedByEmail: text('updated_by_email').notNull().default('system'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const feedbackRatings = pgTable('feedback_ratings', {
  id: serial('id').primaryKey(),
  rating: integer('rating').notNull(),
  tagsJson: jsonb('tags_json').$type<string[]>().notNull(),
  comment: text('comment').notNull().default(''),
  submittedByEmail: text('submitted_by_email').notNull().default('anonymous'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: serial('id').primaryKey(),
  actorUid: text('actor_uid').notNull(),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const branchMapsCache = pgTable('branch_maps_cache', {
  id: serial('id').primaryKey(),
  branchQuery: text('branch_query').notNull().unique(),
  summaryMarkdown: text('summary_markdown').notNull(),
  placesJson: jsonb('places_json').$type<MapsPlaceChunk[]>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
