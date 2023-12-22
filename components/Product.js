import styles from '../styles/Product.module.css';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';


function Product (props) {

    const handleDeleteButton = () => {
        props.handleDeleteButton(props.name);
    };

    const handleEditButton = () => {
        props.handleEditButton(props.name, props.price, props.category, props.stock, props.image);
    }

    return (
    <div className={styles.productContainer} >
        <div className={styles.productContent}>
            <h3 className={styles.nomProduit}>{props.name}</h3>
            <img src={props.image} alt={props.name} className={styles.img} />
            <p className={styles.stock}>Stock: {props.stock} {' '}
                {props.stock<10 && <FontAwesomeIcon icon={faTriangleExclamation} color='yellow' />}
            </p>
            <p className={styles.price}>Price: ${props.price}</p>
            <p className={styles.category}>Category: {props.category}</p>
        </div>
        <div className={styles.productBtn}>
            <button className={styles.editBtn} onClick={() => handleEditButton()} ><FontAwesomeIcon icon={faPen}/></button>
            <button className={styles.deleteBtn} onClick={() => handleDeleteButton()} ><FontAwesomeIcon icon={faTrash} color = 'white'/></button>
        </div>
    </div>
    );
}

export default Product;
