const mongoose = require("mongoose");

const SelectedCandidateSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    job_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job_categories",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
    mobile: {
      type: String,
      unique: true,
    },
    mobile2: {
      type: String,
    },
    mofa_no: {
      type: String,
    },
    visa_no: {
      type: String,
    },
    passport_no: {
      type: String,
    },
    flight_date: {
      type: Date,
    },
    maritalstatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "marital_status",
    },
    employee_name: {
      type: String,
    },
    charges: {
      type: String,
    },
    photo: {
      type: String,
    },
    agreement: {
      type: String,
    },
    video: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
SelectedCandidateSchema.index({ title: "text" });

module.exports = mongoose.model("SelectedCandidate", SelectedCandidateSchema);
