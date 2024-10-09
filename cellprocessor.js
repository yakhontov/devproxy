const { opencellidDb } = require("./database")
const getCellCoord = require("./opencellid_org")

// Запросить в БД данные по соте, при отсутствии таковых запросить данные в сервисе, сохранить результат в БД и вернуть из функции
//{mcc, mnc, lac, cellid, hash, rssi, dbm}
async function processCell(cell) {
    const cellFromDb = await opencellidDb.readObjByHash(cell._id)
    // Мы Будем использовать данные из БД если:
    // -они есть
    // -они без координат, и при этом моложе 30 дней
    // -они с коорлинатами и при этом моложе 180 дней
    // В остальных случаях запрашиваем сервис
    console.log("Original data:", cell)
    if (
        cellFromDb?.opencellid?.timestamp && // Если данные по данной соте в БД нашлись и в этих данных есть запись о времени получения от сервиса
        (Date.now() - cellFromDb.opencellid.timestamp < 30 * 86400000 || // И эти данные были получены от сервиса менее 30 дней назад
            (cellFromDb.opencellid.lat && // Или если сохраненые данные c координатами
                cellFromDb.opencellid.lon &&
                Date.now() - cellFromDb.opencellid.timestamp < 180 * 86400000)) // И они были получены менее 180 дней назад
    ) {
        // Данные в БД есть, значит будем использовать именно их
        console.log("Got DB data:", cellFromDb)
        // cellFromDb.rssi = cell.rssi
        // cellFromDb.dbm = cell.dbm
        return cellFromDb
    } else {
        // Данных в БД нет, или они старые. Запрашиваем у сервиса
        const svcResp = await getCellCoord(cell)
        if (svcResp) {
            // Получили ответ от сервиса. Переписываем данные в объект и сохраняем его в БД
            console.log("Got data from svc:", svcResp)
            cell.opencellid = svcResp
            opencellidDb.writeObj(cell)
            return cell
        } else {
            // Нет ответа от сервиса. Выдаем те же данные, что и получили
            console.log("No scv resp")
            return cell
        }
    }
}

module.exports = processCell
