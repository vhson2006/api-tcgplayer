import { registerAs } from '@nestjs/config';
import config from 'src/assets/configs/app.config';

export default registerAs('jwt', () => {
  return {
    secret: config().jwt.secret,
    audience: config().jwt.audience,
    issuer: config().jwt.issuer,
    accessTokenTtl: parseInt(config().jwt.accessTokenExpiresIn ?? '60', 10),
    refreshTokenTtl: parseInt(config().jwt.refreshTokenExpiresIn ?? '86400', 10),
  };
});
