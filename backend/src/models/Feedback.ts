import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  passenger: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  busNumber: string;
  stars: number;
  comment?: string;
  createdAt: Date;
}

const FeedbackSchema: Schema<IFeedback> = new Schema(
  {
    passenger: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driver:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    busNumber: { type: String, required: true, trim: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const Feedback: Model<IFeedback> = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
export default Feedback;
