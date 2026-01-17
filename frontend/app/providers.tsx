"use client"

import { useEffect } from "react"
import { I18nProvider, useI18n } from "@/lib/i18n"

function DirController({ children }: { children: React.ReactNode }) {
  const { rtl } = useI18n()
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = rtl ? "rtl" : "ltr"
    }
  }, [rtl])
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <DirController>{children}</DirController>
    </I18nProvider>
  )
}
