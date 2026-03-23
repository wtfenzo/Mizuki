import logger from '@utils/logger.js';

export function handleCrash() {
    process.on('unhandledRejection', (reason, promise) => {
        logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`, 'AntiCrash');
    });

    process.on('uncaughtException', (error) => {
        logger.error(`Uncaught Exception: ${error}`, 'AntiCrash');
    });
}