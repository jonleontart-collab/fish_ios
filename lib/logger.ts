import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "debug.log");

type LogData = unknown;

function formatMessage(level: string, context: string, message: string, data?: LogData) {
  const ts = new Date().toISOString();
  let text = `[${ts}] [${level}] [${context}] ${message}`;

  if (data !== undefined) {
    if (data instanceof Error) {
      text += `\nError: ${data.message}\nStack: ${data.stack}`;
    } else if (typeof data === "object" && data !== null) {
      text += `\nData: ${JSON.stringify(data, null, 2)}`;
    } else {
      text += ` ${String(data)}`;
    }
  }

  return `${text}\n`;
}

function writeToFile(text: string) {
  try {
    fs.appendFileSync(LOG_FILE, text);
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
}

export const logger = {
  info: (context: string, message: string, data?: LogData) => {
    const text = formatMessage("INFO", context, message, data);
    console.info(text.trim());
    writeToFile(text);
  },

  warn: (context: string, message: string, data?: LogData) => {
    const text = formatMessage("WARN", context, message, data);
    console.warn(text.trim());
    writeToFile(text);
  },

  error: (context: string, message: string, error?: LogData) => {
    const text = formatMessage("ERROR", context, message, error);
    console.error(text.trim());
    writeToFile(text);
  },
};
