export interface UserInfo {
    _id: string;
    name: string;
    avatar: {
        path: string;
    };
    isZaloActive: boolean;
    phone: string;
    email: string;
    address: string;
}