// import { sign as _sign, verify as _verify } from 'jsonwebtoken';
import pkg from 'jsonwebtoken';
const { sign: _sign, verify: _verify } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(payload) {
  return _sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function sign(payload) {
  return _sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verify(token) {
  return _verify(token, JWT_SECRET);
}

export function verifyRefresh(token) {
  return _verify(token, JWT_SECRET);
}

// export default { sign, generateToken, verify, verifyRefresh };
