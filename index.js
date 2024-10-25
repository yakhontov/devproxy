const express = require("express")
var cors = require("cors")
const processRequest = require("./request_processor")

const websvr = express()

websvr.use(cors())

websvr.use(express.json()) // Без этой бабуйни не получается прочитать payload запроса

websvr.put("/", async (req, res, next) => {
    // Проверяем наличие хэдера content-type:application/json
    if (req.headers["content-type"]?.includes("application/json")) {
        //console.log("get application/json request.body:", req.body)
        res.send(await processRequest(req.body)) // Обрабатываем запрос от браузера и возвращаем браузеру запрошенные данные
    } else next() // Если нужного хэдера не обнаружили, то выходим передаем управление другим обработчикам websvr
})

websvr.use(express.static("./build")) // Отправляем статические html и прочую лабуду из ./build

websvr.listen(80, () => {
    console.log("Web server started")
})
