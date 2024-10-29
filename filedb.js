const { mkdirSync } = require("fs")
const { readFile, writeFile, mkdir } = require("fs/promises")

class FileDb {
    constructor(tableName) {
        this.path = "./db/" + tableName + "/"
        try {
            mkdirSync(this.path)
        } catch (error) {}
    }

    async readObjByHash(hash) {
        try {
            return JSON.parse(await readFile(this.path + hash + ".json", "utf8"))
        } catch (error) {}
        return
    }

    async writeObj(obj) {
        try {
            await writeFile(this.path + obj._id + ".json", JSON.stringify(obj), "utf8")
        } catch (error) {}
    }
}

const unwiredlabsDb = new FileDb("unwiredlabs")
const opencellidDb = new FileDb("opencellid")

async function testDb() {
    const res = await unwiredlabsDb.writeObj({ a: 1, b: "2", _id: "123" })
    console.log(res)

    const res2 = await unwiredlabsDb.readObjByHash("123")
    console.log(res2)
}

//testDb()

module.exports = { unwiredlabsDb, opencellidDb }
