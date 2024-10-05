const axios = require("axios").default

const options = {
    method: "POST",
    url: "https://us1.unwiredlabs.com/v2/process",
    data: {
        token: "pk.4bd7ca83b4c89953ca137c59db0b8657",
        radio: "gsm",
        mcc: 310,
        mnc: 404,
        cells: [
            {
                lac: 7033,
                cid: 17811,
            },
            {
                lac: 7033,
                cid: 17812,
                signal: -60,
            },
            {
                lac: 7033,
                cid: 18513,
            },
            {
                lac: 7033,
                cid: 16383,
            },
            {
                lac: 7033,
                cid: 12812,
            },
            {
                lac: 7033,
                cid: 12811,
            },
        ],
        address: 1,
    },
}

// https://unwiredlabs.com
// https://unwiredlabs.com/docs
// pk.4bd7ca83b4c89953ca137c59db0b8657
//{
//     "token": "pk.4bd7ca83b4c89953ca137c59db0b8657",
//     "radio": "gsm",
//     "mcc": 310,
//     "mnc": 404,
//     "cells": [{
//         "lac": 7033,
//         "cid": 17811
//     }, {
//         "lac": 7033,
//         "cid": 17812,
//         "signal": -60
//     }, {
//         "lac": 7033,
//         "cid": 18513
//     }, {
//         "lac": 7033,
//         "cid": 16383
//     }, {
//         "lac": 7033,
//         "cid": 12812
//     }, {
//         "lac": 7033,
//         "cid": 12811
//     }],
//     "address": 1
// }
// working example:
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
