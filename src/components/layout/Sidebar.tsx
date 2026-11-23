import { ClipboardList, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavLink } from 'react-router'

const menuButtonClass = 'relative grid size-9.5 cursor-default place-items-center rounded-[9px] border border-transparent bg-transparent text-menu-foreground transition-colors duration-140 hover:bg-white/5 hover:text-menu-hover motion-reduce:transition-none'
const activeMenuClass = 'border-menu-accent/12 bg-menu-accent/11 text-menu-active shadow-menu-active hover:bg-menu-accent/11 hover:text-menu-active before:absolute before:top-3 before:-left-3.5 before:h-3 before:w-0.5 before:rounded-sm before:bg-menu-indicator before:content-[""]'

const menus = [
  { icon: StickyNote, label: '노트', to: '/notes' },
  { icon: ClipboardList, label: '메모', to: '/memo' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-16.25 shrink-0 flex-col items-center border-r border-white/6 bg-frame-surface pt-4.5 pb-3.5" aria-label="메인 메뉴">
      <nav className="flex flex-col gap-2.25">
        {menus.map(({ icon: Icon, label, to }) => (
          <NavLink key={label}
                  to={to}
                  className={({ isActive }) => cn(menuButtonClass, isActive && activeMenuClass)}
                  aria-label={label}
                  title={label}>
                    
            <Icon size={19} strokeWidth={1.65} />
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6">
        <span className="grid size-6.25 place-items-center rounded-full border border-white/10 bg-avatar-surface text-[10px] font-semibold text-avatar-foreground" title="로컬 워크스페이스">W</span>
      </div>
    </aside>
  )
}
