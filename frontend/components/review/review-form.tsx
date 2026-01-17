"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ArrowLeft } from "lucide-react"

interface ReviewFormProps {
  targetName: string
  targetAvatar?: string
  petName: string
  onSubmit: (rating: number, comment: string) => void
  onBack: () => void
}

export function ReviewForm({ targetName, targetAvatar, petName, onSubmit, onBack }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating <= 0) {
      setError("Choisis une note avant d'envoyer.")
      return
    }
    setError(null)
    onSubmit(rating, comment)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">Leave a Review</h1>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Card>
          <CardHeader className="text-center pb-2">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage src={targetAvatar || "/happy-person-3.jpeg"} />
              <AvatarFallback className="text-xl">{targetName[0]}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">How was your experience with {targetName}?</CardTitle>
            <p className="text-sm text-muted-foreground">Service for {petName}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={`transition-colors ${
                        star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 5 && "Excellent!"}
                {rating === 4 && "Very Good!"}
                {rating === 3 && "Good"}
                {rating === 2 && "Fair"}
                {rating === 1 && "Poor"}
              </p>
            )}
            {error && <p className="text-center text-xs text-destructive">{error}</p>}

              {/* Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Share your experience (optional)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg" disabled={rating === 0}>
                Submit Review
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
