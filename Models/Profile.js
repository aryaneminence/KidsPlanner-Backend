const mongoose=require('mongoose')


const profileSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    avatar: {
      type: String, 
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7],
      required: true,
    },
    grade: {
      type: String,
      enum:["Pre-nursery", "Nursery", "KG1", "KG2", "1","2","3"], 
      required: true,
    },
    preferences: {
      reading: { type: Boolean, default: false },
      writing: { type: Boolean, default: false },
      entertainment: { type: Boolean, default: false },
      learning: { type: Boolean, default: false },
    },
    additionalChild: {
      type: Boolean,
      default: false,
    },
  });
  
  const Profile = mongoose.model('Profile', profileSchema);
  
  module.exports = Profile;