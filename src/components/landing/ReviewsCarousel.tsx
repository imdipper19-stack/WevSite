
'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface Review {
    id: string;
    authorName: string;
    rating: number;
    content: string;
    createdAt: string;
}

export function ReviewsMarquee({ reviews }: { reviews: Review[] }) {
    const [width, setWidth] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (carouselRef.current) {
            setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
        }
    }, [reviews]);

    // Duplicate reviews to create infinite effect if there are few
    const displayReviews = reviews.length < 5 ? [...reviews, ...reviews, ...reviews, ...reviews] : [...reviews, ...reviews];

    return (
        <div className="overflow-hidden cursor-grab active:cursor-grabbing w-full">
            <motion.div
                ref={carouselRef}
                className="flex gap-6 pb-8"
                animate={{ x: [0, -1000] }} // simple marquee, or use useScroll for drag
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 30, // adjust speed
                        ease: "linear",
                    },
                }}
            // Drag functionality can conflict with marquee. 
            // Let's make it a simple auto-scroll marquee first as requested.
            // For a true marquee, we need to translate by -50% of content width if duplicated.
            >
                {/* We need a better marquee implementation for seamless loop. 
                      Let's use a simpler CSS or Framer approach for seamless loop.
                  */}
            </motion.div>
        </div>
    );
}

// Improved implementation for seamless infinite scroll
export function ReviewsCarousel({ reviews }: { reviews: any[] }) {
    // Ensure we have enough items to scroll
    const items = reviews.length < 6 ? [...reviews, ...reviews, ...reviews, ...reviews] : [...reviews, ...reviews];

    return (
        <div className="relative w-full overflow-hidden mask-gradient-x">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--background-alt)] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--background-alt)] to-transparent z-10 pointer-events-none" />

            <div className="flex gap-6 animate-marquee whitespace-nowrap py-4">
                {items.map((review, index) => (
                    <div
                        key={`${review.id}-${index}`}
                        className="inline-block w-[300px] sm:w-[350px] p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] whitespace-normal"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                {review.authorName?.[0] || 'A'}
                            </div>
                            <div>
                                <div className="font-semibold text-sm sm:text-base text-[var(--foreground)]">{review.authorName || 'Пользователь'}</div>
                                <div className="flex gap-0.5">
                                    {[...Array(review.rating || 5)].map((_, i) => (
                                        <Star key={i} size={14} className="fill-[var(--accent)] text-[var(--accent)]" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-[var(--foreground-muted)] line-clamp-4 leading-relaxed">
                            &quot;{review.content}&quot;
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
