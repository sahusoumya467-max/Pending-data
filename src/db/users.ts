import { db } from './index.ts';
import { users } from './schema.ts';
import { desc, eq, sql } from 'drizzle-orm';

const SEEDED_ADMIN_EMAILS = new Set([
  'sahusoumya467@gmail.com',
  'soumyaranjan@afpl.net.in',
]);

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName = ''
) {
  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existing.length > 0) {
      const shouldBeAdmin =
        SEEDED_ADMIN_EMAILS.has(email.toLowerCase()) ||
        existing[0].role === 'admin';
      const updated = await db
        .update(users)
        .set({
          email,
          displayName: displayName || existing[0].displayName,
          role: shouldBeAdmin ? 'admin' : existing[0].role,
          lastLoginAt: new Date(),
        })
        .where(eq(users.uid, uid))
        .returning();
      return updated[0];
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const isAdmin =
      SEEDED_ADMIN_EMAILS.has(email.toLowerCase()) || Number(count) === 0;

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName,
        role: isAdmin ? 'admin' : 'viewer',
        lastLoginAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName,
          lastLoginAt: new Date(),
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Unable to verify user account right now.', {
      cause: error,
    });
  }
}

export async function listAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.lastLoginAt));
  } catch (error) {
    console.error('Database query failed in listAllUsers:', error);
    throw new Error('Unable to load user directory.', { cause: error });
  }
}

export async function updateUserRole(userId: number, role: 'admin' | 'viewer') {
  try {
    const updated = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.error('Database query failed in updateUserRole:', error);
    throw new Error('Unable to update user role.', { cause: error });
  }
}
