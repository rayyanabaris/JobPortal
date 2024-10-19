const router = require("express").Router();

const {
  getSalaryPeriodList,
  createSalaryPeriod,
  updateSalaryPeriod,
  deleteSalaryPeriod,
  getSalaryPeriodById,
  getSearchSalaryPeriod,
} = require("../controller/SalaryPeriodCtrl");

router.get("/", getSalaryPeriodList);
router.get("/:id", getSalaryPeriodById);
router.post("/add", createSalaryPeriod);
router.put("/update/:id", updateSalaryPeriod);
router.delete("/delete/:id", deleteSalaryPeriod);
router.get("/search/:key", getSearchSalaryPeriod);

module.exports = router;
