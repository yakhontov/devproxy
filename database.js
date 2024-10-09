const { MongoClient, ObjectId } = require("mongodb")

const client = new MongoClient("mongodb://localhost:27017")
const DBNAME = "dev"

// https://metanit.com/nosql/mongodb/2.12.php
// Индексы позволяют упорядочить данные по определенному полю, что впоследствии ускорит поиск.
// Например, если мы в своем приложении или задаче, как правило, выполняем поиск по полю name,
// то мы можем индексировать коллекцию по этому полю.
// createIndex({"name" : 1})

class Db {
    constructor(mongoClient, tableName) {
        this.db = mongoClient.db(DBNAME).collection(tableName)
    }

    async readObjByHash(hash) {
        return await this.db.findOne({ _id: hash })
    }

    async writeObj(obj) {
        return await this.db.replaceOne({ _id: obj._id }, obj, { upsert: true })
    }
}

const unwiredlabsDb = new Db(client, "unwiredlabs")
const opencellidDb = new Db(client, "opencellid")

async function testDb() {
    const res = await unwiredlabsDb.writeObj({ a: 1, b: "2", hash: "123" })
    console.log(res)

    const res2 = await unwiredlabsDb.readObjByHash("123")
    console.log(res2)
}

//testDb()

module.exports = { unwiredlabsDb, opencellidDb }
