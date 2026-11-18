import { useRef, useState, type FormEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'

export default function MemoComposer({ onAdd, disabled = false }: { onAdd: (text: string) => Promise<void>; disabled?: boolean }) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = text.trim()
    if (!value || disabled || submitting.current) return
    submitting.current = true
    setSaving(true)
    try {
      await onAdd(value)
      setText('')
      inputRef.current?.focus()
    } catch {
      // Keep the input intact. The page displays the storage error.
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mx-auto w-full max-w-3xl" aria-busy={saving}>
      <InputGroup className="rounded-2xl border-white/10 bg-frame-surface has-disabled:bg-frame-surface has-disabled:opacity-100 dark:bg-frame-surface dark:has-disabled:bg-frame-surface">
        <InputGroupTextarea ref={inputRef} value={text} onChange={(event) => setText(event.target.value)} readOnly={disabled || saving}
          aria-label="새 메모" placeholder="내용을 입력하세요."
          className="text-md max-h-50 min-h-10 select-text px-4 pt-3 leading-6 no-scrollbar text-shell-foreground placeholder:text-menu-foreground"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.ctrlKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }} />
        <InputGroupAddon align="block-end" className="justify-between items-end px-3 text-control-foreground">
          <span className="flex items-end gap-1.5 pl-1 text-[11px]">
            {saving ? '저장 중…' : 'Ctrl + Enter로 추가'}
          </span>
          <InputGroupButton type="submit" size="icon-sm" disabled={!text.trim() || disabled || saving} aria-label="메모 추가"
            className="rounded-full bg-menu-active text-chrome-solid hover:bg-menu-indicator disabled:opacity-25">
            <ArrowUp size={17} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
