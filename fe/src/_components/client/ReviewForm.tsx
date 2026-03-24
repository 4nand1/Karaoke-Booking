"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Send, Trash2, LogIn } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { clerkEnabled } from "@/lib/clerk-config";

interface Review {
  _id?: string;
  id?: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  timestamp: string;
  createdAt?: string;
  karaokeId?: string;
  userId?: string;
}

type ReviewApiResponse = {
  _id?: string;
  id?: number;
  name?: string;
  rating?: number;
  text?: string;
  createdAt?: string;
  karaokeId?: string;
  userId?: string | null;
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
    timestamp,
    createdAt: review.createdAt,
    karaokeId: review.karaokeId,
    userId: review.userId ?? undefined,
  };
};

type ReviewFormInnerProps = {
  karaokeId?: string;
  isSignedIn: boolean;
  isLoaded: boolean;
  userId?: string | null;
};

function ReviewFormWithClerk({ karaokeId }: { karaokeId?: string }) {
  const { isSignedIn, isLoaded, user } = useUser();

  return (
    <ReviewFormInner
      karaokeId={karaokeId}
      isSignedIn={Boolean(isSignedIn)}
      isLoaded={Boolean(isLoaded)}
      userId={user?.id}
    />
  );
}

const ReviewFormInner = ({
  karaokeId,
  isSignedIn,
  isLoaded,
  userId,
}: ReviewFormInnerProps) => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    text: "",
  });

  const [hoverRating, setHoverRating] = useState(0);

  const storageKey = karaokeId ? `karaokeReviews_${karaokeId}` : "karaokeReviews";

  // Load reviews on mount
  useEffect(() => {
    fetchReviews();
  }, [karaokeId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Try to fetch from backend
      try {
        const url = karaokeId ? `/reviews?karaokeId=${karaokeId}` : "/reviews";
        const response = await api.get(url);
        const reviewsData = Array.isArray(response.data?.data) ? response.data.data : [];
        const transformedReviews = reviewsData.map(formatReview);

        // Get local reviews to merge with backend data
        const savedReviews = localStorage.getItem(storageKey);
        let localReviews: Review[] = [];
        if (savedReviews) {
          try {
            localReviews = JSON.parse(savedReviews);
          } catch (e) {
            console.log("Failed to parse local reviews");
          }
        }

        // Merge: add local reviews that aren't in backend (e.g., pending uploads)
        const mergedReviews = transformedReviews;
        for (const localReview of localReviews) {
          const exists = transformedReviews.some((r: Review) => r._id === localReview._id || r.id === localReview.id);
          if (!exists) {
            mergedReviews.push(localReview);
          }
        }

        setReviews(mergedReviews);
        // Update localStorage with merged data
        localStorage.setItem(storageKey, JSON.stringify(mergedReviews));
      } catch {
        // Fallback to localStorage if API fails
        console.log("API unavailable, using localStorage");
        const savedReviews = localStorage.getItem(storageKey);
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
        await api.delete(`/reviews/${id}`, {
          data: {
            userId,
          },
        });
      } catch {
        console.log("API unavailable, using localStorage");
      }
      // Remove from local state - check both _id and id properties
      const updatedReviews = reviews.filter(review => {
        const reviewId = review._id || review.id;
        return reviewId !== id;
      });
      setReviews(updatedReviews);
      localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is signed in
    if (!isLoaded) return;
    if (!isSignedIn) {
      setShowSignInPrompt(true);
      return;
    }

    if (!formData.name.trim() || !formData.text.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      
      const newReviewData = {
        name: formData.name,
        rating: formData.rating,
        text: formData.text,
        userId,
        ...(karaokeId && { karaokeId }),
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
      localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
      
      // Clear form
      setFormData({
        name: "",
        rating: 5,
        text: "",
      });

      // Refresh reviews from backend to ensure sync
      await fetchReviews();
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
          {karaokeId ? 'Customer' : 'What Our'} <span className="text-primary">{karaokeId ? 'Reviews' : 'Singers'}</span> {karaokeId ? '' : 'Say'}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {karaokeId ? 'Reviews for this karaoke venue' : 'Real reviews from real karaoke lovers'}
        </p>
      </motion.div>

      {/* Sign In Prompt Modal */}
      {showSignInPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 shadow-lg max-w-sm w-full"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground text-center mb-2">
              Sign In to Share
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              You need to be signed in to submit a review. Sign in to continue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignInPrompt(false)}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition-all hover:border-primary/40"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/sign-in")}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Review Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 rounded-2xl bg-card p-8 shadow-md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  style={{ display: userId === review.userId ? "block" : "none" }}
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
            </motion.div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default function ReviewForm({ karaokeId }: { karaokeId?: string }) {
  if (!clerkEnabled) {
    return (
      <ReviewFormInner
        karaokeId={karaokeId}
        isSignedIn={false}
        isLoaded={true}
        userId={null}
      />
    );
  }

  return <ReviewFormWithClerk karaokeId={karaokeId} />;
}
