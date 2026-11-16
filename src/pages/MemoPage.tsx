import { useEffect, useRef, useState } from 'react'
import { Check, ClipboardList, ListTodo, Trash2 } from 'lucide-react'
import MemoComposer from '@/components/memo/MemoComposer'
import { cn } from '@/lib/utils'

type Memo = { id: string; text: string; done: boolean }

export default function MemoPage() {
  const [items, setItems] = useState<Memo[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const remaining = items.filter((item) => !item.done).length

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [items.length])

  function addItem(text: string) {
    setItems((current) => [...current, { id: crypto.randomUUID(), text, done: false }])
  }

  return (
    <section className="flex h-full min-h-0 flex-col scheme-dark" aria-label="메모">
      <header className="flex shrink-0 items-center justify-between border-b border-white/6 px-7 py-5">
        <div className="flex items-center gap-3">
          <ClipboardList size={18} strokeWidth={1.6} className="text-control-foreground" />
          <h1 className="text-sm font-medium text-shell-foreground">메모</h1>
          <span className="rounded-md border border-white/6 bg-white/3 px-1.5 py-0.5 text-[10px] text-control-foreground">{items.length}</span>
        </div>
        <span role="status" className="text-xs text-menu-foreground">{items.length ? `${remaining}개 남음` : '비어 있는 공간, 새로운 시작'}</span>
      </header>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-6 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden">
        {items.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center pb-8 text-center">
            <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-white/6 bg-white/3 text-control-foreground"><ListTodo size={25} strokeWidth={1.3} /></div>
            <h2 className="text-lg font-medium tracking-tight text-title-foreground">생각을 가볍게 남겨보세요</h2>
            <p className="mt-2 text-xs leading-6 text-menu-foreground">해야 할 일, 떠오른 아이디어, 놓치기 싫은 것들.<br />아래에 입력하면 하나씩 메모로 남습니다.</p>
          </div>
        ) : (
          <ul className="mx-auto flex max-w-3xl flex-col gap-2" aria-label="작성한 메모">
            {items.map((item) => (
              <li key={item.id} className="group flex items-start gap-3 rounded-xl border border-white/6 bg-chrome/40 px-4 py-3.5">
                <button type="button" aria-label={item.done ? '미완료로 변경' : '완료로 표시'} aria-pressed={item.done}
                  onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry))}
                  className={cn('mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-md border border-white/20 text-menu-active hover:border-menu-accent/60', item.done && 'border-menu-accent/30 bg-menu-accent/15')}>
                  {item.done && <Check size={12} />}
                </button>
                <p className={cn('min-w-0 flex-1 select-text text-sm leading-6 whitespace-pre-wrap wrap-anywhere text-shell-foreground', item.done && 'text-menu-foreground line-through')}>{item.text}</p>
                <button type="button" aria-label="메모 삭제" title="삭제" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-menu-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white/5 hover:text-menu-active motion-reduce:transition-none"><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 px-6 pt-2 pb-5 sm:px-10"><MemoComposer onAdd={addItem} /></div>
    </section>
  )
}
