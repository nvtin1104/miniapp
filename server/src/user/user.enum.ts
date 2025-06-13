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
    READ = 'read:all',
    CREATE = 'create:all',
    UPDATE = 'update:all',
    DELETE = 'delete:all',
    READUSER = 'read:user',
    CREATEUSER = 'create:user',
    UPDATEUSER = 'update:user',
    DELETEUSER = 'delete:user',
    ADMIN = 'admin',
    GUEST = 'guest',
}
