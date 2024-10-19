const User = require("../models/ApplyJobsModel");
const Locations = require("../models/LocationModel");
const Skills = require("../models/JobSkillsModel");
const Careers = require("../models/CarrierModel");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const mammoth = require("mammoth");

// Controller to handle resume upload
exports.uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  try {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      location: req.body.location,
      skills: req.body.skills,
      career: req.body.career,
      resume: {
        filename: req.file.filename,
        path: req.file.path,
      },
    });

    await newUser.save();
    res.status(200).send("File uploaded and user saved");
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
};

exports.filterUsers = async (req, res) => {
  try {
    // Extract query parameters (can include name, email, and keywords)
    const { name, email, keyword, skills, experience } = req.query;

    // Create a base query object for MongoDB field search
    const query = {};

    // Add conditions for name and email if present
    if (name) {
      query.name = { $regex: new RegExp(name, "i") }; // case-insensitive search
    }
    if (email) {
      query.email = { $regex: new RegExp(email, "i") };
    }

    // Fetch users based on MongoDB fields (name, email)
    const users = await User.find(query);
    const filteredUsers = [];

    // Loop through each user and filter based on resume content
    for (let user of users) {
      const fileExtension = user.resume.filename.split(".").pop();

      let resumeText = "";

      // Extract text from the resume based on its file type
      if (fileExtension === "pdf") {
        const dataBuffer = fs.readFileSync(user.resume.path);
        const data = await pdfParse(dataBuffer);
        resumeText = data.text;
      } else if (fileExtension === "docx") {
        const result = await mammoth.extractRawText({ path: user.resume.path });
        resumeText = result.value;
      }

      // Check if the resume contains the keyword or other fields (skills, experience)
      const matchesKeyword = keyword ? resumeText.includes(keyword) : true;
      const matchesSkills = skills ? resumeText.includes(skills) : true;
      const matchesExperience = experience
        ? resumeText.includes(experience)
        : true;

      // If all conditions are satisfied, add the user to filtered list
      if (matchesKeyword && matchesSkills && matchesExperience) {
        filteredUsers.push(user);
      }
    }

    // Return filtered users
    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).send("Error filtering users: " + error.message);
  }
};


exports.getapplyjobsList = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const totalapplyjobs = await User.countDocuments();
      const totalPages = Math.ceil(totalapplyjobs / limit);
      const nextPage = page < totalPages ? page + 1: null;
      const allapplyjobs = await User.find().skip((page - 1) * limit).limit(limit)
      
    
    return res.status(200).json({
      success: true,
      msg: 'Apply Jobs List',
      data: allapplyjobs,
      page,
      nextPage,
      totalPages,
      totalapplyjobs
    })
  } catch (error) {
    throw new Error(error);
  }
};

exports.FilterApplyJobs = async (req, res) => {
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

    if (req.query.location) {
      const location = await Locations.findOne({ name: req.query.location });
      filter.location = location ? location._id : null;
    }
    if (req.query.skills) {
      const skills = await Skills.findOne({ name: req.query.skills });
      filter.skills = skills ? skills._id : null;
    }
    if (req.query.career) {
      const career = await Careers.findOne({ name: req.query.career });
      filter.career = career ? career._id : null;
    }
    const [users, count] = await Promise.all([
      User.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "locations",
            localField: "location",
            foreignField: "_id",
            as: "location",
          },
        },
        {
          $lookup: {
            from: "job_skills",
            localField: "skills",
            foreignField: "_id",
            as: "skills",
          },
        },
        {
          $lookup: {
            from: "career_levels",
            localField: "career",
            foreignField: "_id",
            as: "career",
          },
        },
        { $unwind: { path: "$location", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$skills", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$career", preserveNullAndEmptyArrays: true } },
      
        {
          $addFields: {
            location: "$location.location_name",
            skills: "$skills.job_skills",
            career: "$career.career_level",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            mobile: 1,
            email: 1,
            location: 1,
            skills: 1,
            career: 1,
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: "Filtered Jobs list fetched successfully",
      data: users,
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
};
