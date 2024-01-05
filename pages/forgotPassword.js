import { Form, Input, Button } from 'antd';
import styles from '../styles/Pages/forgotPassword.module.css'

const ForgotPassword = () => {





    const handleSubmit = async (values) => {
        try {
            // Envoie une requête POST au backend avec l'adresse e-mail pour réinitialiser le mot de passe
            const response = await fetch('http://localhost:3000/users/forgotPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email,
                }),
                
            });
    
            // Vérifie si la requête a réussi
            if (response.ok) {
                const data = await response.json();
    
                if (data.result) {
                   
                    console.log('Password reset email sent successfully');
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
                   <h1>Forgot Password</h1> 
                </div>
                
            <Form
                onFinish={handleSubmit}
                labelCol={{
                    span: 1,
                }}
                wrapperCol={{
                    span: 28,
                }}
                initialValues={{
                    remember: true,
                }}
            >
               
                <Form.Item
                label = 'email'
                name ='email'
                rules ={[
                    
                    {
                        type:'email',
                        message:'please enter a valid email adresse'

                    },
                    {
                        required:true,
                        message : 'please enter your email adresse'
                    }
                ]}>
                    <div className={styles.input}>
                        <Input placeholder='enter your email adresse' />
                        </div>
                    
                   
                </Form.Item>
                <div className={styles.Btn}>
                     <Button type="primary" htmlType="submit"
                >
                        Reset Password
                    </Button>
                </div>
               
            </Form>
            </div>
            
        </div>
    );
};

export default ForgotPassword;