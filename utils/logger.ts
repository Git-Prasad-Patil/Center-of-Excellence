import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `[${timestamp}] ${level}: ${message} - ${stack}`
        : `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [new transports.Console({ handleExceptions: true })],
  exitOnError: false,
});

export default logger;
