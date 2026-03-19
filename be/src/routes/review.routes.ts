import { Router } from 'express';
import { getReviews, createReview, deleteReview } from '../controllers/reviewController';

const reviewRouter = Router();

reviewRouter.get('/', getReviews);
reviewRouter.post('/', createReview);
reviewRouter.delete('/:id', deleteReview);

export default reviewRouter;
