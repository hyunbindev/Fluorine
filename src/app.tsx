import TitleBar from '@/components/layout/TitleBar'
import Sidebar from '@/components/layout/Sidebar'
import RouteTransition from '@/components/layout/RouteTransition'

export default function App() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-transparent select-none">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_25%_0%,rgb(255_255_255/1.6%),transparent_65%)]" aria-label="작업 영역">
          <RouteTransition />
        </main>
      </div>
    </div>
  )
}
