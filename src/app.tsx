import TitleBar from '@/components/layout/TitleBar'
import Sidebar from '@/components/layout/Sidebar'
import { Outlet } from 'react-router'

export default function App() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-transparent select-none">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto bg-[radial-gradient(ellipse_at_25%_0%,rgb(255_255_255/1.6%),transparent_65%)]" aria-label="작업 영역">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
