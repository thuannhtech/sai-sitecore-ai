import { activationTokenService } from 'src/lib/auth/activation-token';
import { authService } from 'src/lib/ordercloud/auth';

export const activateAccountFromToken = async (token: string) => {
  const payload = activationTokenService.verifyToken(token);
  const result = await authService.activateUser(payload.uid, payload.email);

  return {
    userId: payload.uid,
    email: payload.email,
    expiresAt: payload.exp,
    ...result,
  };
};
