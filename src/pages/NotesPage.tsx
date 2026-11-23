import { FileText, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { Link } from 'react-router'
import { loadNotes } from '@/lib/database'
import MarkdownPreview from '@/features/notes/MarkdownPreview'

function NoteCard({ children }: { children: ReactNode }) {
  return <li className="mb-4 break-inside-avoid rounded-2xl border border-white/10 bg-frame-surface">{children}</li>
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof loadNotes>> | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    void loadNotes().then((rows) => {
      if (active) setNotes(rows)
    }).catch((reason: unknown) => {
      if (active) setError(String(reason))
    })
    return () => { active = false }
  }, [attempt])

  return (
    <section className="@container mx-auto min-h-full max-w-7xl px-5 py-8 sm:px-8" aria-labelledby="notes-title">
      <header className="mb-7 flex items-center gap-3">
        <FileText aria-hidden="true" className="size-5 text-menu-active" />
        <h1 id="notes-title" className="text-2xl font-semibold tracking-tight text-shell-foreground">노트</h1>
        {notes && <span className="text-xs text-title-foreground">{notes.length}개</span>}
      </header>

      {!notes && !error && <p role="status" className="mb-4 text-sm text-title-foreground">노트를 불러오는 중…</p>}
      {error && (
        <div role="alert" className="mb-4 flex items-center gap-3 text-sm text-shell-foreground">
          <span>노트를 불러오지 못했습니다. {error}</span>
          <button type="button" className="shrink-0 text-menu-active" onClick={() => {
            setError('')
            setAttempt((current) => current + 1)
          }}>다시 시도</button>
        </div>
      )}

      <ul className="w-124 columns-2 gap-4 @min-[47rem]:w-188 @min-[47rem]:columns-3" aria-labelledby="notes-title">
        <NoteCard key="new">
          <Link to="new" aria-label="새 노트" className="flex flex-col min-h-28 items-center justify-center gap-2 rounded-2xl p-5 text-sm text-title-foreground hover:bg-white/5 hover:text-menu-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-shell-focus">
            <Plus className="size-10" aria-hidden="true" />
          </Link>
        </NoteCard>
        {notes?.map((note) => (
          <NoteCard key={note.id}>
            <Link to={String(note.id)}
              className="block rounded-2xl p-5 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-shell-focus">
              <MarkdownPreview source={note.content} excerpt />
              <time dateTime={note.updated_at.replace(' ', 'T') + 'Z'} className="mt-4 block text-xs text-title-foreground">
                {new Date(note.updated_at.replace(' ', 'T') + 'Z').toLocaleDateString('ko-KR')}
              </time>
            </Link>
          </NoteCard>
        ))}
      </ul>
    </section>
  )
}
