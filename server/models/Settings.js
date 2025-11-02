const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  general: {
    siteName: {
      type: String,
      default: 'Fixly'
    },
    siteDescription: {
      type: String,
      default: 'Service Marketplace Platform'
    },
    logo: {
      type: String
    },
    contactEmail: {
      type: String,
      default: 'support@fixly.com'
    },
    contactPhone: {
      type: String,
      default: '+1234567890'
    }
  },
  commission: {
    rate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    minimumPayout: {
      type: Number,
      default: 50
    },
    payoutSchedule: {
      type: String,
      enum: ['Weekly', 'Bi-Weekly', 'Monthly'],
      default: 'Monthly'
    }
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  security: {
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    requirePhoneVerification: {
      type: Boolean,
      default: false
    },
    requireProviderDocuments: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });

// Static method to get or create settings
SettingsSchema.statics.getOrCreate = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);