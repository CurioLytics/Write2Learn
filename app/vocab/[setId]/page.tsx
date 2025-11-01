'use client'

import { useEffect, useState } from 'react'
import { FlashcardDisplay } from '../components/review/FlashcardDisplay'
import { RatingButtons } from '../components/review/RatingButtons'
import { ReviewProgress } from '../components/review/ReviewProgress'
import { ReviewSummary } from '../components/review/ReviewSummary'
import { fsrs } from '@/lib/fsrs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ReviewPageProps {
  params: {
    setId: string
  }
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviewLogs, setReviewLogs] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadCards() {
      const { data, error } = await supabase
        .from('vocabulary_items')
        .select('*')
        .eq('set_id', params.setId)
        .order('created_at')
      
      if (error) {
        console.error('Error loading cards:', error)
        return
      }

      setCards(data || [])
      setLoading(false)
    }

    loadCards()
  }, [params.setId])

  async function handleRate(rating: 'Again' | 'Hard' | 'Good' | 'Easy') {
    const card = cards[currentIndex]
    
    // Compute next review with FSRS
    const review = fsrs.computeNextReview(card, rating)
    
    // Save review log
    const { error } = await supabase
      .from('vocabulary_review_logs')
      .insert({
        card_id: card.id,
        rating,
        reviewed_at: new Date().toISOString(),
        next_review: review.date,
        difficulty_factor: review.difficulty,
        interval: review.interval,
        stability: review.stability,
        retrievability: review.retrievability
      })

    if (error) {
      console.error('Error saving review:', error)
    }

    // Update review logs
    setReviewLogs(prev => [...prev, {
      cardId: card.id,
      rating,
      reviewedAt: new Date(),
      nextReview: review.date,
      metrics: review
    }])

    // Move to next card or complete
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (isComplete) {
    return <ReviewSummary logs={reviewLogs} />
  }

  return (
    <div className="container mx-auto py-8">
      <ReviewProgress 
        current={currentIndex + 1}
        total={cards.length}
      />
      
      <FlashcardDisplay 
        card={cards[currentIndex]}
      />
      
      <RatingButtons 
        onRate={handleRate}
        disabled={loading}
      />
    </div>
  )
}