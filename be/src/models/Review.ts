import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  name: string;
  venue: string;
  rating: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Please provide a venue name'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: [true, 'Please provide review text'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
