import { isTauri } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Minus, Pin, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const controlClass = 'grid h-full w-10.75 place-items-center border-0 bg-transparent text-control-foreground transition-colors duration-120 motion-reduce:transition-none'

function windowAction(action: 'minimize' | 'toggleMaximize' | 'close') {
  if (isTauri()) void getCurrentWindow()[action]().catch(console.error)
}

export default function TitleBar() {
  const [pinned, setPinned] = useState(false)
  const [pinReady, setPinReady] = useState(false)
  const [pinBusy, setPinBusy] = useState(false)
  const [pinError, setPinError] = useState('')

  useEffect(() => {
    if (!isTauri()) return
    let active = true
    void getCurrentWindow().isAlwaysOnTop().then((value) => {
      if (!active) return
      setPinned(value)
      setPinReady(true)
    }).catch((error: unknown) => {
      if (active) setPinError(`창 고정 상태 확인 실패: ${String(error)}`)
    })
    return () => { active = false }
  }, [])

  async function togglePin() {
    if (!isTauri() || !pinReady || pinBusy) return
    setPinBusy(true)
    setPinError('')
    try {
      const window = getCurrentWindow()
      await window.setAlwaysOnTop(!(await window.isAlwaysOnTop()))
      setPinned(await window.isAlwaysOnTop())
    } catch (error) {
      setPinError(`창 고정 변경 실패: ${String(error)}`)
    } finally {
      setPinBusy(false)
    }
  }

  return (
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/6 bg-frame-surface" data-tauri-drag-region>
        <div className="flex h-full flex-1 items-center gap-2.5 pl-4.75 text-xs font-550 tracking-[0.01em] text-title-foreground" data-tauri-drag-region>
        </div>
        <div className="flex h-full">
          <button type="button" aria-label="항상 맨 위에 표시" aria-pressed={pinned}
            title={pinError || (pinned ? '맨 위 고정 해제' : '항상 맨 위에 표시')}
            disabled={!pinReady || pinBusy} onClick={() => void togglePin()}
            className={cn(controlClass, 'hover:bg-white/7 disabled:opacity-40', pinned ? 'bg-menu-accent/11 text-menu-active hover:text-menu-active' : 'hover:text-control-hover')}>
            <Pin size={14} fill={pinned ? 'currentColor' : 'none'} />
          </button>
          <button className={`${controlClass} hover:bg-white/7 hover:text-control-hover`} aria-label="최소화" onClick={() => windowAction('minimize')}><Minus size={14} /></button>
          <button className={`${controlClass} hover:bg-white/7 hover:text-control-hover`} aria-label="최대화 또는 복원" onClick={() => windowAction('toggleMaximize')}><Square size={11} /></button>
          <button className={`${controlClass} hover:bg-control-close hover:text-white`} aria-label="트레이로 숨기기" title="트레이로 숨기기" onClick={() => windowAction('close')}><X size={15} /></button>
        </div>
        <span className="sr-only" role="status">{pinError}</span>
      </header>
  )
}
