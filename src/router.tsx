import { HashRouter, Navigate, Route, Routes } from 'react-router'
import App from '@/app'
import EmptyPage from '@/pages/EmptyPage'
import MemoPage from '@/pages/MemoPage'

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<EmptyPage title="홈" />} />
          <Route path="commands" element={<EmptyPage title="명령" />} />
          <Route path="notes" element={<EmptyPage title="메모" />} />
          <Route path="notes/:noteId" element={<EmptyPage title="메모 편집" />} />
          <Route path="memo" element={<MemoPage />} />
          <Route path="tools" element={<EmptyPage title="도구" />} />
          <Route path="settings" element={<EmptyPage title="설정" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
