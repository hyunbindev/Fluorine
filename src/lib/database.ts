import { isTauri } from '@tauri-apps/api/core'
import Database from '@tauri-apps/plugin-sql'

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
