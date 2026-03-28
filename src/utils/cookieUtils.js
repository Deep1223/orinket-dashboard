/**
 * Cookie helpers for storing loginInfo (and other small JSON data).
 * Uses sameSite=Lax and path=/ by default.
 */

const DEFAULT_OPTIONS = {
  path: '/',
  sameSite: 'Lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

export const setCookie = (name, value, options = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  const encoded = encodeURIComponent(str);
  let cookie = `${name}=${encoded}; path=${opts.path}; SameSite=${opts.sameSite}`;
  if (opts.maxAge != null) cookie += `; max-age=${opts.maxAge}`;
  if (opts.secure) cookie += '; Secure';
  document.cookie = cookie;
};

export const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (!match) return null;
  try {
    const decoded = decodeURIComponent(match[2]);
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  } catch {
    return null;
  }
};

export const removeCookie = (name, path = '/') => {
  document.cookie = `${name}=; path=${path}; max-age=0`;
};
