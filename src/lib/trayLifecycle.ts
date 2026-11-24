import { invoke, isTauri } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEffect } from 'react'

let flushNote: (() => Promise<boolean>) | undefined

export function registerTrayNoteSave(save: () => Promise<boolean>) {
  flushNote = save
  return () => {
    if (flushNote === save) flushNote = undefined
  }
}

export function useTrayLifecycle() {
  useEffect(() => {
    if (!isTauri()) return
    const window = getCurrentWindow()
    let active = true
    let quitting = false
    const subscriptions = [
      window.onFocusChanged(({ payload: focused }) => {
        if (active && !focused) void flushNote?.()
      }),
      window.listen('tray-quit-requested', async () => {
        if (!active || quitting) return
        quitting = true
        try {
          const saved = await (flushNote?.() ?? true)
          if (active) await invoke('finish_quit', { saved })
        } catch (error) {
          console.error(error)
        } finally {
          quitting = false
        }
      }),
    ]
    for (const subscription of subscriptions) void subscription.catch(console.error)
    return () => {
      active = false
      for (const subscription of subscriptions) {
        void subscription.then((unlisten) => unlisten(), () => {})
      }
    }
  }, [])
}
