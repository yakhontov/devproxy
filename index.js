const express = require("express")
const robData = require("./data_robber")

const websvr = express()

websvr.use(express.json())

websvr.get("/", async (req, res, next) => {
    if (
        req.headers["content-type"] &&
        req.headers["content-type"].includes("application/json")
    ) {
        res.send(await robData(req.body))
    } else next()
})

websvr.use(express.static("./build"))

websvr.listen(80, () => {
    console.log("Web server started")
})
