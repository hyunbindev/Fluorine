import { createHashRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import App from '@/app'
import MemoPage from '@/pages/MemoPage'
import NotesPage from '@/pages/NotesPage'
import NoteEditorPage from '@/pages/NoteEditorPage'

const router = createHashRouter([{
  element: <App />,
  children: [
    { index: true, element: <Navigate to="/notes" replace /> },
    { path: 'notes', element: <NotesPage /> },
    { path: 'notes/:noteId', element: <NoteEditorPage /> },
    { path: 'memo', element: <MemoPage /> },
    { path: '*', element: <Navigate to="/notes" replace /> },
  ],
}])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
