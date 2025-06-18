export const ZALO_CONFIG = {
    API_ENDPOINT: 'https://graph.zalo.me/v2.0/me/info',
};

export interface ZaloUserInfo {
    data: {
        number: string;
    };
} 