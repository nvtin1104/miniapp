export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BANNED = 'banned',
}
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}
export enum UserGender {
    UNKNOWN = 'unknown',
    MEN = 'men',
    WOMEN = 'women',
    OTHER = 'other',
}
export enum UserType {
    ZALO = 'zalo',
    FACEBOOK = 'facebook',
    GOOGLE = 'google',
    EMAIL = 'email',
    PHONE = 'phone',
    OTHER = 'other',
    DEFAULT = 'default'
}
export enum UserPermission {
    ROOT = 'root',
    READ = 'read',
    WRITE = 'write',
    DELETE = 'delete',
    UPDATE = 'update',
    ADMIN = 'admin',
    GUEST = 'guest',
}
