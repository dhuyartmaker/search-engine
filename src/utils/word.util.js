const WordModel = require("../models/word.model");

const ruleScore = (word) => ({
    0: "^" + word + "$", // exact match with word
    1: `(^${word}.{1}$)|(^.{1}${word}$)`, // can have prefix or post fix
    2: `(^.{1}${word}.{1}$)|(^${word}.{2,3}$)|(^.{2,3}${word}$)`, // have both of pre-post fix 
    3: `^.{2,4}${word}.{2,4}$`, // more 
    4: ".{1,2}" + `${word}`.split("").join(".{1,2}") + ".{1,2}", // start split to add space between word
});

const searchByScore = (word = "", datas = []) => {
    console.log("==datas==", datas.length, word)
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

const searchProcess = async (word) => {
    let result = [];
    let tempWord = word;
    do {
        const { fullRegex } = getRegexStrSearch(tempWord)
        const continousSearch = await analystSearchEngine(fullRegex, tempWord);
        console.log("==continousSearch==", continousSearch)
        result = result.concat(continousSearch)
        // Check duplicate
        const setCheckDuplicate = new Set(result)
        result = Array.from(setCheckDuplicate)
        tempWord = tempWord.slice(0, tempWord.length - 1);
    } while (result.length < 3)

    const sliceResult = result.length <= 3 ? result : result.slice(0, 3);
    const remainWord = 3 - sliceResult.length;
    if (remainWord != 0) {
        const findRandomWord = (await WordModel.aggregate([{ $sample: { size: remainWord }}])).map(e => e.word_content)
        console.log("==findRandomWord==", findRandomWord)
        sliceResult.push(...findRandomWord)
    }

    return sliceResult
}

const analystSearchEngine = async (fullRegex, word) => {
    const searchResult = await WordModel.find({ is_active: true, word_content: { $regex: fullRegex, $options: "i" }}).select("word_content");
    const engineSearch = searchByScore(word, searchResult.map(e => e.word_content))
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
    const arrWord = word.split("");
    const wordAfterSlice = ".*" + arrWord.join(".*") + ".*";
    return {
        fullRegex: wordAfterSlice,
    }
}

module.exports = {
    searchByScore,
    getRegexStrSearch,
    searchProcess
}