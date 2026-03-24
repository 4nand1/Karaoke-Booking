import { Request, Response } from 'express';
import Review from '../models/Review';

// Get all reviews with optional karaoke filter
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { karaokeId } = req.query;
    
    let query = {};
    if (karaokeId) {
      query = { karaokeId };
    }
    
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error,
    });
  }
};

// Create a review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { name, karaokeId, rating, text, userId } = req.body;

    if (!name || !karaokeId || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, karaokeId, rating, text',
      });
    }

    const review = await Review.create({
      name,
      karaokeId,
      rating,
      text,
      ...(userId && { userId }),
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error,
    });
  }
};

// Delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user is the owner of the review
    if (review.userId && review.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error,
    });
  }
};
