const axios = require("axios").default

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

// "ucfscan":"<AcT>,<arfcn>,<arfcn_band>,<BSIC>, <MCC>,<MNC>,<LAC>,<CI>,<cell_barred>,<RxLev>,<grps_supported>"
// prettier-ignore
const testData = [
    [0,870,3,24, 255, 1, parseInt('872A', 16), parseInt('E907', 16),0,49,1],
    [0,874,3,31, 255, 1, parseInt('872A', 16), 0,0,30,1],
    [0,85,0,50,  255, 1, parseInt('872A', 16), parseInt('E904', 16),0,28,1],
    [0,87,0,60,  255, 1, parseInt('872A', 16), 0,0,21,1],
    [0,828,3,36, 255, 3, parseInt('84D2', 16), 0,0,20,1],
    [0,865,3,17, 255, 1, parseInt('872A', 16), 0,0,19,1],
    [0,867,3,21, 255, 1, parseInt('872A', 16), parseInt('3EAD', 16),0,18,1],
    [0,989,0,41, 255, 3, parseInt('84D2', 16), parseInt('85E9', 16),0,17,1]
]

// Преобразование уровня сигнала из RSSI в dBm
// 0: less than -110 dBm
// 1..62: from -110 to less than -48 dBm with 1 dBm steps
// 63: -48 dBm or greater
function rssiToDbm(rssi) {
    if (rssi < 1) return -109
    else if (rssi > 62) return -48
    else return rssi - 111
}

// Закидываем сюда массив массивов данных, который возвращает команда ucfscan
// На выходе получаем ответ сервиса в котором предполагаемая координата, либо ошибка, либо undefined, если произошла ошибка подключения
// {
//     status: 'ok',
//     balance: 95,
//     lat: 39.574418,
//     lon: -105.003244,
//     accuracy: 900,
//     address: 'West Mineral Avenue, Littleton, Arapahoe County, Colorado, 80120, USA'
// }
async function getEstimatedCoord(cells) {
    const options = {
        method: "POST",
        url: "https://us1.unwiredlabs.com/v2/process",
        data: {
            token: "pk.4bd7ca83b4c89953ca137c59db0b8657",
            radio: "gsm",
            cells: [],
            address: 1,
        },
    }
    try {
        cells.forEach((cell) => {
            // Переписываем данные из входных параметров в запрос
            if (cell.length >= 10) {
                options.data.cells.push({
                    mcc: cell[4],
                    mnc: cell[5],
                    lac: cell[6],
                    cid: cell[7],
                    signal: rssiToDbm(cell[9]),
                })
            }
        })
        console.log("unwiredlabs.com resuest data:", options.data)
        const res = await axios.request(options) // res.data возвращается готовый объект
        console.log("unwiredlabs.com responce data:", res.data)
        if (res.data.lat && res.data.lon) return res.data // Возвращаем объект только если в нем вернулись нужные данные
        console.log("unwiredlabs.com error")
    } catch (error) {
        console.error(error)
    }
}

getEstimatedCoord(testData)

module.exports = getEstimatedCoord
