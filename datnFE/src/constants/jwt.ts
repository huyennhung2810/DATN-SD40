export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string) => {
  const decoded = parseJwt(token);

  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000;

  return decoded.exp < currentTime;
};

export default parseJwt;