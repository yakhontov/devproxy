const { createLogger, format, transports } = require("winston")

const logger = createLogger({
    //level: "info",
    //format: winston.format.json(),
    //format: combine(format.colorize(), format.simple()),
    //format: combine(format.simple(), timestamp(), prettyPrint()),
    //format: ,
    //format: format.combine(format.timestamp(), format.json()), // works
    format: format.combine(format.timestamp(), format.prettyPrint(), format.simple()),
    transports: [
        new transports.Console(), //format.simple()
        new transports.File({ filename: "error.log", level: "error" }),
        new transports.File({ filename: "combined.log" }),
    ],
})

// logger.log({
//     level: "info",
//     message: "Hello distributed log files!",
// })

// logger.info("Hello again distributed logs")
// logger.info({ str: "Hello again distributed logs" }.toString())
// logger.error("Some error")
