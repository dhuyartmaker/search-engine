const fs = require('fs');
const dbInstance = require('./connectDb');
const WordModel = require('../src/models/word.model');

const argvs = process.argv;

async function main() {
    try {
        await dbInstance.connect();
        const data = fs.readFileSync(`./src/corpus/${argvs[2]}`, {
            encoding: "utf-8"
        })
        const trimData = data.trim().replace(/[^a-zA-Z\s]|[\r]/g, "").replace(/\n/g, " ");
        const wordArray = `${trimData}`.split(" ");
        console.log("Found ~",wordArray.length, "words!")
        console.log("Insert to corpus.....")
        const setDuplicate = new Set();

        for (let i = 0; i < wordArray.length; i += 1) {
            const word = wordArray[i].toLowerCase();
            if (!word || setDuplicate.has(word)) {
                console.log("Found null || duplicate: ", word)
                continue;
            }
            const findExist = await WordModel.findOne({ word_content: word, is_active: true })
            if (findExist) continue;

            await WordModel.create({ word_content: word, is_active: true });
            setDuplicate.add(word)
        }

        console.log("Insert", setDuplicate.size, "success!")
        process.exit();
    } catch(error) {
        console.error(error);
        return;
    }
}

main()
