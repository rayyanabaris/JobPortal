const router = require("express").Router();

const {
  getCompaniesList,
  getCompaniesByFilter,
  createCompanies,
  updateCompanies,
  deleteCompanies,
  getCompaniesById,
  getSearchCompanies,
} = require("../controller/CompaniesCtrl");

router.get("/all", getCompaniesList);
router.get("/get/:id", getCompaniesById);
router.post("/filter", getCompaniesByFilter);
router.post("/add", createCompanies);
router.put("/update/:id", updateCompanies);
router.delete("/delete/:id", deleteCompanies);
router.get("/search/:key", getSearchCompanies);

module.exports = router;
