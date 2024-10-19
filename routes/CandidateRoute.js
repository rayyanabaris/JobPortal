const router = require("express").Router();

const {
  getcandidateList,
  addcandidate,
  FilterCandidate,
  updatecandidate,
  deletecandidate,
  getcandidateById,
  addselectedcandidate,
  SelectedcandidateList,

} = require("../controller/CandidateCtrl");

router.get("/all", getcandidateList);
router.get("/filter", FilterCandidate);
router.get("/get/:id", getcandidateById);
router.post("/selected-candidate", addselectedcandidate);
router.get("/selected-candidate", SelectedcandidateList);
router.post("/add", addcandidate);
router.put("/update/:id", updatecandidate);
router.delete("/delete/:id", deletecandidate);



module.exports = router;
