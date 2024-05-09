import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    secretKey: process.env.CLOUDINARY_API_SECRET,
  };
});
