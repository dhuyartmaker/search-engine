const fs = require('fs');
const { Worker, isMainThread, parentPort } = require('worker_threads');
const dbInstance = require('./connectDb');
const WordModel = require('../src/models/word.model');

const argvs = process.argv;

const getSizeInBytes = obj => {
    let str = null;
    if (typeof obj === 'string') {
        // If obj is a string, then use it
        str = obj;
    } else {
        // Else, make obj into a string
        str = JSON.stringify(obj);
    }
    // Get the length of the Uint8Array
    const bytes = new TextEncoder().encode(str).length;
    return bytes;
};

async function main() {
    try {
        if (isMainThread) {
            await dbInstance.connect();
            const data = fs.readFileSync(`./src/corpus/${argvs[2]}`, {
                encoding: "utf-8"
            })
            const trimData = data.trim().replace(/[^a-zA-Z\s]|[\r]/g, "").replace(/\n/g, " ");
            const wordSplit = `${trimData}`.split(" ");
            console.log("Found ~", wordSplit.length, "words!")
            console.log("Insert to corpus.....", getSizeInBytes(wordSplit) / (1024 * 1024), "MB")
            const setDuplicate = new Set();
            console.time("start")
            const wordArray = Array.from(new Set(wordSplit))
            const arrPromise = [];

            for (let i = 0; i < wordArray.length; i += 1) {
                const word = wordArray[i].toLowerCase();
                if (!word || setDuplicate.has(word)) {
                    continue;
                }
                arrPromise.push(WordModel.findOne({ word_content: word, is_active: true }).then(async (data) => {
                    if (data) return;
                    await WordModel.create({ word_content: word, is_active: true });
                }))
                setDuplicate.add(word)
            }
            await Promise.all(arrPromise)

            console.timeEnd("start")
            console.log("Insert", arrPromise.length, "success!")
        }
        process.exit();
    } catch (error) {
        console.error(error);
        return;
    }
}

main()
