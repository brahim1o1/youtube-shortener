import mongoose from 'mongoose';

const viewDetailSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String, default: '' },
  device: { type: String, default: '' }
}, { _id: false });

const linkSchema = new mongoose.Schema({
  shortCode: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  originalUrl: { 
    type: String, 
    required: true 
  },
  videoId: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  views: {
    count: { 
      type: Number, 
      default: 0 
    },
    details: [viewDetailSchema]
  },
  urlType: { 
    type: String, 
    enum: ['video', 'shorts'], 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

// If the model is already compiled, use the existing model
export default mongoose.models.Link || mongoose.model('Link', linkSchema);