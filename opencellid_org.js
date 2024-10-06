const axios = require("axios").default

// prettier-ignore
const testData = [0,85,0,50,  255, 3, 32164, 8073,0,28,1]
// prettier-ignore
const testArray = [
    [0,870,3,24, 255, 1, parseInt('872A', 16), parseInt('E907', 16),0,49,1],
    [0,874,3,31, 255, 1, parseInt('872A', 16), 0,0,30,1],
    [0,85,0,50,  255, 1, parseInt('872A', 16), parseInt('E904', 16),0,28,1],
    [0,87,0,60,  255, 1, parseInt('872A', 16), 0,0,21,1],
    [0,85, 0,50, 255, 3, 32164,                8073,                0,28,1],
    [0,828,3,36, 255, 3, parseInt('84D2', 16), 0,0,20,1],
    [0,865,3,17, 255, 1, parseInt('872A', 16), 0,0,19,1],
    [0,867,3,21, 255, 1, parseInt('872A', 16), parseInt('3EAD', 16),0,18,1],
    [0,989,0,41, 255, 3, parseInt('84D2', 16), parseInt('85E9', 16),0,17,1],
    [0,989,0,41, 255, 3, 34002,                34281,               0,17,1],
]

// https://www.opencellid.org
// https://wiki.opencellid.org/wiki/API
// working example: opencellid.org/cell/get?key=pk.21c1c8f4084e364b6b1819d224e30dcd&mcc=255&mnc=3&lac=32164&cellid=8073&format=json
// Передаем массив от команды "ucfscan":"<AcT>,<arfcn>,<arfcn_band>,<BSIC>, <MCC>,<MNC>,<LAC>,<CI>,<cell_barred>,<RxLev>,<grps_supported>"
// example: [0,867,3,21, 255, 1, parseInt('872A', 16), parseInt('3EAD', 16),0,18,1]
// Возвращается объект с координатами вышки либо ошибка/undefined
// {
//     lat: 49.470727,
//     lon: 32.068264,
//     mcc: 255,
//     mnc: 3,
//     lac: 32164,
//     cellid: 8073,
//     averageSignalStrength: 0,
//     range: 3955,
//     samples: 1,
//     changeable: 1,
//     radio: '',
//     rnc: 0,
//     cid: 0,
//     tac: 0,
//     sid: 0,
//     nid: 0,
//     bid: 0,
//     message: null
// }
async function getCellCoord(cell) {
    const options = {
        method: "GET",
        url: "http://opencellid.org/cell/get",
        params: {
            key: "pk.21c1c8f4084e364b6b1819d224e30dcd",
            format: "json",
        },
    }
    try {
        if (cell.length < 8) return
        options.params.mcc = cell[4]
        options.params.mnc = cell[5]
        options.params.lac = cell[6]
        options.params.cellid = cell[7]
        //console.log("opencellid.org request params:", options.params)
        const res = await axios.request(options) // res.data возвращается готовый объект
        //console.log("opencellid.org responce data:", res.data)
        if (res.data.lat && res.data.lon) return res.data // Возвращаем объект только если в нем вернулись нужные данные
        //console.log("opencellid.org error")
    } catch (error) {
        console.error(error)
    }
}

// Принимает массив массивов от команды "ucfscan":"<AcT>,<arfcn>,<arfcn_band>,<BSIC>, <MCC>,<MNC>,<LAC>,<CI>,<cell_barred>,<RxLev>,<grps_supported>"
// example: [[0,867,3,21, 255, 1, parseInt('872A', 16), parseInt('3EAD', 16),0,18,1],
//     [0,989,0,41, 255, 3, parseInt('84D2', 16), parseInt('85E9', 16),0,17,1]]
// Возвраащет массив ответов по тем точкам, по которым есть даные. Если никаких данных нет, то возвращает пустой массив
async function getCellsCoord(cells) {
    const promices = []
    cells.forEach((cell) => {
        promices.push(getCellCoord(cell))
    })
    const results = await Promise.all(promices)
    console.log("results:", results)
    const ret = []
    results.forEach((r) => {
        if (r) ret.push(r)
    })
    // console.log("ret:", ret)
    return ret
}

//getCellCoord(testData)
//getCellsCoord(testArray)

module.exports = getCellCoord
