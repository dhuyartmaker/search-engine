const { BadRequestError } = require("../core/error.response");

const useValidateSeatch = (req, res, next) => {
    const word_content = req.body.word_content || req.query.searchText;
    if (!word_content) throw new BadRequestError("Search text is required!");
    if (word_content.includes(" ")) throw new BadRequestError("Search text must be a word!");

    const formatContent = `${word_content}`.toLowerCase().trim();
    req.formatContent = formatContent
    next()
}

module.exports = {
    useValidateSeatch
}