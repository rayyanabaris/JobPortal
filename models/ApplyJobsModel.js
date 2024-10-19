const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "location",
  },
  skills: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "job_skills",
  },
  career: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "career_levels",
  },
  
  resume: {
    filename: { type: String, required: true },
    path: { type: String, required: true },
  },
});

module.exports = mongoose.model('jobApply', UserSchema);
