'use client'

import { Progress } from '@/components/ui/progress'

interface ReviewProgressProps {
  current: number
  total: number
}

export function ReviewProgress({ current, total }: ReviewProgressProps) {
  const progress = (current / total) * 100

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{current} / {total}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  )
}