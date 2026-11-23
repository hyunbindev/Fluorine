import { createHashRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import App from '@/app'
import EmptyPage from '@/pages/EmptyPage'
import MemoPage from '@/pages/MemoPage'
import NotesPage from '@/pages/NotesPage'
import NoteEditorPage from '@/pages/NoteEditorPage'

const router = createHashRouter([{
  element: <App />,
  children: [
    { index: true, element: <EmptyPage title="홈" /> },
    { path: 'commands', element: <EmptyPage title="명령" /> },
    { path: 'notes', element: <NotesPage /> },
    { path: 'notes/:noteId', element: <NoteEditorPage /> },
    { path: 'memo', element: <MemoPage /> },
    { path: 'tools', element: <EmptyPage title="도구" /> },
    { path: 'settings', element: <EmptyPage title="설정" /> },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
}])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
