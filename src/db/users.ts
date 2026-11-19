import { count, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

const OWNER_EMAILS = new Set([
  'valasaict582@gmail.com',
  'raiganpat401@gmail.com',
]);

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string | null
) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existingByUid = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existingByUid.length > 0) {
      const updated = await db
        .update(users)
        .set({
          email,
          displayName: displayName ?? existingByUid[0].displayName,
          role: OWNER_EMAILS.has(normalizedEmail)
            ? 'admin'
            : existingByUid[0].role,
        })
        .where(eq(users.uid, uid))
        .returning();
      return updated[0];
    }

    // Adopt a pre-seeded admin/editor row matching the user's verified email
    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingByEmail.length > 0) {
      const updated = await db
        .update(users)
        .set({
          uid,
          displayName: displayName ?? existingByEmail[0].displayName,
          role: OWNER_EMAILS.has(normalizedEmail)
            ? 'admin'
            : existingByEmail[0].role,
        })
        .where(eq(users.id, existingByEmail[0].id))
        .returning();
      return updated[0];
    }

    const totalUsersResult = await db.select({ value: count() }).from(users);
    const isFirstUser = Number(totalUsersResult[0]?.value ?? 0) === 0;
    const isOwner = OWNER_EMAILS.has(normalizedEmail);
    const assignedRole = isFirstUser || isOwner ? 'admin' : 'editor';

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName ?? null,
        role: assignedRole,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName ?? null,
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to sync authenticated user:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to load administrator accounts.', { cause: error });
  }
}

export async function updateUserRole(userId: number, role: 'admin' | 'editor') {
  try {
    const result = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return result[0] ?? null;
  } catch (error) {
    console.error('Failed to update user role:', error);
    throw new Error('Failed to update user role.', { cause: error });
  }
}
