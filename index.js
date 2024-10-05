const express = require("express")
const robData = require("./data_robber")

const websvr = express()

websvr.use(express.json()) // Без этой бабуйни не получается прочитать payload запроса

websvr.get("/", async (req, res, next) => {
    // На GET запрос с хэдером content-type:application/json будем отправлять массив пакетов от девайса
    if (
        req.headers["content-type"] &&
        req.headers["content-type"].includes("application/json") // Проверяем наличие хэдера content-type:application/json
    ) {
        res.send(await robData(req.body)) // Попытаемся спиздить у сервера iowise немного живительных данных
    } else next() // Если нужного хэдера не обнаружили, то выходим передаем управление другим обработчикам websvr
})

websvr.use(express.static("./build")) // Отправляем статические html и прочую лабуду из ./build

websvr.listen(80, () => {
    console.log("Web server started")
})
