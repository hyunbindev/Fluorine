import { isTauri } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Minus, Square, X } from 'lucide-react'

const controlClass = 'grid h-full w-10.75 place-items-center border-0 bg-transparent text-control-foreground transition-colors duration-120 motion-reduce:transition-none'

function windowAction(action: 'minimize' | 'toggleMaximize' | 'close') {
  if (isTauri()) void getCurrentWindow()[action]().catch(console.error)
}

export default function TitleBar() {
  return (
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/6 bg-chrome" data-tauri-drag-region>
        <div className="flex h-full flex-1 items-center gap-2.5 pl-4.75 text-xs font-550 tracking-[0.01em] text-title-foreground" data-tauri-drag-region>
        </div>
        <div className="flex h-full">
          <button className={`${controlClass} hover:bg-white/7 hover:text-control-hover`} aria-label="최소화" onClick={() => windowAction('minimize')}><Minus size={14} /></button>
          <button className={`${controlClass} hover:bg-white/7 hover:text-control-hover`} aria-label="최대화 또는 복원" onClick={() => windowAction('toggleMaximize')}><Square size={11} /></button>
          <button className={`${controlClass} hover:bg-control-close hover:text-white`} aria-label="닫기" onClick={() => windowAction('close')}><X size={15} /></button>
        </div>
      </header>
  )
}
