const hash = require("object-hash")
const { unwiredlabsDb, opencellidDb } = require("./database")
const robData = require("./data_robber")
const processCell = require("./cellprocessor")
const processMulticells = require("./multicellprocessor")

// Получает объект от браузера {devicename, datefrom, dateto, limit}
// Возвращает объект (массив), который нужно отправить серверу. Каждый элемент массива содержит тело пакета и данные от каждого сервиса геолокации для данного пакета
async function processRequest(browserReq) {
    const packetsArray = await robData(browserReq) // Получаем данные от сервера iowise
    //console.log(packetsArray)
    if (!packetsArray) return []

    const cellsList = {} // Список сот из всех пакетов, которые нужно проверить в базе данных. Будем сохранять внутри объекта, чтобы соты не повторялись. Ключем будет хеш параметров
    const multicellsList = {} // Список массивов сот из всех пакетов, которые нужно проверить в базе данных. Будем сохранять внутри объекта, чтобы массивы не повторялись. Ключем будет хеш массива

    for (const packetObj of packetsArray) {
        // Перебираем все девайсовые пакеты, которые пришли от сервера
        try {
            const multicellsParams = ucfscanStrToCellsArray(packetObj.ucfscan) // Из данного пакета преобразуем строку с данными ucfscan в соответствующий массив c параметрами для каждой соты
            if (!multicellsParams.length) continue // Если нужных данных нет, то переходим к обработке следующего пакета
            const multicellsObj = { cells: multicellsParams, _id: hash(multicellsParams) } // Объект для поиска в БД целого списка сот. В данном случае в хєш включен уровень сигнала
            packetObj.nearestcells = multicellsObj
            multicellsList[multicellsObj._id] = multicellsObj // Добавляем мултисотовый объект в список мультисотовых объектов. По этим объектам будет осуществлен поиск в БД и запрос к сервису
            for (const cell of multicellsParams) cellsList[cell._id] = cell // Добавляем отдельные сотовые объекты к списку сот. По этим объектам будет осуществлен поиск в БД и запрос к сервису
        } catch (error) {
            console.error(error)
        }
    }
    // К этому моменту сформировано два списка, элементы которых нужно проверить на наличие в БД: cellsList, multicellsList
    if (!cellsList.length && !multicellsList) return [] // Если списки пустые, то нет смысла продолжать дальше

    // Promise.all(Object.values(multicellsList).map((multicell) => processMulticells(multicell)))
    // Promise.all(Object.values(cellsList).map((cell) => processCell(cell)))

    const promRes = await Promise.all(
        Object.values(multicellsList)
            .map((multicell) => processMulticells(multicell))
            .concat(Object.values(cellsList).map((cell) => processCell(cell)))
    )

    for (const packetObj of packetsArray) {
        // Повторно перебираем все девайсовые пакеты, которые пришли от сервера, чтобы присвоить соответствующим пакетам найденные координаты
        if (!packetObj.nearestcells) continue
        //console.log("packetObj before:", JSON.stringify(packetObj, null, "\t"))
        const unwiredlabsData = promRes.find((element) => element._id === packetObj.nearestcells._id) // Находим среди массива обработанных эдементов элемент с нужным хэшем
        if (unwiredlabsData) packetObj.nearestcells.unwiredlabs = unwiredlabsData.unwiredlabs
        for (const cell of packetObj.nearestcells.cells) {
            // Перебираем соты из массива сот пакета
            const opencellidData = promRes.find((element) => element._id === cell._id) // Находим среди массива обработанных эдементов элемент с нужным хэшем
            if (!opencellidData) continue
            const { rssi, dbm } = cell
            Object.assign(cell, opencellidData, { rssi, dbm })
        }
        //console.log("packetObj after:", JSON.stringify(packetObj, null, "\t"))
    }

    // console.log("multicellsList:", multicellsList)
    // console.log("cellsList:", cellsList)
    // console.log("res:", res)
    console.log("packetsArray:", JSON.stringify(packetsArray, null, "\t"))
    return packetsArray
}

// "ucfscan":"<AcT>,<arfcn>,<arfcn_band>,<BSIC>, <MCC>,<MNC>,<LAC>,<CI>,<cell_barred>,<RxLev>,<grps_supported>"
// ucfscan: '0,1001,0,48,255,03,7DA4,49,0,46,1|0,866,3,54,255,01,C95,56B5,0,32,1|0,812,3,35,255,03,7DA4,0,0,49,1|0,885,3,19,255,01,C95,0,0,25,1|0,593,3,35,255,03,7DA4,2333,0,49,1|0,839,3,34,255,03,7DA4,1F87,0,49,1|0,872,3,8,255,01,C95,63A3,0,49,1|0,86,0,53,255,01,C95,0,0,31,1|',
// Дробит строку ucfscanStr на отдельные соты и их праметры и возвращает данные в виде массива сот с объектами-списками парметров [{mcc,mnc,lac,cellid,rssi,dbm},{...}]
function ucfscanStrToCellsArray(ucfscanStr) {
    if (!ucfscanStr) return []
    const cellsParamsArray = []
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
                cellParamsObj._id = hash(cellParamsObj) // До подсчета хэша сохраним только постоянные параметры, без показателей уровня сигнала
                cellParamsObj.rssi = parseInt(cellParamsParts[9])
                cellParamsObj.dbm = rssiToDbm(cellParamsParts[9])
                if (cellParamsObj.mcc || cellParamsObj.mnc || cellParamsObj.lac || cellParamsObj.cellid) cellsParamsArray.push(cellParamsObj)
            } catch (error) {
                console.error(error)
            }
        }
    })
    return cellsParamsArray
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

async function processData(cells) {
    if (cells.cells) {
        return await processCellsArray(cells)
    } else {
        return await processCell(cells)
    }
}

async function test() {
    await processRequest({ devicename: "21_73", limit: 500, datefrom: "", dateto: "" })
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
