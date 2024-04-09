import { registerAs } from '@nestjs/config';

export default registerAs('paystack', () => {
  return {
    key: process.env.PAYSTACK_SECRET_KEY,
  };
});
