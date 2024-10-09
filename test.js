const obj1 = { a: 1, b: "b" }
const obj2 = { a: "dfg", c: "mnvb" }

//const obj3 = { ...obj1, ...obj2 }
//const obj3 = { ({a,b})=obj1 }

console.log(...obj1)

// for (const cellToDbCheck of cellsListToDbCheck.map()) {
//     try {

//     } catch (error) {
//         console.error(error)
//     }
// }

//    for await (const num of foo())

// Перебираем все девайсовые пакеты, которые пришли от сервера
// packetsArray.forEach(async (packetObj) => {
//     try {
//         const ucfsArray = ucfscanStrToArray(packetObj.ucfscan) // Преобразуем строку с данными ucfscan в соответствующий массив
//         if (!ucfsArray.length) return // Если нужных данных нет, то переходим к обработке следующего пакета
//         // Запустим одновременно запросы ко всем БД
//         const promicesDb = ucfsArray.map((cell) => opencellidDb.readObjByHash(cell.hash)) // Промисы для чтения БД
//         const ucfsObj = { cells: ucfsArray, hash: hash(ucfsArray) } // Объект для поиска в БД списка сот
//         promicesDb.push(unwiredlabsDb.readObjByHash(ucfsObj.hash)) // Запрашиваем в БД список сот
//         const dbRes = await Promise.all(promicesDb) // Ожидаем окончание выполнения всех запросов
//         const unwiredlabsRes = dbRes.pop() // Забираем из массива ответ на список. В массиве остаются только ответы на отдельные соты

//         console.log("+++ DB results begin +++")
//         // console.log("unwiredlabsRes:", unwiredlabsRes)
//         // console.log("opencellidRes", dbRes)
//         console.log("--- DB results end ---")

//         const promicesSvc = ucfsArray.map((cell, index) => (dbRes[index] ? null : getCellCoord(cell))) // Если для индекса был ответ из БД, то от
//         // TODO: Стоило бы сгруппировать все соты и все массивы сот (отсечь одинаковые) и запросить их в сервисах одновременно
//         promicesSvc.push(getEstimatedCoord(ucfsArray)) // Запрашиваем в БД список сот
//         const dbSvc = await Promise.all(promicesSvc) // Одидаем окончание выполнения всех запросов

//         console.log("+++ SVC results begin +++")
//         console.log("unwiredlabsRes:", dbSvc.pop())
//         console.log("opencellidRes:", dbSvc)
//         console.log("--- SVC results end ---")

//         // const unwiredlabsRes = dbRes.pop() // Забираем из массива ответ на список. В массиве остаются только ответы на отдельные соты
//     } catch (error) {
//         console.error(error)
//     }
// })
