import fs from "fs";
import path from "path";

// Записываем логи в файл debug.log в корне проекта
const LOG_FILE = path.join(process.cwd(), "debug.log");

function formatMessage(level: string, context: string, message: string, data?: any) {
  const ts = new Date().toISOString();
  let text = `[${ts}] [${level}] [${context}] ${message}`;
  
  if (data !== undefined) {
    if (data instanceof Error) {
      text += `\nError: ${data.message}\nStack: ${data.stack}`;
    } else if (typeof data === "object") {
      text += `\nData: ${JSON.stringify(data, null, 2)}`;
    } else {
      text += ` ${String(data)}`;
    }
  }
  
  return text + "\n";
}

function writeToFile(text: string) {
  try {
    fs.appendFileSync(LOG_FILE, text);
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
}

export const logger = {
  info: (context: string, message: string, data?: any) => {
    const text = formatMessage("INFO", context, message, data);
    console.info(text.trim());
    writeToFile(text);
  },
  
  warn: (context: string, message: string, data?: any) => {
    const text = formatMessage("WARN", context, message, data);
    console.warn(text.trim());
    writeToFile(text);
  },
  
  error: (context: string, message: string, error?: any) => {
    const text = formatMessage("ERROR", context, message, error);
    console.error(text.trim());
    writeToFile(text);
  }
};
