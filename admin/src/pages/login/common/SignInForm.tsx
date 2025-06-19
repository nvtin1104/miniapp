import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from './validate.schema';
import { useState } from 'react';
import { Link } from 'react-router';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { LOGIN_MUTATION } from '@/graphql/mutations/user.mution';
import { useMutation } from '@apollo/client';

type FormData = {
    email: string;
    password: string;
};

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(loginSchema),
    });

    const [login, { loading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            console.log(data);
        },
        onError: (error) => {
            console.log(error);
        },
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
        login({ variables: data });
    };

    const filterRegister = (registerResult: any) => {
        const { min, max, ...rest } = registerResult;
        return rest;
    };

    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Đăng nhập
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nhập email và mật khẩu để đăng nhập
                        </p>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-6">
                                <div>
                                    <Label>
                                        Email <span className="text-error-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="info@gmail.com"
                                        {...filterRegister(register('email'))}
                                    />
                                    {errors.email && (
                                        <p className="text-error-500 text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>
                                        Mật khẩu <span className="text-error-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Nhập mật khẩu"
                                            {...filterRegister(register('password'))}
                                        />
                                        <span
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                        >
                                            {showPassword ? (
                                                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                            )}
                                        </span>
                                    </div>
                                    {errors.password && (
                                        <p className="text-error-500 text-sm mt-1">{errors.password.message}</p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <Link
                                        to="/reset-password"
                                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div>
                                    <Button className="w-full" size="sm" type="submit" disabled={loading} onClick={handleSubmit(onSubmit)}>
                                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
