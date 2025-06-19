import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  password: yup.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').required('Mật khẩu là bắt buộc'),
});
