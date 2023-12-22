import { Form, Input, Button } from 'antd';
import { useRouter } from 'next/router';
import { useState,useEffect } from 'react';
import styles from '../styles/Pages/resetPassword.module.css'


const ResetPassword = () => {
    const router = useRouter();
    const [resetToken, setResetToken] = useState(""); // Ajoutez l'état du jeton de réinitialisation


    useEffect(() => {
        // Extrait le jeton de réinitialisation à partir de l'URL
        const { token } = router.query;
        if (token) {
          setResetToken(token.toString());
        }
      }, [router.query]);

    const handleSubmit = async (values) => {
        try {
            const response = await fetch('https://stockify-backend-wheat.vercel.app/users/resetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: resetToken, // Utilisez le jeton de réinitialisation
                    newPassword: values.password,
                }),
                
            });
            
            if (response.ok) {
                const data = await response.json();
                // console.log(data)
                if (data.result) {
                    console.log('Password reset successfully');
                    // Redirigez l'utilisateur vers la page de connexion ou une autre page appropriée
                    router.push('/');
                } else {
                    console.error('Failed to reset password:', data.error);
                }
            } else {
                console.error('Failed to reset password. Server responded with:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error during password reset:', error);
        }
    };

    return (
        <div className={styles.Main}>

            <div className={styles.formContainer}>
            <div className={styles.title}>
               <h1>Reset Password</h1> 
            </div>
            
            <Form onFinish={handleSubmit}>
                <Form.Item
                    label="New Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter your new password',
                        },
                    ]}
                >   
                      <Input.Password placeholder="Enter your new password" /> 
                   
                    
                </Form.Item>
                <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your new password',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject('The two passwords do not match');
                            },
                        }),
                    ]}
                >    
                    
                         <Input.Password placeholder="Confirm your new password" />
                   
                   
                </Form.Item>
                 <div className={styles.Btn}>
                    <Button type="primary" htmlType="submit">
                    Reset Password
                    </Button>
                 </div>
                
            </Form>
            </div>
        </div>
    );
};

export default ResetPassword;


