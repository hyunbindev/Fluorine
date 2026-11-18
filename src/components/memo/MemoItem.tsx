import { Check, Copy, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { isTauri } from '@tauri-apps/api/core'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'

import type { Memo } from '@/types/memo'

type MemoItemProps = {
  memo: Memo
  onDelete: () => void
  deleting?: boolean
}

export default function MemoItem({ memo, onDelete, deleting = false }: MemoItemProps) {
  const reduceMotion = useReducedMotion()
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')

  useEffect(() => {
    if (copyState !== 'copied') return
    const timer = setTimeout(() => setCopyState('idle'), 2000)
    return () => clearTimeout(timer)
  }, [copyState])

  async function copyMemo() {
    if (copyState === 'copying') return
    setCopyState('copying')
    try {
      if (isTauri()) await writeText(memo.text)
      else await navigator.clipboard.writeText(memo.text)
      setCopyState('copied')
    } catch (error) {
      console.error('Could not copy memo:', error)
      setCopyState('error')
    }
  }

  return (
    <motion.li
      layout={reduceMotion ? false : 'position'}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -8, transition: { duration: reduceMotion ? 0 : 0.16 } }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
      className="group flex-col gap-3">
        
      <div className="flex items-center justify-between gap-2.5">
        <span className="ml-1.5 text-sm text-shell-foreground">
          {memo.createdAt.toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </span>
      </div>

      <div className="rounded-xl border border-white/6 bg-frame-surface px-4 py-3.5">
        <p className={cn('min-w-0 flex-1 select-text text-md leading-6 whitespace-pre-wrap wrap-anywhere text-shell-foreground')}>{memo.text}</p>
        <div className="flex min-h-7 items-center justify-end gap-1">
          <span role="status" className="mr-auto text-xs text-control-foreground">
            {copyState === 'copied' ? '복사했습니다.' : copyState === 'error' ? '복사하지 못했습니다. 다시 시도해 주세요.' : ''}
          </span>
          <button type="button" aria-label="메모 복사" title="복사" onClick={() => void copyMemo()} disabled={copyState === 'copying'}
            className="grid size-7 shrink-0 place-items-center rounded-md text-control-foreground hover:bg-white/5 hover:text-menu-active disabled:opacity-40">
            {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button type="button" aria-label="메모 삭제" title="삭제" onClick={onDelete} disabled={deleting}
            className="grid size-7 shrink-0 place-items-center rounded-md text-control-foreground hover:bg-white/5 hover:text-menu-active disabled:opacity-40">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.li>
  )
}
