const router = require("express").Router();

const {
  getJobList,
  addJob,
  getFilterJob,
  updateJob,
  deleteJob,
  getJobById,
  getSearchJob,
} = require("../controller/JobsCtrl");

router.post("/add", addJob);
router.get("/all", getJobList);
router.get("/get/:id", getJobById);
router.post("/filter", getFilterJob);
router.put("/update/:id", updateJob);
router.delete("/delete/:id", deleteJob);
router.get("/search/:key", getSearchJob);

module.exports = router;
