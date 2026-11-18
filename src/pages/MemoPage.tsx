import { useEffect, useRef, useState } from 'react'
import MemoComposer from '@/components/memo/MemoComposer'
import MemoItem from '@/components/memo/MemoItem'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Memo } from '@/types/memo'
import { deleteMemo, insertMemo, loadMemos } from '@/lib/database'

export default function MemoPage() {
  const [items, setItems] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [mutationError, setMutationError] = useState('')
  const [mutating, setMutating] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const mutationLock = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)
  const previousCount = useRef(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    let active = true
    void loadMemos().then((memos) => {
      if (active) {
        setItems(memos)
        setLoadError('')
      }
    }).catch((error: unknown) => {
      if (active) setLoadError(`메모를 불러오지 못했습니다: ${String(error)}`)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [reloadKey])

  useEffect(() => {
    const list = listRef.current
    if (list && items.length > previousCount.current) {
      list.scrollTo({ top: list.scrollHeight, behavior: reduceMotion ? 'instant' : 'smooth' })
    }
    previousCount.current = items.length
  }, [items.length, reduceMotion])

  async function addItem(text: string) {
    if (loading || loadError || mutationLock.current) throw new Error('메모 저장을 준비 중입니다.')
    mutationLock.current = true
    setMutating(true)
    setMutationError('')
    const memo: Memo = { id: crypto.randomUUID(), text, createdAt: new Date() }
    try {
      await insertMemo(memo)
      setItems((current) => [...current, memo])
    } catch (error) {
      setMutationError(`저장하지 못했습니다. 입력 내용은 유지됩니다: ${String(error)}`)
      throw error
    } finally {
      mutationLock.current = false
      setMutating(false)
    }
  }

  async function deleteItem(id: string) {
    if (mutationLock.current) return
    mutationLock.current = true
    setMutating(true)
    setMutationError('')
    try {
      await deleteMemo(id)
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (error) {
      setMutationError(`삭제하지 못했습니다. 메모는 유지됩니다: ${String(error)}`)
    } finally {
      mutationLock.current = false
      setMutating(false)
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col scheme-dark" aria-label="메모">
      {loading && <p role="status" className="px-6 pt-4 text-xs text-control-foreground">메모를 불러오는 중…</p>}
      {loadError && (
        <div role="alert" className="flex items-center gap-3 px-6 pt-4 text-xs text-shell-foreground">
          <span>{loadError}</span>
          <button type="button" disabled={loading} className="shrink-0 rounded-md px-2 py-1 text-menu-active hover:bg-white/5 disabled:opacity-40"
            onClick={() => { setLoading(true); setReloadKey((current) => current + 1) }}>다시 시도</button>
        </div>
      )}

      <motion.div layoutScroll ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-6 scrollbar-none [overflow-anchor:none] sm:px-10 [&::-webkit-scrollbar]:hidden">
        <div className="flex min-h-full flex-col justify-end">
          <ul className="mx-auto flex w-full max-w-3xl flex-col gap-3" aria-label="작성한 메모">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <MemoItem key={item.id} memo={item} deleting={mutating} onDelete={() => void deleteItem(item.id)} />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </motion.div>

      <div className="shrink-0 px-6 pt-2 pb-5 sm:px-10">
        {mutationError && <p role="alert" className="mx-auto mb-3 max-w-3xl text-xs text-menu-active">{mutationError}</p>}
        <MemoComposer onAdd={addItem} disabled={loading || !!loadError || mutating} />
      </div>
    </section>
  )
}
