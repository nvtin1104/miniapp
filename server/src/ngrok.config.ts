import { connect } from '@ngrok/ngrok';

export const startNgrok = async (port: number) => {
  try {
    const tunnel = await connect({
      addr: port,
      authtoken: '2iHiLgBTZuQ6d53jzKpTJxU5inL_6Fh6rYAFGkHU4xzRMvoCG', // hoặc bỏ nếu không cần
      domain: 'raccoon-destined-bee.ngrok-free.app',
    });

    return tunnel.url();
  } catch (error) {
    throw error;
  }
};
