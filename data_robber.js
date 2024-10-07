const axios = require("axios").default

const beginStr = 'class="col-sm-12">{"i":"' // Эта строка является началом пакета
const beginDateStr = "<td>" // Эта строка является началом даты пакета
const endDateStr = '</td><td><div class="row"><div class="col-sm-12"><div class="col-sm-3"><div class="i">Server: <span class="bold">' // Этой строкой заканчивается дата пакета

async function robData({ devicename, limit, datefrom, dateto }) {
    const options = {
        method: "POST",
        url: "http://3.95.124.47/twiliosim/gprsconsole_test.class.php",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: { loadtable: "1", sim: devicename, limit: limit, datefrom: datefrom, dateto: dateto }, //, datefrom: dateFrom, dateto: dateTo
    }
    // Тут очень много может пойти не так. Постараемся не положить процесс эксепшеном
    try {
        const res = await axios.request(options) // Прикидываемся шлангом и просим у сервера данные
        const body = res.data // payload ответа сервера
        //console.log("body:", body)
        // Я охреневаю, дорогая редакция, от структуры этого пакета. Пожалуй, пытаться парсить его я не буду
        // Попытаемя найти начало каждого пакета поиском 'class="col-sm-12">{"i":"'. Дальше до закрывающей фигурной скобки тело пакета.
        // Только количество пакетов почему-то вдвое больше запрашиваемого. Вероятно, они дублируются
        let packetsStr = "[" // В этой строке будем составлять json-массив с пакетами девайса
        let begin = body.indexOf(beginStr) // Ищем в этом месиве начало первого пакета
        let end = 0
        // Повторяем эту процедуру пока не сможем найти начало очередного пакета. Значит пакеты закончились
        while (begin > -1) {
            const dateEnd = body.lastIndexOf(endDateStr, begin) // Дата находится перед пакетом. Ищем в обратном направлении конец даты отталкиваясь от начала пакета
            begin += 18 // Данные самого пакета "{" начинаются только с 18 символа после искомой строки. Добавляем 18
            end = body.indexOf("}", begin) // Начиная с начала пакета ищем его конец "}"
            let packet = body.substring(begin, end) // Вырезаем кусок от начала до конца. это будет тело текущего пакета
            if (end < 0) break // Если конец пакета не нашли, то выходим из цикла
            // Если конец даты обнаружен
            if (dateEnd > -1) {
                const dateBegin = body.lastIndexOf(beginDateStr, dateEnd) // Ищем начало даты в обратном направлении от конца
                // Если начало даты обнаружено
                if (dateBegin > -1) {
                    const packetDateTime = body.substring(dateBegin + beginDateStr.length, dateEnd)
                    //console.log("packetDateTime:", packetDateTime) // '10/06/2024 01:48:31'
                    packet += `,"serverdatetime":"${packetDateTime}"` // Добавляем серверную дату и время в пакет
                }
            }
            //console.log("packet:", packet)
            packetsStr = packetsStr.concat(packetsStr.length > 1 ? "," : "", packet, "}") // Добавляем этот пакет в общий список, одновременно формируя json-массив
            begin = body.indexOf(beginStr, end) // Ищем начало следующего пакета
        }
        packetsStr += "]" // Завершаем формирование json-массива
        //return packetsStr // После ограбления нужно быстро свалить
        //console.log("packetsStr:", packetsStr)
        const obj = JSON.parse(packetsStr)
        return obj
        console.log("object:", obj)
        s = JSON.stringify(obj)
        console.log("s:", s)
        return s
    } catch (error) {
        console.error(error)
        return []
    }
}

async function robbery() {
    const res = await robData({ devicename: "21_84", limit: 20, datefrom: "", dateto: "" })
    console.log(res)
}

//robbery()

module.exports = robData
