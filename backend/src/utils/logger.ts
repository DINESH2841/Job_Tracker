export const logger = {
  info: (msg: string) => console.log(`[info] ${msg}`),
  warn: (msg: string) => console.warn(`[warn] ${msg}`),
  error: (msg: string, err?: unknown) =>
    console.error(`[error] ${msg}${err ? ` :: ${String(err)}` : ""}`)
};
