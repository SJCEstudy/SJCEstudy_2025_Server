import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from('4a656e6e79426c6f636b436861696e566f6c747a6369706572aabbccddeeff11', 'hex');
const iv = Buffer.from('aabbccddeeff11223344556677889900', 'hex');

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
