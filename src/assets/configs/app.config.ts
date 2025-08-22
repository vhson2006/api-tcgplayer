export default () => ({
  environment: process.env.NODE_ENV,
  global: {
    port: process.env.GLOBAL_PORT,
    corsDomainRegex: btoa(process.env.GLOBAL_DOMAIN_REGEX),
    numberRequestPerSlot: process.env.GLOBAL_NUMBER_REQUEST_PER_SLOT,
    slotTime: process.env.GLOBAL_SLOT_TIME,
    timeout: process.env.GLOBAL_TIMEOUT,
    temp: process.env.GLOBAL_TEMP_DEST,
    domain: process.env.GLOBAL_DOMAIN,
    fePath: process.env.GLOBAL_FE_PATH,
    feDomain: process.env.GLOBAL_FE_DOMAIN,
  },
  api: {
    prefix: process.env.API_PREFIX,
    version: process.env.API_VERSION,
    title: process.env.API_TITLE,
    description: process.env.API_DESCRIPTION,
    documentUri: process.env.API_DOCUMENT_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_TTL,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_TTL,
  },
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  cloudinary: {
    domain: process.env.CLOUDINARY_DOMAIN,
    name: process.env.CLOUDINARY_NAME,
    folder: process.env.CLOUDINARY_FOLDER,
    apiKey: process.env.CLOUDINARY_KEY,
    apiSecret: process.env.CLOUDINARY_SECRET,
  },
  email: {
    type: process.env.EMAIL_TYPE,
    sender: process.env.EMAIL_SENDER,
    password: process.env.EMAIL_PASSWORD,
  },
  aws: {
    id: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET
  },
  queue: {
    name: 'email'
  }
});
