import { Button, notification } from 'antd';
import { BellOutlined, AlertOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import styles from '../../styles/Header/Notification.module.css'

const NotificationButton = () => {
  const [dataProducts, setDataProducts] = useState(null);




  const fetchData = async () => {
    try {
      const response = await fetch('https://stockify-backend-wheat.vercel.app/products/allProducts');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      setDataProducts(data.allProducts);
      checkStockAndNotify(data.allProducts);

    } catch (error) { 
      console.error('Erreur lors du fetch', error);
    }
  };


  const checkStockAndNotify = (products) => {
    products.forEach((product) => {
      if (product && product.stock && product.soldAt && product.soldAt.length > 0) {
        const lastProduct = product.soldAt.length - 1;
        if (product.stock <= 10) {
          openNotification(product.name, product.stock, product.soldAt[lastProduct].date);
        }
      }
    });
  };
  

  const convertDateFr = (date) => {
    const inputDate = date;
    const dateObject = new Date(inputDate);

    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = dateObject.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    return formattedDate;
  }

  const openNotification = (productName, productStock, soldAt) => {
    notification.open({
      message: 'ALERT !',
      description: (
        <div className={styles.mainContainer}>
          <p>
            Only{' '}
            <span style={{ color: 'red', fontWeight: 'bold' }}>{productStock}{' '}</span>.
            <span style={{  color: 'black', fontWeight: 'bold' }}>{productName}{' '}</span> left in stock
          </p>
          <p>
            Last sale on
          <span style={{ color: 'black', fontWeight: 'bold' }}> {convertDateFr(soldAt)}</span>.
          </p>
        </div>
      ),
      className: 'custom-class',
      duration: 2,
      style: {
        width: 600,
      },
      icon: (
        <AlertOutlined style={{
          color: '#108ee9',
        }}/>
      ),
    });
  };

  return (
    <BellOutlined style={{fontSize:'24px'}} onClick={fetchData}>
      Notifications
    </BellOutlined>
  );
};

export default NotificationButton;
