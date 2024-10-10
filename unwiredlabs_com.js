const axios = require("axios").default
const scanf = require("scanf")

const TOKEN = "pk.4bd7ca83b4c89953ca137c59db0b8657"

// https://unwiredlabs.com
// https://unwiredlabs.com/docs
// key: pk.4bd7ca83b4c89953ca137c59db0b8657
// req example:
// {
//     token: "pk.4bd7ca83b4c89953ca137c59db0b8657",
//     radio: "gsm",
//     mcc: 310,
//     mnc: 404,
//     cells: [
//         { lac: 7033, cid: 17811 },
//         { lac: 7033, cid: 17812, signal: -60 },
//         { lac: 7033, cid: 18513 },
//         { lac: 7033, cid: 16383 },
//         { lac: 7033, cid: 12812 },
//         { lac: 7033, cid: 12811 },
//     ],
//     address: 1,
// }

// Преобразование уровня сигнала из RSSI в dBm
// 0: less than -110 dBm
// 1..62: from -110 to less than -48 dBm with 1 dBm steps
// 63: -48 dBm or greater
function rssiToDbm(rssi) {
    if (rssi < 1) return -109
    else if (rssi > 62) return -48
    else return rssi - 111
}

// Закидываем сюда объект { cells, _id }
// На выходе получаем этот же объект, к которому добавлен ответ сервиса котором предполагаемая координата { cells, _id, unwiredlabs }
// {
//     status: 'ok',
//     balance: 95,
//     lat: 39.574418,
//     lon: -105.003244,
//     accuracy: 900,
//     address: 'West Mineral Avenue, Littleton, Arapahoe County, Colorado, 80120, USA'
// }
async function getEstimatedCoord(multicellsObj) {
    try {
        const options = {
            method: "POST",
            url: "https://us1.unwiredlabs.com/v2/process",
            data: {
                token: TOKEN,
                radio: "gsm",
                address: 1,
                cells: multicellsObj.cells.map((cell) => {
                    return {
                        mcc: cell.mcc,
                        mnc: cell.mnc,
                        lac: cell.lac,
                        cid: cell.cellid,
                        signal: cell.dbm,
                    }
                }),
            },
        }
        //console.log("unwiredlabs.com resuest data:", options.data)
        const res = await axios.request(options) // res.data возвращается готовый объект
        res.data.timestamp = Date.now()
        //console.log("unwiredlabs.com responce data:", res.data)
        multicellsObj.unwiredlabs = res.data
        //console.log("unwiredlabs.com return:", multicellsObj)
        return multicellsObj
    } catch (error) {
        console.error(error)
    }
}

function rssiToDbm(rssi) {
    if (rssi < 1) return -109
    else if (rssi > 62) return -48
    else return rssi - 111
}

// getEstimatedCoord({
//     cells: [
//         { mcc: 255, mnc: 1, lac: parseInt("872A", 16), cellid: parseInt("E907", 16), dbm: rssiToDbm(49) },
//         { mcc: 255, mnc: 1, lac: parseInt("872A", 16), cellid: 0, dbm: rssiToDbm(30) },
//         { mcc: 255, mnc: 1, lac: parseInt("872A", 16), cellid: parseInt("E904", 16), dbm: rssiToDbm(28) },
//         { mcc: 255, mnc: 1, lac: parseInt("872A", 16), cellid: 0, dbm: rssiToDbm(21) },
//         { mcc: 255, mnc: 3, lac: parseInt("84D2", 16), cellid: 0, dbm: rssiToDbm(20) },
//         { mcc: 255, mnc: 1, lac: parseInt("872A", 16), cellid: 0, dbm: rssiToDbm(19) },
//         { mcc: 255, mnc: 1, lac: parseInt("872A", 16), cellid: parseInt("3EAD", 16), dbm: rssiToDbm(18) },
//         { mcc: 255, mnc: 3, lac: parseInt("84D2", 16), cellid: parseInt("85E9", 16), dbm: rssiToDbm(17) },
//     ],
// })

module.exports = getEstimatedCoord
