import { AlertDialog } from '@base-ui/react/alert-dialog'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { ArrowLeft, Bold, Code2, Heading2, Italic, List, ListChecks, ListOrdered, Quote, Redo2, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { useNoteAutosave } from '@/features/notes/useNoteAutosave'
import { loadNote } from '@/lib/database'

const saveLabels = {
  idle: '',
  pending: '저장 대기 중…',
  saving: '저장 중…',
  saved: '저장됨',
  failed: '저장 실패',
}

function NoteEditor({ body, id }: { body: string; id?: number }) {
  const { schedule, flush, status, error, hasSavedNote, removeNote } = useNoteAutosave(id)
  const navigate = useNavigate()
  const cancelButton = useRef<HTMLButtonElement>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Markdown, TaskList, TaskItem],
    content: body,
    autofocus: id === undefined,
    contentType: 'markdown',
    onUpdate: ({ editor: current }) => schedule(current.isEmpty ? '' : current.getMarkdown()),
    editorProps: {
      attributes: {
        'aria-label': '노트 본문',
        class: 'min-h-64 select-text space-y-4 wrap-anywhere text-base leading-relaxed text-shell-foreground outline-none [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h4]:text-lg [&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:pl-6 [&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0 [&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:gap-2 [&_blockquote]:border-l-2 [&_blockquote]:border-menu-accent/50 [&_blockquote]:pl-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-white/5 [&_pre]:p-4 [&_code]:font-mono [&_a]:text-menu-active [&_a]:underline',
      },
    },
  })
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => current && ({
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      heading: current.isActive('heading', { level: 2 }),
      bullet: current.isActive('bulletList'),
      ordered: current.isActive('orderedList'),
      task: current.isActive('taskList'),
      quote: current.isActive('blockquote'),
      code: current.isActive('codeBlock'),
      undo: current.can().undo(),
      redo: current.can().redo(),
    }),
  })
  const tools = editor && state ? [
    { label: '굵게', icon: Bold, active: state.bold, run: () => editor.chain().focus().toggleBold().run() },
    { label: '기울임', icon: Italic, active: state.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { label: '제목', icon: Heading2, active: state.heading, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: '글머리 목록', icon: List, active: state.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
    { label: '번호 목록', icon: ListOrdered, active: state.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: '체크리스트', icon: ListChecks, active: state.task, run: () => editor.chain().focus().toggleTaskList().run() },
    { label: '인용', icon: Quote, active: state.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: '코드 블록', icon: Code2, active: state.code, run: () => editor.chain().focus().toggleCodeBlock().run() },
    { label: '실행 취소', icon: Undo2, disabled: !state.undo, run: () => editor.chain().focus().undo().run() },
    { label: '다시 실행', icon: Redo2, disabled: !state.redo, run: () => editor.chain().focus().redo().run() },
  ] : []

  async function confirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      if (await removeNote()) await navigate('/notes', { replace: true })
    } catch {
      setDeleteError('노트를 삭제하지 못했습니다. 다시 시도해 주세요.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col px-4 py-5 sm:px-6" aria-label="노트 편집">
      <header className="mb-4 flex shrink-0 items-center">
        <Link to="/notes" className="inline-flex items-center gap-2 text-sm text-title-foreground hover:text-shell-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> 노트 목록
        </Link>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-frame-surface">
        <div role="group" aria-label="본문 서식" className="flex shrink-0 flex-wrap gap-1 border-b border-white/10 p-2">
          {tools.map(({ label, icon: Icon, active, disabled, run }) => (
            <button key={label} type="button" aria-label={label} title={label} aria-pressed={active} disabled={disabled}
              onMouseDown={(event) => event.preventDefault()} onClick={run}
              className="grid size-8 place-items-center rounded-md text-title-foreground hover:bg-white/5 aria-pressed:bg-menu-accent/15 aria-pressed:text-menu-active disabled:opacity-30">
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto px-10 py-8">
            <EditorContent editor={editor} />
          </div>
        </div>
        <div className="flex min-h-10 shrink-0 items-center justify-end gap-3 border-t border-white/10 px-3 py-2 text-xs">
          {hasSavedNote && (
            <AlertDialog.Root open={deleteOpen} onOpenChange={(open, details) => {
              if (deleting) {
                details.cancel()
                return
              }
              setDeleteError('')
              setDeleteOpen(open)
            }}>
              <AlertDialog.Trigger className="mr-auto rounded-md px-2 py-1 text-title-foreground hover:bg-control-close/15 hover:text-menu-active">
                노트 삭제
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" />
                <AlertDialog.Popup initialFocus={cancelButton}
                  className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-chrome-solid p-5 text-shell-foreground shadow-composer">
                  <AlertDialog.Title className="text-base font-semibold">이 노트를 삭제할까요?</AlertDialog.Title>
                  <AlertDialog.Description className="mt-2 text-sm text-title-foreground">삭제한 노트는 복구할 수 없어요.</AlertDialog.Description>
                  {deleteError && <p role="alert" className="mt-3 text-sm text-menu-active">{deleteError}</p>}
                  <div className="mt-5 flex justify-end gap-2">
                    <AlertDialog.Close ref={cancelButton} disabled={deleting}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-title-foreground hover:bg-white/10 hover:text-shell-foreground disabled:opacity-50">
                      취소
                    </AlertDialog.Close>
                    <button type="button" disabled={deleting} onClick={() => void confirmDelete()}
                      className="rounded-lg border border-control-close/35 bg-control-close/15 px-3 py-1.5 text-sm font-medium text-menu-active hover:bg-control-close/25 disabled:opacity-50">
                      {deleting ? '삭제 중…' : '삭제'}
                    </button>
                  </div>
                </AlertDialog.Popup>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          )}
          <span role="status" className={status === 'failed' ? 'text-menu-active' : 'text-title-foreground'} title={error || undefined}>
            {saveLabels[status]}
          </span>
          {status === 'failed' && (
            <button type="button" onClick={() => void flush()}
              className="rounded-md bg-menu-accent/15 px-2 py-1 text-menu-active hover:bg-menu-accent/25">
              다시 시도
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function SavedNoteEditor({ id }: { id: number }) {
  const [note, setNote] = useState<Awaited<ReturnType<typeof loadNote>>>()
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    void loadNote(id).then((row) => {
      if (active) setNote(row)
    }).catch((reason: unknown) => {
      if (active) setError(String(reason))
    })
    return () => { active = false }
  }, [id, attempt])

  if (note) return <NoteEditor id={id} body={note.content} />
  if (note === null) return <Navigate to="/notes" replace />
  if (!error) return <p role="status" className="p-5 text-sm text-title-foreground">노트를 불러오는 중…</p>

  return (
    <div role="alert" className="flex items-center gap-3 p-5 text-sm text-shell-foreground">
      <span>노트를 불러오지 못했습니다. {error}</span>
      <button type="button" className="shrink-0 text-menu-active" onClick={() => {
        setError('')
        setAttempt((current) => current + 1)
      }}>다시 시도</button>
      <Link to="/notes" className="shrink-0 text-menu-active">노트 목록</Link>
    </div>
  )
}

export default function NoteEditorPage() {
  const { noteId } = useParams()
  if (noteId === 'new') return <NoteEditor key="new" body="" />
  const id = Number(noteId)
  if (!Number.isSafeInteger(id) || id <= 0) return <Navigate to="/notes" replace />
  return <SavedNoteEditor key={id} id={id} />
}
