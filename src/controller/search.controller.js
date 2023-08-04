const { OkResponseMessage } = require("../core/success.response");
const WordModel = require("../models/word.model");
const { searchProcess } = require("../utils/word.util");

class SearchController {
    async AddCorpus(req, res, next) {
        const { formatContent } = req; 
        const holdWord = await WordModel.findOneAndUpdate(
            { word_content: formatContent, is_active: true },
            { word_content: formatContent, is_active: true },
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
        const { formatContent } = req;
        const engineSearch = await searchProcess(formatContent)
        return new OkResponseMessage(
            {
                message: "Ok",
                metadata: engineSearch
            }
        ).send(res);
    }

    async DeleteCorpus(req, res, next) {
        const { formatContent } = req;
        const engineSearch = await searchProcess(formatContent, 1)
        const findWord = await WordModel.findOne({ word_content: engineSearch[0], is_active: true }).select({ _id: 1, word_content: 1 });
        const deleteWord = await WordModel.findOneAndUpdate({ _id: findWord._id }, { $set: { is_active: false }});
        return new OkResponseMessage(
            {
                message: "Deleted!",
                metadata: {
                    word_content: findWord
                }
            }
        ).send(res);
    }
}

module.exports = new SearchController()