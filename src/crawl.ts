export const normalizeURL = (url: string) => {
  try {
    const parsed = new URL(url);
    let normalized = parsed.host + parsed.pathname;
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch (error) {
    throw new Error("Invalid URL");
  }
};
