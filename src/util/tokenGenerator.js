import crypto from 'crypto';

export function tokenGenerator() {
  // 6位 hex 字符串需要 3 个字节
  return crypto.randomBytes(3).toString('hex'); 
}