export function getEnvironment<T = string>(key: string, defaultValue?: T): T {
  return (process.env[key] ?? defaultValue ?? "") as T;
}

export const environment = {
  // base
  WATCH: !!getEnvironment("WATCH"),

  // server
  PORT: 8080,
};
