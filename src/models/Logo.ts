import mongoose, { Schema } from 'mongoose';
import { ILogo } from '../types';

const logoSchema = new Schema<ILogo>({
  image: {
    type: String,
    required: [true, 'Logo image is required'],
    trim: true
  }
}, {
  timestamps: true
});

export const Logo = mongoose.model<ILogo>('Logo', logoSchema); 