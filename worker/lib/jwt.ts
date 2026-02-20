import { SignJWT, jwtVerify } from 'jose';

const DEFAULT_SECRET = 'dev-default-jwt-secret-change-in-production';

function getKey(secret?: string): Uint8Array {
  return new TextEncoder().encode(secret ?? DEFAULT_SECRET);
}

export async function signToken(userId: number, secret?: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getKey(secret));
}

export async function verifyToken(token: string, secret?: string): Promise<{ userId: number }> {
  const { payload } = await jwtVerify(token, getKey(secret));
  const userId = payload.userId as number;
  if (typeof userId !== 'number' || !Number.isInteger(userId) || userId <= 0) {
    throw new Error('Invalid token payload');
  }
  return { userId };
}
