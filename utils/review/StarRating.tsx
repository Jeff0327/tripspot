'use client'
import React, { useState } from 'react';
import { FaStar } from "react-icons/fa";

interface StarRatingProps {
    initialRating?: number;
    onRatingChange: (rating: number) => void;
    size?: string;
}

function StarRating({ initialRating = 5, onRatingChange, size = "w-8 h-8" }: StarRatingProps) {
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(0);

    const handleRatingChange = (value: number) => {
        setRating(value);
        onRatingChange(value);
    };

    return (
        <div className="flex">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={index} className="cursor-pointer">
                        <input
                            type="radio"
                            name="rating-radio"
                            value={ratingValue}
                            className="hidden"
                            onClick={() => handleRatingChange(ratingValue)}
                        />
                        <FaStar
                            className={`${size} mr-1`}
                            color={ratingValue <= (hover || rating) ? "#FFD700" : "#e4e5e9"}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                        />
                    </label>
                );
            })}
        </div>
    );
}

export default StarRating;