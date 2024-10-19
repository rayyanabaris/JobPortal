const candidate = require("../models/CandidateModel");
const Selected = require("../models/SelectedCandidateModel");
const asyncHandler = require("express-async-handler");

const getcandidateList = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const totalCandidate = await candidate.countDocuments();
    const totalPages = Math.ceil(totalCandidate / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const getcandidateList = await candidate
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("job_category")
      .populate("location")
      .sort("name : 1")
      .exec();

    return res.status(200).json({
      success: true,
      msg: "Candiadate List",
      data: getcandidateList,
      page,
      nextPage,
      totalPages,
      totalCandidate,
    });
  } catch (error) {
    throw new Error(error);
  }
});
const getcandidateById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getacandidate = await candidate
      .findById(id);
    res.json(getacandidate);
  } catch (error) {
    throw new Error(error);
  }
});
const addselectedcandidate = asyncHandler(async (req, res) => {
  try {
    const candidates = await Selected.create(req.body);
    res.json(candidates);
  } catch (error) {
    throw new Error(error);
  }
});
const addcandidate = asyncHandler(async (req, res) => {
  try {
    const candidates = await candidate.create(req.body);
    res.json(candidates);
  } catch (error) {
    throw new Error(error);
  }
});
const updatecandidate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // validateMongoDbId(id);
  try {
    const updatedcandidate = await candidate.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedcandidate);
  } catch (error) {
    throw new Error(error);
  }
});
const deletecandidate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // validateMongoDbId(id);
  try {
    const deletedcandidate = await candidate.findByIdAndDelete(id);
    res.json(deletedcandidate);
  } catch (error) {
    throw new Error(error);
  }
});
const FilterCandidate = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    let filter = {};

    if (req.query.name) {
      filter.name = req.query.name;
    }
    
    if (req.query.mobile) {
      filter.mobile = req.query.mobile;
    }
    
    if (req.query.mobile2) {
      filter.mobile2 = req.query.mobile2;
    }
    const [candidates, count] = await Promise.all([
      candidate.aggregate([
        { $match: filter },
        {
          $project: {
            _id: 1,
            name: 1,
            mobile: 1,
            mobile2: 1,
        },
      },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]),
      candidate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: "Filtered candidates list fetched successfully",
      data: candidates,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching age filtered candidates",
      error: error.message,
    });
  }
});

const SelectedcandidateList = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    let filter = {};

  
    const [candidate, count] = await Promise.all([
      Selected.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "job_categories",
            localField: "job_category",
            foreignField: "_id",
            as: "job_category",
          },
        },
        {
          $lookup: {
            from: "companies",
            localField: "company",
            foreignField: "_id",
            as: "company",
          },
        },
        {
          $lookup: {
            from: "marital_statuses",
            localField: "maritalstatus",
            foreignField: "_id",
            as: "maritalstatus",
          },
        },
        { $unwind: { path: "$job_category", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$maritalstatus", preserveNullAndEmptyArrays: true } },
      
        {
          $addFields: {
            job_category: "$job_category.category_name",
            company: "$company.name",
            maritalstatus: "$maritalstatus.marital_status",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            mobile: 1,
            mobile2: 1,
            job_category: 1,
            company: 1,
            maritalstatus: 1,
            mofa_no: 1,
            visa_no: 1,
            passport_no: 1,
            flight_date: 1,
            employee_name: 1,
            charges: 1,
            photo: 1,
            agreement: 1,
            video: 1,

          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]),
      Selected.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: "Selected Candidate list fetched successfully",
      data: candidate,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching age filtered Candidate",
      error: error.message,
    });
  }
});

module.exports = {
  getcandidateList,
  getcandidateById,
  FilterCandidate,
  SelectedcandidateList,
  addselectedcandidate,
  addcandidate,
  updatecandidate,
  deletecandidate,
};
