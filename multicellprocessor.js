const { unwiredlabsDb } = require("./database")
const getEstimatedCoord = require("./unwiredlabs_com")

// Запросить в БД данные по массиву сот, при отсутствии таковых запросить данные в сервисе, сохранить результат в БД и вернуть из функции
// { cells: ucfsArray, hash: hash(cellsArray) }
async function processMulticells(multicells) {
    const multicellsFromDb = await unwiredlabsDb.readObjByHash(multicells._id)
    // Мы Будем использовать данные из БД если:
    // -они есть
    // -они без координат, и при этом моложе 30 дней
    // -они с коорлинатами и при этом моложе 180 дней
    // В остальных случаях запрашиваем сервис
    // console.log("Original data:", multicells)
    // console.log("Db resp:", multicellsFromDb)
    if (
        multicellsFromDb?.unwiredlabs?.timestamp && // Если данные по данной соте в БД нашлись и в этих данных есть запись о времени получения от сервиса
        (Date.now() - multicellsFromDb.unwiredlabs.timestamp < 30 * 86400000 || // И эти данные были получены от сервиса менее 30 дней назад
            (multicellsFromDb.unwiredlabs.lat && // Или если сохраненые данные c координатами
                multicellsFromDb.unwiredlabs.lon &&
                Date.now() - multicellsFromDb.unwiredlabs.timestamp < 180 * 86400000)) // И они были получены менее 180 дней назад
    ) {
        // Данные в БД есть, значит будем использовать именно их
        // console.log("Got DB data:", multicellsFromDb)
        return multicellsFromDb
    } else {
        // Данных в БД нет, или они старые. Запрашиваем у сервиса
        const svcResp = await getEstimatedCoord(multicells)
        if (svcResp) {
            // Получили ответ от сервиса. Переписываем данные в объект и сохраняем его в БД
            // console.log("Got data from svc:", svcResp)
            unwiredlabsDb.writeObj(svcResp)
            return svcResp
        } else {
            // Нет ответа от сервиса. Выдаем те же данные, что и получили в качестве аргумента
            // console.log("No scv resp")
            return multicells
        }
    }
}

module.exports = processMulticells
