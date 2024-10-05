const axios = require("axios").default

const options = {
    method: "GET",
    url: "http://opencellid.org/cell/get",
    params: {
        key: "pk.21c1c8f4084e364b6b1819d224e30dcd",
        mcc: "255",
        mnc: "3",
        lac: "32164",
        cellid: "8073",
        format: "json",
    },
}

// https://www.opencellid.org
// https://wiki.opencellid.org/wiki/API
// working example: opencellid.org/cell/get?key=pk.21c1c8f4084e364b6b1819d224e30dcd&mcc=255&mnc=3&lac=32164&cellid=8073&format=json
async function getCellCoord() {
    try {
        const res = await axios.request(options) // res.data возвращается готовый объект
        console.log("body:", res.data)
        return res.data
    } catch (error) {
        console.error(error)
    }
}

getCellCoord()

module.exports = getCellCoord
