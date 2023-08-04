const fs = require('fs');
const dbInstance = require('./connectDb');
const WordModel = require('../src/models/word.model');

const argvs = process.argv;

// -------- Config ------------
let loopSize = 1000; // Insert 1000 words for a time
// ----------------------------

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
        await dbInstance.connect();
        const data = fs.readFileSync(`./src/corpus/${argvs[2]}`, {
            encoding: "utf-8"
        })
        const trimData = data.trim().replace(/[^a-zA-Z\s]|[\r]/g, "").replace(/\n/g, " ");
        const wordSplit = `${trimData}`.split(" ");
        const removeDup = new Set(wordSplit)
        console.log("Found ~", removeDup.size, "words!")
        console.log("Insert to corpus.....", getSizeInBytes(wordSplit) / (1024 * 1024), "MB")
        console.time("start")
        const wordArray = Array.from(removeDup)

        let count = 0;
        while (count < wordArray.length) {
            const arrPromise = [];
            console.log("Insert from", count, "to", loopSize + count)
            const chunkArrayWord = wordArray.slice(count, loopSize + count)
            for (let i = 0; i < chunkArrayWord.length; i += 1) {
                const word = chunkArrayWord[i].toLowerCase();
                if (!word) {
                    continue;
                }
                // Faster
                arrPromise.push(WordModel.findOne({ word_content: word, is_active: true }).then(async (data) => {
                    if (data) return;
                    await WordModel.create({ word_content: word, is_active: true });
                }))

                // BulkWrite - option
                // arrPromise.push({
                //     updateOne: {
                //         filter: { word_content: word },
                //         update: { $set: { word_content: word, is_active: true } },
                //         upsert: true // Nếu không có bản ghi nào phù hợp với điều kiện tìm kiếm, thì thêm mới một bản ghi
                //     }
                // })
            }
            await Promise.all(arrPromise)
            count += loopSize;
            console.log("Insert", arrPromise.length, "complete!")
        }

        console.timeEnd("start")
        process.exit();
    } catch (error) {
        console.error(error);
        return;
    }
}

main()
