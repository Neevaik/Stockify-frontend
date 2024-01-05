import styles from '../styles/Pages/Login.module.css';
import { Button, Form, Input } from 'antd';
import Link from 'next/link';

import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../reducers/users';

const Login = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

    if (user.token) {
        router.push('/home');
    }

    const handleSubmit = async (values) => {
        try {
            const response = await fetch('http://localhost:3000/users/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.username,
                    password: values.password,
                }),
            });

            if (response.ok) {
            
                const data = await response.json();
                console.log(data)
                if (data.result && data.token) {
                    dispatch(login({
                        username: data.username,
                        token: data.token,
                        isAdmin: data.isAdmin,
                    }));
                    router.push('/home');
                } else {
                    console.error('Sign-in failed: notif mauvaise connection', data.error);
                }
            }
        } catch (error) {
            console.error('Error during sign-in:', error);
        }
    };

    const handleSubmitFailed = (errorInfo) => {
        console.log('Failed: Bug formulaire', errorInfo);
    };

    return (
        <div className={styles.outerContainer}>
            <h1 className={styles.title}>Stockify</h1>
            <div className={styles.centeredContainer}>
                <Form
                    className={styles.loginForm}
                    name="basic"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={handleSubmit}
                    onFinishFailed={handleSubmitFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        className={styles.loginFormFormItem}
                        label="Username"
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your username!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        className={styles.loginFormFormItem}
                        label="Password"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        className={styles.loginFormButton}
                        wrapperCol={{
                            span: 24,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            Sign In
                        </Button>
                        <Link href={'/forgotPassword'}>
                            <a className={styles.forgotPasswordLink}>forgotPassword</a>
                        </Link>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Login;
