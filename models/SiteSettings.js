import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
  businessName: {
    type: String,
    default: 'Hafiz Tech',
  },
  headerLogo: {
    type: String,
    default: '',
  },
  footerLogo: {
    type: String,
    default: '',
  },
  aboutContent: {
    type: String,
    default: 'Welcome to our amazing e-commerce store!',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);