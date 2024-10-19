const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middlewares/upload.js');
const uploadController = require('../controller/ApplyJobsCtrl');

// Route to upload a resume
router.post('/job', uploadMiddleware.single('resume'), uploadController.uploadResume);

// Route to filter users based on resume content
router.get('/filter', uploadController.filterUsers);

// Route to get or filter users based on query params
router.get('/users', uploadController.getapplyjobsList);

router.get('/filter-jobs', uploadController.FilterApplyJobs);


module.exports = router;
