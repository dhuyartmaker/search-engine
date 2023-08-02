const express = require("express");
const searchController = require("../controller/search.controller");
const { asyncHandler } = require("../utils");
const router = express.Router()

router.get('/search', asyncHandler(searchController.SearchCorpus))
router.post('/add', asyncHandler(searchController.AddCorpus))
router.delete('/', asyncHandler(searchController.DeleteCorpus))


module.exports = router;