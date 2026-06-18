import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. تحديد مواصفات البيانات (TypeScript Interface)
export interface IRsvp extends Document {
  name: string;
  guests: number;
  status: string;
  createdAt: Date;
}

// 2. بناء الـ Schema
const RsvpSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  guests: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    required: [true, 'Please provide a status.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 3. تصدير الموديل مع الـ Types لمنع مشاكل الـ Cache في الـ Dev server
export const Rsvp: Model<IRsvp> = mongoose.models.Rsvp || mongoose.model<IRsvp>('Rsvp', RsvpSchema);