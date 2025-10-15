import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  senderEmail: {     
    type: String,
    required: true,
  },
  receiverEmail: {    
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
 enum: ['Pending', 'Approved', 'Declined'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


const Request = mongoose.model("Request", requestSchema);

export default Request;
