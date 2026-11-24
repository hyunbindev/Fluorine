import { useCallback, useEffect, useRef, useState } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router'
import { deleteNote, saveNote } from '@/lib/database'
import { registerTrayNoteSave } from '@/lib/trayLifecycle'

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'failed'

export function useNoteAutosave(id?: number) {
  const noteId = useRef(id)
  const pending = useRef<string | undefined>(undefined)
  const timer = useRef<number | undefined>(undefined)
  const inFlight = useRef<Promise<boolean> | null>(null)
  const deleting = useRef(false)
  const [hasSavedNote, setHasSavedNote] = useState(id !== undefined)
  const [status, setStatus] = useState<SaveStatus>(id === undefined ? 'idle' : 'saved')
  const [error, setError] = useState('')

  const flush = useCallback(() => {
    if (deleting.current) return Promise.resolve(false)
    window.clearTimeout(timer.current)
    if (inFlight.current) return inFlight.current
    if (pending.current === undefined) return Promise.resolve(true)

    inFlight.current = (async () => {
      try {
        while (!deleting.current && pending.current !== undefined) {
          const content = pending.current
          if (noteId.current === undefined && !content.trim()) {
            pending.current = undefined
            setStatus('idle')
            break
          }

          setStatus('saving')
          setError('')
          noteId.current = await saveNote(content, noteId.current)
          setHasSavedNote(true)
          if (pending.current === content) {
            pending.current = undefined
            setStatus('saved')
          }
        }
        return !deleting.current
      } catch (reason) {
        setError(String(reason))
        setStatus('failed')
        return false
      }
    })().finally(() => {
      inFlight.current = null
    })
    return inFlight.current
  }, [])

  function schedule(content: string) {
    window.clearTimeout(timer.current)
    if (noteId.current === undefined && !inFlight.current && !content.trim()) {
      pending.current = undefined
      setStatus('idle')
      setError('')
      return
    }

    pending.current = content
    if (inFlight.current || deleting.current) return
    setStatus('pending')
    setError('')
    timer.current = window.setTimeout(() => void flush(), 700)
  }

  async function removeNote() {
    if (deleting.current || noteId.current === undefined) return false
    deleting.current = true
    window.clearTimeout(timer.current)
    try {
      await inFlight.current
      await deleteNote(noteId.current)
      pending.current = undefined
      return true
    } catch (reason) {
      if (pending.current !== undefined) {
        setStatus('pending')
        setError('')
        timer.current = window.setTimeout(() => void flush(), 700)
      }
      throw reason
    } finally {
      deleting.current = false
    }
  }

  const hasPending = useCallback(() => deleting.current || pending.current !== undefined || inFlight.current !== null, [])
  const blocker = useBlocker(hasPending)
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    let active = true
    void flush().then((saved) => {
      if (!active) return
      if (saved) blocker.proceed()
      else blocker.reset()
    })
    return () => { active = false }
  }, [blocker, flush])

  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => {
    if (hasPending()) event.preventDefault()
  }, [hasPending]))

  useEffect(() => registerTrayNoteSave(flush), [flush])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { schedule, flush, status, error, hasSavedNote, removeNote }
}
