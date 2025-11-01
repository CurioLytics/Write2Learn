'use client'

import { Button } from '@/components/ui/button'

interface RatingButtonsProps {
  onRate: (rating: 'Again' | 'Hard' | 'Good' | 'Easy') => void
  disabled?: boolean
}

export function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mt-8">
      <Button
        onClick={() => onRate('Again')}
        disabled={disabled}
        className="bg-red-500 hover:bg-red-600"
      >
        Again
      </Button>
      <Button
        onClick={() => onRate('Hard')}
        disabled={disabled}
        className="bg-yellow-500 hover:bg-yellow-600"
      >
        Hard  
      </Button>
      <Button
        onClick={() => onRate('Good')}
        disabled={disabled}
        className="bg-green-500 hover:bg-green-600"
      >
        Good
      </Button>
      <Button
        onClick={() => onRate('Easy')}
        disabled={disabled}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Easy
      </Button>
    </div>
  )
}