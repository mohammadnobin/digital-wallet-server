import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  senderEmail: {       // যে ইউজার রিকুয়েস্ট পাঠাচ্ছে
    type: String,
    required: true,
  },
  receiverEmail: {     // যে ইউজারকে রিকুয়েস্ট পাঠানো হয়েছে
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['general','food','transportation','utilities','entertainment','shopping'],
    default: 'general',
  },
  dueDate: {
    type: Date,
  },
  message: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['Pending','Received','Declined'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


const Request = mongoose.model("Request", requestSchema);

export default Request;