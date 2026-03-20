const rawApiRoot =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  "http://localhost:9000";

export const apiRootUrl = rawApiRoot.replace(/\/+$/, "");

export const apiBaseUrl = apiRootUrl.endsWith("/api")
  ? apiRootUrl
  : `${apiRootUrl}/api`;
