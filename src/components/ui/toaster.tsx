"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

// Default auto-dismiss durations. Destructive toasts get longer so
// users have time to read what went wrong; success/info toasts auto-
// dismiss faster to avoid stacking. Each toast can still override via
// the `duration` prop in toast({...}).
const DEFAULT_DURATION_MS = 5_000
const DESTRUCTIVE_DURATION_MS = 8_000

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={DEFAULT_DURATION_MS}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const isDestructive = props.variant === 'destructive'
        return (
          <Toast
            key={id}
            duration={isDestructive ? DESTRUCTIVE_DURATION_MS : DEFAULT_DURATION_MS}
            {...props}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
