'use client'

import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: number
  type: ToastType
  title?: string
  message: string
  duration?: number
  actionText?: string
  onAction?: () => void
}

let listeners: ((msg: ToastMessage) => void)[] = []
let idCounter = 1

export function showToast(message: Omit<ToastMessage, 'id'>) {
  const full: ToastMessage = { id: idCounter++, duration: 4000, ...message }
  listeners.forEach((l) => l(full))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const onPush = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg])
      if (msg.duration && isFinite(msg.duration)) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== msg.id))
        }, msg.duration)
      }
    }
    listeners.push(onPush)
    return () => {
      listeners = listeners.filter((l) => l !== onPush)
    }
  }, [])

  return (
    <div className="fixed z-[9999] top-4 right-4 space-y-2 w-[92vw] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            'rounded-lg p-4 shadow-lg ring-1 backdrop-blur bg-opacity-80 flex gap-3 items-start ' +
            (t.type === 'success'
              ? 'bg-green-500/10 ring-green-500/30 text-green-300'
              : t.type === 'error'
              ? 'bg-red-500/10 ring-red-500/30 text-red-300'
              : t.type === 'warning'
              ? 'bg-yellow-500/10 ring-yellow-500/30 text-yellow-300'
              : 'bg-blue-500/10 ring-blue-500/30 text-blue-300')
          }
        >
          <div className="flex-1">
            {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
            <div className="text-sm leading-snug">{t.message}</div>
          </div>
          {t.actionText && (
            <button
              onClick={() => {
                if (t.onAction) t.onAction()
              }}
              className="ml-2 px-3 py-1 rounded-md bg-accent-neon text-black text-xs font-semibold hover:bg-accent-neon/90"
            >
              {t.actionText}
            </button>
          )}
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-current/70 hover:text-current"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}


