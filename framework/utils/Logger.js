import fs from 'fs';

export const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};


export class Logger {
    fileName;
    filePath;
    logLevel;

    constructor(fileName) {
        this.fileName = fileName + ".txt";
        this.filePath = './framework/logs/';
        this.logLevel = LogLevel.INFO;
    }

    setLogLevel(logLevel) {
        this.logLevel = logLevel;
    }

    async log(logLevel, message) {
        const path = this.filePath + this.fileName;
        const logMessage = `${logLevel}: \t ${message} \n`;
        let waitForLogToBeWritten = "";

        switch (logLevel) {
            case LogLevel.WARN:
                if (this.logLevel == logLevel) {
                    console.warn(`WARN: \t${message}`);
                    waitForLogToBeWritten = await this.writeToFile(path, logMessage);
                }
                break;
            case LogLevel.ERROR:
                console.error(`ERROR: \t${message}`);
                waitForLogToBeWritten = await this.writeToFile(path, logMessage);
                break;
            case LogLevel.INFO:
                console.info(`${message}`);
                waitForLogToBeWritten = await this.writeToFile(path, logMessage);
                break;
            case LogLevel.DEBUG:
                if (this.logLevel == logLevel) {
                    console.debug(`DEBUG: \t${message}`);
                    waitForLogToBeWritten = await this.writeToFile(path, logMessage);
                }
                break;
            default:
                console.log(`UNKNOWN LEVEL: \t${message}`);
                waitForLogToBeWritten = await this.writeToFile(path, logMessage);
        }       
    }    

    async writeToFile(path, message) {
        await fs.appendFile(path, message, (err) => {
            if (err) {
                console.error('ERROR: Error writing file:', err);
            };
        });
    }


    async keepScore() {

    }

}