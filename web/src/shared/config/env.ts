const requireEnv = (value: string | undefined, fallback: string): string => {
  if (value && value.trim().length > 0) {
    return value;
  }
  return fallback;
};
//
const rawApiBaseUrl = requireEnv(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "http://localhost:5000",
);

const isClientSide = typeof window !== "undefined";
const isDev = process.env.NODE_ENV === "development";
//
export const env = {
  apiBaseUrl: rawApiBaseUrl,
  isClientSide,
  isDev,
  appName: requireEnv(process.env.NEXT_PUBLIC_APP_NAME, "Pawdar"),
  catApiKey: requireEnv(
    process.env.NEXT_PUBLIC_CAT_API_KEY || process.env.CAT_API_KEY,
    "",
  ),
  dogApiKey: requireEnv(
    process.env.NEXT_PUBLIC_DOG_API_KEY || process.env.DOG_API_KEY,
    "",
  ),
} as const;
