const express = require("express");
const router = express.Router();
const aicontroller = require("../controllers/aicontroller");

router.post("/getReview", aicontroller.getReview);

module.exports = router;
