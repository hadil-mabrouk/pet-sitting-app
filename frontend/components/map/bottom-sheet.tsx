"use client"

import type React from "react"

import { useState, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { GripHorizontal } from "lucide-react"

interface BottomSheetProps {
  children: ReactNode
  snapPoints?: number[]
  defaultSnap?: number
  className?: string
}

export function BottomSheet({ children, snapPoints = [0.15, 0.5, 0.9], defaultSnap = 0, className }: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap)
  const [isDragging, setIsDragging] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const height = `${snapPoints[currentSnap] * 100}%`

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true)
    startY.current = "touches" in e ? e.touches[0].clientY : e.clientY
    startHeight.current = snapPoints[currentSnap]
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const cycleSnap = () => {
    setCurrentSnap((prev) => (prev + 1) % snapPoints.length)
  }

  return (
    <div
      ref={sheetRef}
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-40",
        isDragging && "transition-none",
        className,
      )}
      style={{ height }}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onClick={cycleSnap}
      >
        <GripHorizontal className="w-8 h-1.5 text-muted-foreground/50" />
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100%-28px)] px-4 pb-8">{children}</div>
    </div>
  )
}
