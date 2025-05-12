// app/bots/[slug]/components/StarRating.tsx
"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface StarRatingProps {
    botId: string;
    onRatingSubmitted?: () => void; // Optional callback to refresh data
}

export default function StarRating({ botId, onRatingSubmitted }: StarRatingProps) {
    const { status } = useSession();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (status !== "authenticated") {
            alert("Please log in to submit a rating.");
            return;
        }

        if (rating === 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/ratings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: rating, botId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || "Failed to submit rating");
                return;
            }

            setRating(0);
            if (onRatingSubmitted) onRatingSubmitted();
        } catch (error: any) {
            alert(error.message || "An error occurred while submitting the rating.");
            console.error("Rating submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-6 h-6 cursor-pointer ${(hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    />
                ))}
            </div>
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
                className="bg-blue-600 hover:bg-blue-700"
            >
                {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
        </div>
    );
}