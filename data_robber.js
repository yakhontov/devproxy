var axios = require("axios").default

var options = {
    method: "POST",
    url: "http://3.95.124.47/twiliosim/gprsconsole_test.class.php",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: { loadtable: "1", sim: "21_81", limit: "10" },
}
// datefrom: "", // 2024-10-20 21:01:44
// dateto: "",

const beginStr = 'class="col-sm-12">{"i":"'
//           <div class="col-sm-12">{"i":"
async function robData(req) {
    try {
        const res = await axios.request(options)
        const body = res.data
        //console.log("body:", body)
        // Я охреневаю, дорогая редакция, от структуры этого пакета. Пожалуй, пытаться парсить его я не буду
        // Попытаемя найти начало каждого пакета поиском 'class="col-sm-12">{"i":"'. Дальше до закрывающей фигурной скобки тело пакета.
        // Только количество пакетов почему-то вдвое больше запрашиваемого. Вероятно, они дублируются
        let packetsStr = ""
        let begin = body.indexOf(beginStr)
        while (begin > -1) {
            begin += 18
            const end = body.indexOf("}", begin)
            if (end < 0) break
            const packet = body.substring(begin, end + 1)
            packetsStr += (packetsStr.length ? "," : "[") + packet
            begin = body.indexOf(beginStr, end)
        }
        packetsStr += "]"
        return packetsStr
        console.log("packetsStr:", packetsStr)
        const obj = JSON.parse(packetsStr)
        console.log("object:", obj)
        s = JSON.stringify(obj)
        console.log("s:", s)
        return s
    } catch (error) {
        console.error(error)
        return []
    }
}

module.exports = robData
