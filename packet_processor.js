const qs = require("querystring")
const scanf = require("scanf")
const db = require("./database")

// Получает пакет (не распарсенную строку) от устройства
async function processPacket(packetStr, sendBackToDevice) {
    packet = qs.parse(packetStr) // Вроде, не нашел, чтобы этот метод бросал исключение. Будет сюрпризом. Возвращает объект с данными девайса
    if (
        packet.i && // Это обязательный и не пустой параметр
        typeof packet.i === "string" && // Эта проверка скорее всего не нужна, там все параметры - строки, но пускай будет
        packet.i.length <= 25 && // Длинее 25 даже ICCID быть не может, да и в колонке БД отводится 25 символов
        packet.i.match(/^\d+$/)
    ) {
        // Проверка на содержание в ICCID только цифр. Понятия не имею как это работает, какое-то чернокнижное regex-заклинание
        // Тут у нас есть пакет packet с корректным ICCID (packet.i)
        //try // Может быть когда-нибудь
        let cmdStr = "OK" // В любом случае, раз мы получили корректный пакет от девайса, отправим "OK", чтобы девайс и автор его прошивки, т.е. я, не страдали
        const command = await db.readDeviceCommand(packet.i) // Запрашиваем очередную команду для девайса в БД. Раньше тут было кэширование команд. Но то я психанул. Если все-же понадобится, то в репозитории от 20.11.2024
        if (command && command.text && command.text.length) {
            // Если команда пришла
            cmdStr = command.text // Поскольку команду мы какую-то получили, вместо стандартного "ОК" будем отправлять текст полученной команды
            packet.responceCommand = command // Добавляем для сохранения в пакет команду, которую мы отправили девайсу
            db.removeDeviceCommand(command._id.toString()) // Удаляем отправляемую команду из очереди команд
        }
        sendBackToDevice(cmdStr) // Отправляем девайсу ответ
        packet.responceText = cmdStr // Добавляем для сохранения в пакет текст, который мы отправили девайсу
        const packetId = await db.addDevicePacket(packet) // Сохраняем полученный пакет в БД и получаем id этой записи
        processCoordinates(packet.i, packetId, packet.с) // Парсим и сохраняем координаты из полученного пакета
    } else {
        // Пакет с некорректным ICCID
        sendBackToDevice("ERROR, incorrect ICCID") // Все равно отправим ответ клиенту, пускай не висит
        console.warn("Incorrect ICCID", packetStr)
    }
}

// Дробит строку с массивом коорлинат на отдельные элементы и записывает их в БД для девайса iccid
function processCoordinates(iccid, packetId, coordArrayStr) {
    if (!coordArrayStr) return
    const coordArray = []
    coordArrayStr.split("|").forEach((coordStr) => {
        // Разбиваем строку на отдельные подстроки, каждая из которых представляет координату с дополнительными параметрами (время, заряд, точность)
        // TODO: use scanf
        const elements = coordStr.split(",") // Разбиваем каждую подстроку на еще меньшие элементы (широта, долгота, время, точность, заряд)
        if (elements.length > 2) {
            // Как минимум должны быть 3 элемента - широта, долгота, время. Меньшее сохранять смысла нет
            coordArray.push({
                // Собираем обратно из отдельных элементов координату
                iccid: iccid,
                packetid: packetId,
                lat: parseFloat(elements[0]), // lat
                lon: parseFloat(elements[1]), // lon
                datetime: null, //parseFloat(elements[2]), // time
                acc: parseInt(elements[3]), // accuracy
                charge: parseFloat(elements[4]), // battery charge
            })
        }
    })
    db.addDeviceCoords(coordArray)
}

module.exports = processPacket
