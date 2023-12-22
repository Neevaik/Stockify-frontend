import styles from '../../styles/Header/Navbar.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import NotificationButton from '../../components/Header/Notifications';
import DrawerLeft from '../DrawerLeft';
import { useRouter } from 'next/router';

import { useState } from 'react';
import { useSelector } from 'react-redux';


function HeaderBar () {

    const user = useSelector((state) => state.user.value);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const router = useRouter();

    const getPageTitle = () => {
        switch (router.pathname) {
          case '/admin':
            return 'Administrator';
          case '/home':
            return 'Stockify';
          case '/products':
            return 'Products';
          case '/sales':
            return 'Sales';
          case '/statistics':
            return 'Statistics';
          case '/categories':
            return 'Categories';
          default:
            return 'Stockify';
        }
      };




    const handleDrawerClick = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <div className={styles.headerBar}>
        <div className={styles.iconsSection}>
          <FontAwesomeIcon icon={faBars} className={styles.iconTop} onClick={handleDrawerClick} />
          <h1 className={styles.mainTitle} > { getPageTitle() } </h1>
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.nameContainer}>
          <p className={styles.welcome}>Welcome</p>
          <p className={styles.userName} >{user.username}</p>
          </div>
         
          <NotificationButton />
        </div>
        <DrawerLeft isDrawerOpen={isDrawerOpen} handleDrawerClick={handleDrawerClick} />
      </div>
    )
}


export default HeaderBar;