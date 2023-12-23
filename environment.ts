export function getEnvironment<T = string>(key: string, defaultValue?: T): T {
  return (process.env[key] ?? defaultValue ?? "") as T;
}

export const environment = {
  // base
  WATCH: !!getEnvironment("WATCH"),

  // server
  PORT: 8080,

  // logs
  LOKI_HOST: getEnvironment("LOKI_HOST"),
  LOKI_USER: getEnvironment("LOKI_USER"),
  LOKI_PASSWORD: getEnvironment("LOKI_PASSWORD"),
};
