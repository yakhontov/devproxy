const { unwiredlabsDb } = require("./database")
const getEstimatedCoord = require("./unwiredlabs_com")

// Запросить в БД данные по массиву сот, при отсутствии таковых запросить данные в сервисе, сохранить результат в БД и вернуть из функции
// { cells: ucfsArray, hash: hash(cellsArray) }
async function processMulticells(multicells) {}

module.exports = processMulticells
