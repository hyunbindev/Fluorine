import { isTauri } from '@tauri-apps/api/core'
import Database from '@tauri-apps/plugin-sql'
import type { Memo } from '@/types/memo'

let connection: Promise<Database> | undefined
function getDatabase() {
  if (!isTauri()) throw new Error('SQLite 저장은 데스크톱 앱에서 사용할 수 있습니다.')
  connection ??= Database.load('sqlite:utility.db').catch((error) => {
    connection = undefined
    throw error
  })
  return connection
}

export async function loadNote(): Promise<string | null> {
  const db = await getDatabase()
  const rows = await db.select<{ content: string }[]>('SELECT content FROM notes WHERE id = 1')
  return rows[0]?.content ?? null
}

export async function saveNote(content: string) {
  const db = await getDatabase()
  await db.execute('INSERT INTO notes (id, content) VALUES (1, $1) ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP', [content])
}

type MemoRow = { id: string; text: string; created_at: string }

export async function loadMemos(): Promise<Memo[]> {
  const db = await getDatabase()
  const rows = await db.select<MemoRow[]>('SELECT id, text, created_at FROM memos ORDER BY created_at ASC, rowid ASC')
  return rows.map((row) => {
    const createdAt = new Date(row.created_at)
    if (Number.isNaN(createdAt.getTime())) throw new Error('메모의 작성 시각을 읽을 수 없습니다.')
    return { id: row.id, text: row.text, createdAt }
  })
}

export async function insertMemo(memo: Memo): Promise<void> {
  const db = await getDatabase()
  await db.execute('INSERT INTO memos (id, text, created_at) VALUES ($1, $2, $3)', [memo.id, memo.text, memo.createdAt.toISOString()])
}

export async function deleteMemo(id: string): Promise<void> {
  const db = await getDatabase()
  await db.execute('DELETE FROM memos WHERE id = $1', [id])
}
