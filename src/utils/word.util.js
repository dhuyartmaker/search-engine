const { debugConsole } = require(".");
const WordModel = require("../models/word.model");

// ----Config----
const mainRegex = (arrCharacter) => ".*" + arrCharacter.join(".*") + ".*"
const ruleScore = (word) => ({
    0: "^" + word + "$", // exact match with word
    1: `(^${word}.{1}$)|(^.{1}${word}$)`, // can have prefix or post fix
    2: `(^.{1}${word}.{1}$)|(^${word}.{2,3}$)|(^.{2,3}${word}$)`, // have both of pre-post fix 
    3: `^.{1,3}${word}.{1,3}$`, // more 
    4: ".{0,2}" + `${word}`.split("").join(".{1,2}") + ".{0,2}", // start split to add space between word
});
// --------------


const searchByScore = (word = "", datas = []) => {
    debugConsole("==datas==", datas.length, word)
    const results = [];
    const scores = ruleScore(word);

    for (let i = 0; i < datas.length; i += 1) {
        const data = datas[i]
        Object.keys(scores).forEach(score => {
            const matchWord = data.match(new RegExp(scores[score]));
            if (matchWord) {
                if (!results[Number(score)]) {
                    results[Number(score)] = []
                }
                results[Number(score)].push(data)
            }
        })
    }
    results[5] = datas;
    return results.map(ele => ele.sort((a,b) => a.length - b.length));
}

const searchProcess = async (word, resultSize = 3) => {
    let result = [];
    let tempWord = word;
    do {
        const { fullRegex } = getRegexStrSearch(tempWord)
        const continousSearch = await analystSearchEngine(fullRegex, tempWord);
        debugConsole("==continousSearch==", continousSearch)
        result = result.concat(continousSearch)
        // Check duplicate
        const setCheckDuplicate = new Set(result)
        result = Array.from(setCheckDuplicate)
        tempWord = tempWord.slice(0, tempWord.length - 1);
    } while (result.length < resultSize && tempWord.length > 0)

    const sliceResult = result.length <= resultSize ? result : result.slice(0, resultSize);
    const remainWord = resultSize - sliceResult.length;
    if (remainWord != 0) {
        const findRandomWord = (await WordModel.aggregate([{$match: { 'word_content': {'$nin': sliceResult}}}, { $sample: { size: remainWord }}])).map(e => e.word_content)
        debugConsole("==findRandomWord==", findRandomWord)
        sliceResult.push(...findRandomWord)
    }

    return sliceResult
}

const analystSearchEngine = async (fullRegex, word) => {
    const searchResult = await WordModel.find({ is_active: true, word_content: { $regex: fullRegex, $options: "i" }}).select("word_content");
    const engineSearch = searchByScore(word, searchResult.map(e => e.word_content))
    debugConsole("==engineSearch==", engineSearch)
    const result = []

    for (let i = 0; i < engineSearch.length; i += 1) {
        const arrResultByScore = engineSearch[i];
        if (arrResultByScore != null && arrResultByScore.length) {
            arrResultByScore.forEach(ele => {
                result.push(ele);
            })
        }
    }

    return result;
}

const getRegexStrSearch = (word) => {
    const toArrCharacter = word.split("");
    const wordAfterSlice = mainRegex(toArrCharacter);
    return {
        fullRegex: wordAfterSlice,
    }
}

module.exports = {
    searchByScore,
    getRegexStrSearch,
    searchProcess
}