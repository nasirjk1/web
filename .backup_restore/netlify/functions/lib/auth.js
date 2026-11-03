import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'webnasir-production-secret-key-2025-ai-income-fullstack';
const TOKEN_NAME = 'token';
const TOKEN_EXPIRY = '7d';

/**
 * Hash a plain text password with 10 salt rounds
 */
export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

/**
 * Compare plain password against bcrypt hash
 */
export async function verifyPassword(plainPassword, hash) {
  if (!plainPassword || !hash) return false;
  return await bcrypt.compare(plainPassword, hash);
}

/**
 * Sign JWT for authenticated admin
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify JWT token from cookie or Bearer header
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Parse cookies from header string
 */
export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return cookies;
  
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    cookies[key] = decodeURIComponent(val);
  }
  return cookies;
}

/**
 * Extract token from HTTP event headers (cookie or Authorization header)
 */
export function extractTokenFromEvent(event) {
  const headers = event.headers || {};

  // Check Cookie header (case-insensitive)
  const cookieHeader = headers.cookie || headers.Cookie || headers.COOKIE;
  if (cookieHeader) {
    const parsed = parseCookies(cookieHeader);
    if (parsed[TOKEN_NAME]) {
      return parsed[TOKEN_NAME];
    }
  }

  // Support Authorization: Bearer <token> (case-insensitive)
  const authHeader = headers.authorization || headers.Authorization || headers.AUTHORIZATION;
  if (authHeader && authHeader.slice(0, 7).toLowerCase() === 'bearer ') {
    return authHeader.substring(7).trim();
  }

  // Support x-access-token or token header
  const customHeader = headers['x-access-token'] || headers['X-Access-Token'] || headers.token || headers.Token;
  if (customHeader) {
    return customHeader.trim();
  }

  // Support query parameter fallback (e.g. ?token=...)
  if (event.queryStringParameters?.token) {
    return event.queryStringParameters.token.trim();
  }

  return null;
}

/**
 * Generate Set-Cookie string for setting auth token
 */
export function createAuthCookie(token, isSecure = false) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  if (isSecure || process.env.NODE_ENV === 'production' || (process.env.APP_URL && process.env.APP_URL.startsWith('https:'))) {
    return `${TOKEN_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=None; Partitioned`;
  }
  return `${TOKEN_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

/**
 * Generate Set-Cookie string for clearing auth token on logout
 */
export function createLogoutCookie(isSecure = false) {
  if (isSecure || process.env.NODE_ENV === 'production' || (process.env.APP_URL && process.env.APP_URL.startsWith('https:'))) {
    return `${TOKEN_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None; Partitioned`;
  }
  return `${TOKEN_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`;
}
