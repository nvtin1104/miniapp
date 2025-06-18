# Zalo API Integration

## Tổng quan
Module này tích hợp API Zalo để xác thực và lấy thông tin người dùng từ Zalo.

## Cấu hình Environment Variables

### 1. Tạo file `.env` trong thư mục gốc của dự án:
```env
# Zalo Configuration
ZALO_SECRET_KEY=your_zalo_app_secret_key_here
```

### 2. Cách lấy ZALO_SECRET_KEY:
1. Đăng nhập vào [Zalo Developer Console](https://developers.zalo.me/)
2. Chọn ứng dụng của bạn
3. Vào tab "Cấu hình"
4. Copy "Secret Key" và paste vào file `.env`

## Cấu hình
Để sử dụng API Zalo, bạn cần có:
- `userAccessToken`: Token truy cập của người dùng Zalo
- `code`: Mã xác thực từ Zalo
- `secretKey`: Khóa bí mật của ứng dụng Zalo (tự động lấy từ environment)

## Các method chính

### 1. `getZaloUserInfo(userAccessToken, code, secretKey)`
Gọi API Zalo để lấy thông tin người dùng:
```typescript
const zaloUserInfo = await zaloService.getZaloUserInfo(
    userAccessToken,
    code,
    secretKey
);
```

### 2. `activeZalo(data: ZaloActiveInput)`
Kích hoạt tài khoản Zalo và cập nhật thông tin người dùng:
```typescript
const result = await zaloService.activeZalo({
    id: 'zalo_user_id',
    name: 'User Name',
    userAccessToken: 'user_access_token',
    code: 'auth_code',
    email: 'user@example.com',
    phone: '0123456789'
});
```

## Cấu trúc dữ liệu

### ZaloActiveInput
```typescript
{
    id: string;              // ID người dùng Zalo
    name: string;            // Tên người dùng
    userAccessToken: string; // Token truy cập
    code: string;            // Mã xác thực
    email?: string;          // Email (tùy chọn)
    phone?: string;          // Số điện thoại (tùy chọn)
    avatar?: string;         // URL avatar (tùy chọn)
}
```

### ZaloUserInfo (Response từ API Zalo)
```typescript
{
    id: string;              // ID người dùng Zalo
    name: string;            // Tên người dùng
    email?: string;          // Email
    phone?: string;          // Số điện thoại
    picture?: {              // Thông tin ảnh đại diện
        data: {
            url: string;
        };
    };
}
```

## Xử lý lỗi
Service sẽ throw error nếu:
- Không tìm thấy người dùng
- `ZALO_SECRET_KEY` chưa được cấu hình
- API Zalo trả về lỗi
- Có lỗi trong quá trình cập nhật thông tin

## Ví dụ sử dụng
```typescript
// Trong resolver hoặc controller
@Mutation(() => User)
async activateZalo(@Args('input') input: ZaloActiveInput) {
    return this.zaloService.activeZalo(input);
}
```

## GraphQL Mutation
```graphql
mutation MiniAppActiveZalo($data: ZaloActiveInput!) {
    miniAppActiveZalo(data: $data) {
        _id
        name
        email
        phone
        zaloId
    }
}
``` 