import { connect } from '@ngrok/ngrok';
import * as dotenv from 'dotenv';

dotenv.config();
export const startNgrok = async (port: number) => {
  try {
    const tunnel = await connect({
      addr: port,
      authtoken: process.env.NGROK_AUTH_TOKEN, // hoặc bỏ nếu không cần
      domain: process.env.SERVER_DOMAIN,
    });

    return tunnel.url();
  } catch (error) {
    throw error;
  }
};
