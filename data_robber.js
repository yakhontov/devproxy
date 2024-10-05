const axios = require("axios").default

const options = {
    method: "POST",
    url: "http://3.95.124.47/twiliosim/gprsconsole_test.class.php",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: { loadtable: "1", sim: "21_81", limit: "10" },
}
// datefrom: "", // 2024-10-20 21:01:44
// dateto: "",

const beginStr = 'class="col-sm-12">{"i":"' // Эта строка является началом пакета

async function robData(req) {
    // Тут очень много может пойти не так. Постараемся не положить процесс эксепшеном
    try {
        const res = await axios.request(options) // Прикидываемя шлангом и просим у сервера данные
        const body = res.data // payload ответа сервера
        //console.log("body:", body)
        // Я охреневаю, дорогая редакция, от структуры этого пакета. Пожалуй, пытаться парсить его я не буду
        // Попытаемя найти начало каждого пакета поиском 'class="col-sm-12">{"i":"'. Дальше до закрывающей фигурной скобки тело пакета.
        // Только количество пакетов почему-то вдвое больше запрашиваемого. Вероятно, они дублируются
        let packetsStr = "[" // В этой строке будем составлять json-массив с пакетами девайса
        let begin = body.indexOf(beginStr) // Ищем в этом месиве начало первого пакета
        // Повторяем эту процедуру пока не сможем найти начало очередного пакета. Значит пакеты закончились
        while (begin > -1) {
            begin += 18 // Данные самого пакета "{" начинаются только с 18 символа после искомой строки. Добавляем 18
            const end = body.indexOf("}", begin) // Начиная с начала пакета ищем его конец "}"
            if (end < 0) break // Если конец пакета не нашли, то выходим из цикла
            const packet = body.substring(begin, end + 1) // Вырезаем кусок от начала до конца. это будет очередной пакет
            packetsStr += (packetsStr.length > 1 ? "," : "") + packet // Добавляем этот пакет в общий список, одновременно формируя json-массив
            begin = body.indexOf(beginStr, end) // Ищем начало следующего пакета
        }
        packetsStr += "]" // Завершаем формирование json-массива
        return packetsStr // После ограбления нужно быстро свалить
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
