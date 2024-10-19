const slugify = require("slugify");
const Company = require("../models/CompaniesModel");
const asyncHandler = require("express-async-handler");

const getCompaniesList = asyncHandler(async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const totalCompany = await Company.countDocuments();
      const totalPages = Math.ceil(totalCompany / limit);
      const nextPage = page < totalPages ? page + 1: null;
      const getCompaniesList = await Company.find().skip((page - 1) * limit).limit(limit)
      .populate("country_id")
      .populate("state_id")
      .populate("city_id")
      .sort("name : 1");
    
    return res.status(200).json({
      success: true,
      msg: 'Companies',
      data: getCompaniesList,
      page,
      nextPage,
      totalPages,
      totalCompany
    })
  } catch (error) {
    throw new Error(error);
  }
});

const getCompaniesById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getaCompanies = await Company.findById(id)
    .populate("country_id")
    .populate("state_id")
    .populate("city_id");
    res.json(getaCompanies);
  } catch (error) {
    throw new Error(error);
  }
});

const getCompaniesByFilter = asyncHandler(async (req, res) => {
  try {
    const getaCompanies = await Company.find(req.body)
    .populate("country_id")
    .populate("state_id")
    .populate("city_id")
    .exec();
    res.json(getaCompanies);
  } catch (error) {
    throw new Error(error);
  }
});

const createCompanies = asyncHandler(async (req, res) => {
  try {
    if (req.body.email) {
      req.body.slug = slugify(req.body.email);
    }
    const Companies = await Company.create(req.body);
    res.json(Companies);
  } catch (error) {
    throw new Error(error);
  }
});

const updateCompanies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // validateMongoDbId(id);
  try {
    const updatedCompanies = await Company.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedCompanies);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCompanies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // validateMongoDbId(id);
  try {
    const deletedCompanies = await Company.findByIdAndDelete(id);
    res.json(deletedCompanies);
  } catch (error) {
    throw new Error(error);
  }
});

const getSearchCompanies = asyncHandler(async (req, res) => {
  try {
    const getSearchCompanies = await Company.find({

      "$or":[
        {name:{$regex:req.params.key}},
        {location:{$regex:req.params.key}},
      ]
    });
    res.json(getSearchCompanies);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  getCompaniesList,
  getCompaniesById,
  getCompaniesByFilter,
  getSearchCompanies,
  createCompanies,
  updateCompanies,
  deleteCompanies,
};
