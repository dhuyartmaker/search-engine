const { BadRequestError, NotFoundError } = require("../core/error.response");
const { OkResponseMessage } = require("../core/success.response");
const WordModel = require("../models/word.model");
const { searchByScore, getRegexStrSearch, searchProcess } = require("../utils/word.util");

class SearchController {
    async AddCorpus(req, res, next) {
        const { word_content } = req.body;
        if (!word_content) throw new BadRequestError("Search text is required!");

        const holdWord = await WordModel.findOneAndUpdate(
            { word_content, is_active: true },
            { word_content, is_active: true },
            { new: true, upsert: true }
        );
        return new OkResponseMessage(
            {
                message: "Add corpus success!",
                metadata: holdWord
            }
        ).send(res);
    }

    async SearchCorpus(req, res, next) {
        const { searchText } = req.query
        if (!searchText) throw new BadRequestError("Search text is required!")
        const engineSearch = await searchProcess(searchText)
        return new OkResponseMessage(
            {
                message: "Ok",
                metadata: engineSearch
            }
        ).send(res);
    }

    async DeleteCorpus(req, res, next) {
        const { word_content } = req.body;
        if (!word_content) throw new BadRequestError("Search text is required!");
        const findWord = await WordModel.findOne({ word_content, is_active: true });
        if (!findWord) throw new NotFoundError("Word not found!");

        const deleteWord = await WordModel.findOneAndUpdate({ _id: findWord._id }, { $set: { is_active: false }});
        return new OkResponseMessage(
            {
                message: "Deleted!",
            }
        ).send(res);
    }
}

module.exports = new SearchController()