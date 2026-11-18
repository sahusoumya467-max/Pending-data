import { db } from './index.ts';
import {
  portalSettings,
  branchControls,
  feedbackRatings,
  adminAuditLogs,
  branchMapsCache,
  MapsPlaceChunk,
} from './schema.ts';
import { desc, eq } from 'drizzle-orm';

export const DEFAULT_FEATURE_PERMISSIONS: Record<string, boolean> = {
  notification: true,
  overview: true,
  execVisualAnalytics: true,
  subcat: true,
  branchExplorer: true,
  rejectionConsole: true,
  pendingRecords: true,
  wavePulse: true,
  creditPortal: true,
  matrixCalculator: true,
  emiCalculator: true,
  ratingFeedback: true,
  syncSheets: true,
  festiveWish: true,
  currentAffairs: true,
  excelExport: true,
  branchReplies: true,
  threeDExperience: true,
  mapsGrounding: true,
};

export interface PortalSettingsPayload {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  notificationMessage: string;
  defaultEmiInsurance: 'double' | 'single' | 'none';
  defaultThemeMode: 'light' | 'dark';
  scene3dDefaultMode: boolean;
  featurePermissionsJson: Record<string, boolean>;
  updatedByEmail: string;
  updatedAt: string | null;
}

export async function getOrSeedPortalSettings(): Promise<PortalSettingsPayload> {
  try {
    const rows = await db
      .select()
      .from(portalSettings)
      .where(eq(portalSettings.settingKey, 'global'))
      .limit(1);

    if (rows.length > 0) {
      const row = rows[0];
      return {
        maintenanceMode: row.maintenanceMode,
        maintenanceMessage: row.maintenanceMessage,
        notificationMessage: row.notificationMessage,
        defaultEmiInsurance:
          row.defaultEmiInsurance === 'single' || row.defaultEmiInsurance === 'none'
            ? row.defaultEmiInsurance
            : 'double',
        defaultThemeMode: row.defaultThemeMode === 'dark' ? 'dark' : 'light',
        scene3dDefaultMode: row.scene3dDefaultMode,
        featurePermissionsJson: {
          ...DEFAULT_FEATURE_PERMISSIONS,
          ...(row.featurePermissionsJson || {}),
        },
        updatedByEmail: row.updatedByEmail,
        updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
      };
    }

    const inserted = await db
      .insert(portalSettings)
      .values({
        settingKey: 'global',
        maintenanceMode: false,
        maintenanceMessage:
          'System is currently under scheduled maintenance. Please check back shortly.',
        notificationMessage: 'All systems operational',
        defaultEmiInsurance: 'double',
        defaultThemeMode: 'light',
        scene3dDefaultMode: true,
        featurePermissionsJson: DEFAULT_FEATURE_PERMISSIONS,
        updatedByEmail: 'system',
        updatedAt: new Date(),
      })
      .onConflictDoNothing({ target: portalSettings.settingKey })
      .returning();

    const row =
      inserted[0] ||
      (
        await db
          .select()
          .from(portalSettings)
          .where(eq(portalSettings.settingKey, 'global'))
          .limit(1)
      )[0];

    return {
      maintenanceMode: row.maintenanceMode,
      maintenanceMessage: row.maintenanceMessage,
      notificationMessage: row.notificationMessage,
      defaultEmiInsurance:
        row.defaultEmiInsurance === 'single' || row.defaultEmiInsurance === 'none'
          ? row.defaultEmiInsurance
          : 'double',
      defaultThemeMode: row.defaultThemeMode === 'dark' ? 'dark' : 'light',
      scene3dDefaultMode: row.scene3dDefaultMode,
      featurePermissionsJson: {
        ...DEFAULT_FEATURE_PERMISSIONS,
        ...(row.featurePermissionsJson || {}),
      },
      updatedByEmail: row.updatedByEmail,
      updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
    };
  } catch (error) {
    console.error('Database query failed in getOrSeedPortalSettings:', error);
    throw new Error('Unable to load portal settings.', { cause: error });
  }
}

export async function savePortalSettings(
  input: Partial<{
    maintenanceMode: boolean;
    maintenanceMessage: string;
    notificationMessage: string;
    defaultEmiInsurance: 'double' | 'single' | 'none';
    defaultThemeMode: 'light' | 'dark';
    scene3dDefaultMode: boolean;
    featurePermissionsJson: Record<string, boolean>;
  }>,
  actorEmail: string
) {
  try {
    const current = await getOrSeedPortalSettings();
    const mergedPermissions = input.featurePermissionsJson
      ? { ...current.featurePermissionsJson, ...input.featurePermissionsJson }
      : current.featurePermissionsJson;

    const updated = await db
      .insert(portalSettings)
      .values({
        settingKey: 'global',
        maintenanceMode: input.maintenanceMode ?? current.maintenanceMode,
        maintenanceMessage:
          input.maintenanceMessage !== undefined
            ? input.maintenanceMessage
            : current.maintenanceMessage,
        notificationMessage:
          input.notificationMessage !== undefined
            ? input.notificationMessage
            : current.notificationMessage,
        defaultEmiInsurance:
          input.defaultEmiInsurance ?? current.defaultEmiInsurance,
        defaultThemeMode: input.defaultThemeMode ?? current.defaultThemeMode,
        scene3dDefaultMode:
          input.scene3dDefaultMode ?? current.scene3dDefaultMode,
        featurePermissionsJson: mergedPermissions,
        updatedByEmail: actorEmail,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: portalSettings.settingKey,
        set: {
          maintenanceMode: input.maintenanceMode ?? current.maintenanceMode,
          maintenanceMessage:
            input.maintenanceMessage !== undefined
              ? input.maintenanceMessage
              : current.maintenanceMessage,
          notificationMessage:
            input.notificationMessage !== undefined
              ? input.notificationMessage
              : current.notificationMessage,
          defaultEmiInsurance:
            input.defaultEmiInsurance ?? current.defaultEmiInsurance,
          defaultThemeMode: input.defaultThemeMode ?? current.defaultThemeMode,
          scene3dDefaultMode:
            input.scene3dDefaultMode ?? current.scene3dDefaultMode,
          featurePermissionsJson: mergedPermissions,
          updatedByEmail: actorEmail,
          updatedAt: new Date(),
        },
      })
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Database query failed in savePortalSettings:', error);
    throw new Error('Unable to save portal settings.', { cause: error });
  }
}

export async function listBranchControls() {
  try {
    return await db
      .select()
      .from(branchControls)
      .orderBy(desc(branchControls.updatedAt));
  } catch (error) {
    console.error('Database query failed in listBranchControls:', error);
    throw new Error('Unable to load branch controls.', { cause: error });
  }
}

export async function upsertBranchControl(
  input: {
    branchName: string;
    priorityStatus: 'normal' | 'high' | 'critical' | 'resolved';
    isLocked: boolean;
    adminNote: string;
  },
  actorEmail: string
) {
  try {
    const cleanBranch = input.branchName.trim();
    const res = await db
      .insert(branchControls)
      .values({
        branchName: cleanBranch,
        priorityStatus: input.priorityStatus,
        isLocked: input.isLocked,
        adminNote: input.adminNote,
        updatedByEmail: actorEmail,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: branchControls.branchName,
        set: {
          priorityStatus: input.priorityStatus,
          isLocked: input.isLocked,
          adminNote: input.adminNote,
          updatedByEmail: actorEmail,
          updatedAt: new Date(),
        },
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database query failed in upsertBranchControl:', error);
    throw new Error('Unable to update branch control.', { cause: error });
  }
}

export async function deleteBranchControl(id: number) {
  try {
    await db.delete(branchControls).where(eq(branchControls.id, id));
  } catch (error) {
    console.error('Database query failed in deleteBranchControl:', error);
    throw new Error('Unable to delete branch control.', { cause: error });
  }
}

export async function listFeedbackRatings() {
  try {
    return await db
      .select()
      .from(feedbackRatings)
      .orderBy(desc(feedbackRatings.createdAt))
      .limit(100);
  } catch (error) {
    console.error('Database query failed in listFeedbackRatings:', error);
    throw new Error('Unable to load feedback ratings.', { cause: error });
  }
}

export async function insertFeedbackRating(input: {
  rating: number;
  tags: string[];
  comment: string;
  submittedByEmail: string;
}) {
  try {
    const inserted = await db
      .insert(feedbackRatings)
      .values({
        rating: Math.max(1, Math.min(5, Math.round(input.rating))),
        tagsJson: input.tags,
        comment: input.comment.slice(0, 600),
        submittedByEmail: input.submittedByEmail,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in insertFeedbackRating:', error);
    throw new Error('Unable to save feedback rating.', { cause: error });
  }
}

export async function deleteFeedbackRating(id: number) {
  try {
    await db.delete(feedbackRatings).where(eq(feedbackRatings.id, id));
  } catch (error) {
    console.error('Database query failed in deleteFeedbackRating:', error);
    throw new Error('Unable to remove feedback entry.', { cause: error });
  }
}

export async function appendAuditLog(input: {
  actorUid: string;
  actorEmail: string;
  action: string;
  details: string;
}) {
  try {
    const inserted = await db
      .insert(adminAuditLogs)
      .values({
        actorUid: input.actorUid,
        actorEmail: input.actorEmail,
        action: input.action,
        details: input.details.slice(0, 1000),
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in appendAuditLog:', error);
    throw new Error('Unable to record audit log.', { cause: error });
  }
}

export async function listAuditLogs() {
  try {
    return await db
      .select()
      .from(adminAuditLogs)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(80);
  } catch (error) {
    console.error('Database query failed in listAuditLogs:', error);
    throw new Error('Unable to load admin audit logs.', { cause: error });
  }
}

export async function getCachedBranchMaps(branchQuery: string) {
  try {
    const rows = await db
      .select()
      .from(branchMapsCache)
      .where(eq(branchMapsCache.branchQuery, branchQuery.toLowerCase()))
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getCachedBranchMaps:', error);
    return null;
  }
}

export async function saveCachedBranchMaps(
  branchQuery: string,
  summaryMarkdown: string,
  places: MapsPlaceChunk[]
) {
  try {
    const res = await db
      .insert(branchMapsCache)
      .values({
        branchQuery: branchQuery.toLowerCase(),
        summaryMarkdown,
        placesJson: places,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: branchMapsCache.branchQuery,
        set: {
          summaryMarkdown,
          placesJson: places,
          updatedAt: new Date(),
        },
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database query failed in saveCachedBranchMaps:', error);
    return null;
  }
}
