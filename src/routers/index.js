const express = require("express");
const searchController = require("../controller/search.controller");
const { asyncHandler } = require("../utils");
const { useValidateSeatch } = require("../middleware/useValidateSearch");
const router = express.Router()

router.get('/search', useValidateSeatch, asyncHandler(searchController.SearchCorpus))
router.post('/add', useValidateSeatch, asyncHandler(searchController.AddCorpus))
router.delete('/', useValidateSeatch, asyncHandler(searchController.DeleteCorpus))


module.exports = router;