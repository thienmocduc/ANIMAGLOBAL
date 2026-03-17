'use strict';
const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, colorize, printf, json } = format;

const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const m = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}] ${message}${m}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      )
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: combine(timestamp(), json())
      }),
      new transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        format: combine(timestamp(), json())
      })
    ] : [])
  ]
});

module.exports = logger;
