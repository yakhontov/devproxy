const hash = require("object-hash")
const { unwiredlabsDb, opencellidDb } = require("./database")
const robData = require("./data_robber")

// Получает объект от браузера {devicename, datefrom, dateto, limit}
// Возвращает объект (массив), который нужно отправить серверу. Каждый элемент массива содержит тело пакета и данные от каждого сервиса геолокации для данного пакета
async function processRequest(browserReq) {
    const packetsArray = await robData(browserReq) // Получаем данные от сервера iowise
    if (!packetsArray) return []
    const res = []
    // Перебираем все девайсовые пакеты, которые пришли от сервера
    packetsArray.forEach(async (packetObj) => {
        const ucfsArray = ucfscanStrToArray(packetObj.ucfscan) // Преобразуем строку с данными ucfscan в соответствующий массив
        if (!ucfsArray.length) return // Если нужных данных нет, то переходим к обработке следующего пакета
        // Запустим одновременно запросы ко всем БД
        const promicesDb = ucfsArray.map((cell) => opencellidDb.readObjByHash(cell.hash)) // Промисы для чтения БД
        const ucfsObj = { cells: ucfsArray, hash: hash(ucfsArray) } // Объект для поиска в БД списка сот
        promicesDb.push(unwiredlabsDb.readObjByHash(ucfsObj.hash)) // Запрашиваем в БД список сот
        const dbRes = await Promise.all(promicesDb) // Одидаем окончание выполнения всех запросов
        const unwiredlabsRes = dbRes.pop() // Забираем из массива ответ на список. В массиве остаются только ответы на отдельные соты

        console.log(dbRes)
        console.log("unwiredlabsRes:", unwiredlabsRes)

        // const promicesSvc = ucfsArray.map((cell) => opencellidDb.readObjByHash(cell.hash)) // Промисы для чтения БД
        // const ucfsObj = { cells: ucfsArray, hash: hash(ucfsArray) } // Объект для поиска в БД списка сот
        // promicesDb.push(unwiredlabsDb.readObjByHash(ucfsObj.hash)) // Запрашиваем в БД список сот
        // const dbRes = await Promise.all(promicesDb) // Одидаем окончание выполнения всех запросов
        // const unwiredlabsRes = dbRes.pop() // Забираем из массива ответ на список. В массиве остаются только ответы на отдельные соты
    })
    return res
}

// "ucfscan":"<AcT>,<arfcn>,<arfcn_band>,<BSIC>, <MCC>,<MNC>,<LAC>,<CI>,<cell_barred>,<RxLev>,<grps_supported>"
// ucfscan: '0,1001,0,48,255,03,7DA4,49,0,46,1|0,866,3,54,255,01,C95,56B5,0,32,1|0,812,3,35,255,03,7DA4,0,0,49,1|0,885,3,19,255,01,C95,0,0,25,1|0,593,3,35,255,03,7DA4,2333,0,49,1|0,839,3,34,255,03,7DA4,1F87,0,49,1|0,872,3,8,255,01,C95,63A3,0,49,1|0,86,0,53,255,01,C95,0,0,31,1|',
// Дробит строку ucfscan на отдельные соты и их праметры и возвращает данные в виде массива сот с парметрами [{mcc,mnc,lac,cellid,rssi,dbm},{...}]
function ucfscanStrToArray(ucfscanStr) {
    if (!ucfscanStr) return []
    const cellParams = []
    ucfscanStr.split("|").forEach((cellParamsStr) => {
        cellParamsParts = cellParamsStr.split(",")
        if (cellParamsParts.length >= 10) {
            try {
                const cellParamsObj = {
                    mcc: parseInt(cellParamsParts[4]),
                    mnc: parseInt(cellParamsParts[5]),
                    lac: parseInt(cellParamsParts[6], 16),
                    cellid: parseInt(cellParamsParts[7], 16),
                }
                cellParamsObj.hash = hash(cellParamsObj) // До подсчета хэша сохраним только постоянные параметры, без показателей уровня сигнала
                cellParamsObj.rssi = parseInt(cellParamsParts[9])
                cellParamsObj.dbm = rssiToDbm(cellParamsParts[9])
                cellParams.push(cellParamsObj)
            } catch (error) {
                console.error(error)
            }
        }
    })
    return cellParams
}

// Преобразование уровня сигнала из RSSI в dBm
// 0: less than -110 dBm
// 1..62: from -110 to less than -48 dBm with 1 dBm steps
// 63: -48 dBm or greater
function rssiToDbm(rssi) {
    if (rssi < 1) return -109
    else if (rssi > 62) return -48
    else return rssi - 111
}

async function test() {
    await processRequest({ devicename: "21_81", limit: 20, datefrom: "", dateto: "" })
}

function test2() {
    console.log(
        convertUcfscan(
            "0,1001,0,48,255,03,7DA4,49,0,46,1|0,866,3,54,255,01,C95,56B5,0,32,1|0,812,3,35,255,03,7DA4,0,0,49,1|" +
                "0,885,3,19,255,01,C95,0,0,25,1|0,593,3,35,255,03,7DA4,2333,0,49,1|0,839,3,34,255,03,7DA4,1F87,0,49,1|" +
                "0,872,3,8,255,01,C95,63A3,0,49,1|0,86,0,53,255,01,C95,0,0,31,1|"
        )
    )
}

test()
//test2()

module.exports = processRequest
