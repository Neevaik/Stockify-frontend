import styles from '../styles/Header/Drawer.module.css';
import { Drawer, Button } from 'antd';
import { PoweroffOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link'; // Importez le composant Link de Next.js

import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { logout } from '../reducers/users';

const DrawerLeft = (props) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const onClose = () => {
    props.handleDrawerClick();
  };

  return (
    <>
      <Drawer
        title={
          <Link href="/home">
            <a className={styles['drawer-link']}>Home</a>
          </Link>
        }
        placement="left"
        width={200}
        onClose={onClose}
        closable={false}
        visible={props.isDrawerOpen}
        className={styles.main}
      >
        <p className={styles['drawer-link']} onClick={() => router.push('/products')}>
          Products
        </p>
        <p className={styles['drawer-link']} onClick={() => router.push('/sales')}>
          Sales
        </p>
        <p className={styles['drawer-link']} onClick={() => router.push('/statistics')}>
          Statistics
        </p>
        <p className={styles['drawer-link']} onClick={() => router.push('/categories')}> Categories </p>
        <p className={styles['drawer-link']} onClick={() => router.push('/admin')}>
          Admin
        </p>
        <Button
          type="link"
          className={styles['sign-out-button']}
          onClick={() => {
            dispatch(logout());
          }}
        >
          <PoweroffOutlined /> Sign out
        </Button>
      </Drawer>
    </>
  );
};

export default DrawerLeft;
