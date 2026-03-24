export type Logger = Pick<typeof console, "debug" | "info" | "warn" | "error">;

export interface Session {
  log: Logger;
}
