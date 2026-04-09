const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const APP_BASE_PATH =
  rawBasePath && rawBasePath !== "/" ? rawBasePath.replace(/\/$/, "") : "";

export const APP_COOKIE_PATH = APP_BASE_PATH || "/";

export function withBasePath(path: string) {
  if (!path) {
    return APP_BASE_PATH || "/";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${APP_BASE_PATH}${normalizedPath}`;
}

export function apiPath(path: string) {
  return withBasePath(path);
}
