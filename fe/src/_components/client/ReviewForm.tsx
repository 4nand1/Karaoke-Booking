"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Send, Trash2 } from "lucide-react";
import { api } from "@/lib/axios";

interface Review {
  _id?: string;
  id?: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  venue: string;
  timestamp: string;
  createdAt?: string;
}

type ReviewApiResponse = {
  _id?: string;
  id?: number;
  name?: string;
  rating?: number;
  text?: string;
  venue?: string;
  createdAt?: string;
};

const formatReview = (review: ReviewApiResponse): Review => {
  const safeName = review.name?.trim() || "Anonymous";
  const safeCreatedAt = review.createdAt ? new Date(review.createdAt) : null;
  const timestamp =
    safeCreatedAt && !Number.isNaN(safeCreatedAt.getTime())
      ? safeCreatedAt.toLocaleDateString()
      : "just now";

  return {
    _id: review._id,
    id: review.id,
    name: safeName,
    avatar: safeName.charAt(0).toUpperCase(),
    rating:
      typeof review.rating === "number" && review.rating >= 1 && review.rating <= 5
        ? review.rating
        : 5,
    text: review.text?.trim() || "",
    venue: review.venue?.trim() || "Unknown venue",
    timestamp,
    createdAt: review.createdAt,
  };
};

const ReviewForm = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    venue: "",
    rating: 5,
    text: "",
  });

  const [hoverRating, setHoverRating] = useState(0);

  // Load reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Try to fetch from backend
      try {
        const response = await api.get("/reviews");
        const reviewsData = Array.isArray(response.data?.data) ? response.data.data : [];
        const transformedReviews = reviewsData.map(formatReview);

        setReviews(transformedReviews);
        // Save to localStorage as backup
        localStorage.setItem("karaokeReviews", JSON.stringify(transformedReviews));
      } catch {
        // Fallback to localStorage if API fails
        console.log("API unavailable, using localStorage");
        const savedReviews = localStorage.getItem("karaokeReviews");
        if (savedReviews) {
          const parsedReviews = JSON.parse(savedReviews);
          setReviews(Array.isArray(parsedReviews) ? parsedReviews.map(formatReview) : []);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string | number) => {
    try {
      // Try to delete from backend
      try {
        await api.delete(`/reviews/${id}`);
      } catch {
        console.log("API unavailable, using localStorage");
      }
      // Remove from local state - check both _id and id properties
      const updatedReviews = reviews.filter(review => {
        const reviewId = review._id || review.id;
        return reviewId !== id;
      });
      setReviews(updatedReviews);
      localStorage.setItem("karaokeReviews", JSON.stringify(updatedReviews));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.venue.trim() || !formData.text.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      
      const newReviewData = {
        name: formData.name,
        venue: formData.venue,
        rating: formData.rating,
        text: formData.text,
      };

      let newReview: Review;
      
      // Try to save to backend
      try {
        const response = await api.post("/reviews", newReviewData);
        newReview = formatReview(response.data?.data ?? newReviewData);
      } catch {
        // Fallback: create review locally
        console.log("API unavailable, saving to localStorage");
        newReview = formatReview({
          _id: Date.now().toString(),
          ...newReviewData,
          createdAt: new Date().toISOString(),
        });
      }

      // Update state and localStorage
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem("karaokeReviews", JSON.stringify(updatedReviews));
      
      // Clear form
      setFormData({
        name: "",
        venue: "",
        rating: 5,
        text: "",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto px-6 py-16">
         <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
        What Our <span className="text-primary">Singers</span> Say
      </h2>
      <p className="mt-2 text-muted-foreground">Real reviews from real karaoke lovers</p>
    </motion.div>

      {/* Review Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 rounded-2xl bg-card p-8 shadow-md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your name"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Karaoke Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                placeholder="e.g., Neon Lounge"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-3">
              Rating
            </label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: i + 1 })}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      (hoverRating || formData.rating) > i
                        ? "fill-primary text-primary"
                        : "text-border"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-muted-foreground">
                {formData.rating} out of 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-2">
              Your Review
            </label>
            <textarea
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              placeholder="Share your karaoke experience... (minimum 10 characters)"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </motion.div>

      {/* Reviews Display */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-foreground mb-8">
          Recent <span className="text-primary">Reviews</span>
        </h3>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-card p-12 shadow-md text-center"
          >
            <p className="text-lg text-muted-foreground">Loading reviews...</p>
          </motion.div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card p-12 shadow-md text-center"
          >
            <p className="text-lg text-muted-foreground">
              No reviews yet. Be the first to share your karaoke experience!
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
            <motion.div
              key={review._id || review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-hover rounded-2xl bg-card p-6 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.timestamp}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const reviewId = review._id || review.id;
                    if (reviewId) {
                      deleteReview(reviewId);
                    }
                  }}
                  className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors ml-2"
                  title="Delete review"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-primary text-primary"
                  />
                ))}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-card-foreground">
                {review.text}
              </p>

              <div className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-1">
                <p className="text-xs font-medium text-primary">{review.venue}</p>
              </div>
            </motion.div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewForm;
