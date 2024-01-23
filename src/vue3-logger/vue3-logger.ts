import { LogLevels } from "./enum/log-levels";
import { ILogger } from "./interfaces/logger";
import { ILoggerOptions } from "./interfaces/logger-options";

class VueLogger implements ILogger {

    private errorMessage: string = "Provided options for vuejs-logger are not valid.";
    private logLevels: string[] = Object.keys(LogLevels).map((l) => l.toLowerCase());


    public install(Vue: any, options: ILoggerOptions) {
        options = Object.assign(this.getDefaultOptions(), options);

        if (this.isValidOptions(options, this.logLevels)) {
            Vue.$log = this.initLoggerInstance(options, this.logLevels);
            Vue.provide('nuxt3-vue3-logger', Vue.$log);
            Vue.config.globalProperties.$log = Vue.$log;
        } else {
            throw new Error(this.errorMessage);
        }
    }

    public isValidOptions(options: ILoggerOptions, logLevels: string[]): boolean {
        if (!(options.logLevel && typeof options.logLevel === "string" && logLevels.indexOf(options.logLevel) > -1)) {
            return false;
        }
        if (options.stringifyArguments && typeof options.stringifyArguments !== "boolean") {
            return false;
        }
        if (options.showLogLevel && typeof options.showLogLevel !== "boolean") {
            return false;
        }
        if (options.showConsoleColors && typeof options.showConsoleColors !== "boolean") {
            return false;
        }
        if (options.separator && (typeof options.separator !== "string" || (typeof options.separator === "string" && options.separator.length > 3))) {
            return false;
        }
        if (typeof options.isEnabled !== "boolean") {
            return false;
        }
        return !(options.showMethodName && typeof options.showMethodName !== "boolean");
    }

    private getMethodName(logger: any): string {
        let error = {} as any;
        try {
            throw new Error("");
        } catch (e) {
            error = e;
        }
        // IE9 does not have .stack property
        if (error.stack === undefined) {
            return "";
        }

        let stackTrace = error.stack.split("\n")[3];
        if (/ /.test(stackTrace)) {
            stackTrace = stackTrace.trim().split(" ")[1];
        }
        if (stackTrace && stackTrace.indexOf(".") > -1) {
            stackTrace = stackTrace.split(".")[1];
        }

        if (stackTrace.includes("vue?t=")) {
            if (logger.initialized && logger.methodName) {
                return logger.methodName
            }
        }
        return stackTrace;
    }

    private setMethodName(name: string, logger: any) {
        logger['methodName'] = name;
    }

    private initLoggerInstance(options: ILoggerOptions, logLevels: string[]) {
        const logger = {
            moduleName: 'unknow',
            initialized: false
        };
        logger['setMethodName'] = (name: string) => this.setMethodName(name, logger)
        logger['init'] = (name?: string) => {
            const initLogger = this.initLoggerInstance(options, logLevels);
            initLogger.initialized = true;
            if (name) { initLogger.moduleName = name }
            return initLogger;
        }
        logLevels.forEach((logLevel) => {
            if (logLevels.indexOf(logLevel) >= logLevels.indexOf(options.logLevel) && options.isEnabled) {
                logger[logLevel] = (...args) => {
                    const methodName = this.getMethodName(logger);
                    const methodNamePrefix = options.showMethodName ? methodName + ` ${options.separator} ` : "";
                    const moduleName = logger.moduleName ? logger.moduleName + ` ${options.separator} ` : ""
                    const logLevelPrefix = options.showLogLevel ? logLevel + ` ${options.separator} ` : "";
                    const formattedArguments = options.stringifyArguments ? args.map((a) => JSON.stringify(a)) : args;
                    const logMessage = `${moduleName}${logLevelPrefix}${methodNamePrefix}`;
                    this.printLogMessage(logLevel, logMessage, options.showConsoleColors, formattedArguments);
                    return `${logMessage} ${formattedArguments.toString()}`;
                };
            } else {
                logger[logLevel] = () => undefined;
            }
        },
        );
        return logger;
    }

    private printLogMessage(logLevel: string, logMessage: string, showConsoleColors: boolean, formattedArguments: any) {
        if (showConsoleColors && (logLevel === "warn" || logLevel === "error" || logLevel === "fatal")) {
            console[logLevel === "fatal" ? "error" : logLevel](logMessage, ...formattedArguments);
        } else {
            console.log(logMessage, ...formattedArguments);
        }
    }

    private getDefaultOptions(): ILoggerOptions {
        return {
            isEnabled: true,
            logLevel: LogLevels.DEBUG,
            separator: "|",
            showConsoleColors: false,
            showLogLevel: false,
            showMethodName: false,
            stringifyArguments: false,
        };
    }
}

export default new VueLogger();
