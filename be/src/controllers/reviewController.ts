import { Request, Response } from 'express';
import Review from '../models/Review';

// Get all reviews
export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
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
    const { name, venue, rating, text } = req.body;

    if (!name || !venue || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const review = await Review.create({
      name,
      venue,
      rating,
      text,
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

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

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
