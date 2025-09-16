import { db } from "@/server/db";
import { noteTable } from "@/server/db/schema/note";
import { and, eq } from "drizzle-orm";

export class NotesService {
  static async getSummonerNotes({ puuid, userId }: { puuid: string; userId: string }) {
    return db.query.noteTable.findFirst({
      where: and(eq(noteTable.puuid, puuid), eq(noteTable.userId, userId)),
      columns: {
        note: true,
        createdAt: true,
      },
    });
  }

  static async upsertSummonerNotes({
    puuid,
    userId,
    note,
  }: {
    puuid: string;
    userId: string;
    note: string;
  }) {
    return db
      .insert(noteTable)
      .values({ puuid, userId, note })
      .onConflictDoUpdate({
        target: [noteTable.puuid, noteTable.userId],
        set: {
          note,
        },
      })
      .returning();
  }
}
