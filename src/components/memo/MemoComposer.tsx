import { useRef, useState, type FormEvent } from 'react'
import { ArrowUp, CornerDownLeft } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'

export default function MemoComposer({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    onAdd(value)
    setText('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-3xl">
      <InputGroup className="rounded-2xl border-white/10 bg-composer-surface shadow-composer has-disabled:bg-composer-surface has-disabled:opacity-100 has-[[data-slot=input-group-control]:focus-visible]:border-menu-accent/35 has-[[data-slot=input-group-control]:focus-visible]:ring-menu-accent/10">
        <InputGroupTextarea ref={inputRef} value={text} onChange={(event) => setText(event.target.value)}
          aria-label="새 메모" placeholder="할 일이나 기억할 내용을 남겨보세요…" maxLength={2000}
          className="max-h-40 min-h-20 select-text px-4 pt-4 text-sm leading-6 text-shell-foreground placeholder:text-menu-foreground"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }} />
        <InputGroupAddon align="block-end" className="justify-between px-3 pb-3 text-control-foreground">
          <span className="flex items-center gap-1.5 pl-1 text-[11px]"><CornerDownLeft size={12} /> 메모 추가 <span className="ml-2 text-menu-foreground">Shift + Enter 줄바꿈</span></span>
          <InputGroupButton type="submit" size="icon-sm" disabled={!text.trim()} aria-label="메모 추가"
            className="rounded-full bg-menu-active text-chrome-solid hover:bg-menu-indicator disabled:opacity-25">
            <ArrowUp size={17} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
