import styles from '../styles/Sale.module.css';
import { Modal, Input, Select, notification } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';



function Sale(props) {

    const [selectedOption, setSelectedOption] = useState(''); // Pour récupérer le produit choisie par le user
    const [productList, setProductList] = useState([]);
    const [sales, setSales] = useState('');


    useEffect(() => { // Fetch la liste des produit pour le menu déroulant
        fetch('https://stockify-backend-wheat.vercel.app/products/allProducts')
        .then(response => response.json())
        .then(data => {
            let products = [];
            for (let i=0; i<data.allProducts.length; i++) {
                products.push(data.allProducts[i])
            };
            setProductList(products);
        })
    }, []);


    const handleCancel = () => { // Ferme la modal
        setIsOpen(false);
    };


    const handleSubmitButton = () => {
        if(!sales || !selectedOption) {
            window.confirm('Empty fields !');
        } else {
            fetch(`https://stockify-backend-wheat.vercel.app/products/sell/${selectedOption}/${sales}`, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {
                props.handleCloseButton();
                props.refreshLastSale();
                openNotification(selectedOption, sales);
            });
        }
    };


    const handleSelectChange = (event) => { // Gère le choix du produit
        setSelectedOption(event);
    };

    const handleStockInputChange = (event) => {
        // Vérifie que c'est bien un nombre
        const isValidInput = /^-?\d*\.?\d*$/.test(event.target.value);

        if (isValidInput) {
            setSales(event.target.value);
        }
    };


    const openNotification = (productName, productStock) => {
        notification.open({
          message: 'Products sold',
          description: (
            <div>
              <p>
                <span style={{ color: 'green', fontWeight: 'bold' }}>{productStock} {productName} sold!</span>.
              </p>
            </div>
          ),
          className: 'custom-class',
          duration: 2,
          style: {
            width: 600,
          },
          icon: (
            <SmileOutlined
              style={{
                color: '#108ee9',
              }}
            />
          ),
        });
    };

    return (
        <Modal open={props.openSaleModal} onCancel={props.handleCloseButton} footer={null} width={450} height={900}>
            <div className={styles.modalContainer}>
                <div className={styles.title} > Sell a product</div>
                <div className={styles.mainContainer}>
                    <Select className={styles.selectInput} onChange={handleSelectChange} >
                        <option value="" > Select a product </option>
                        {productList.map((data, index) => (
                        <option key={index} value={data.name} > {data.name} ({data.stock})</option>
                        ))}
                    </Select>
                    <Input className={styles.inputField} type="number" onChange={handleStockInputChange} value={sales} placeholder="Quantity to add" />
                    <button onClick={() => handleSubmitButton()} className={styles.websiteButton} > SUBMIT </button>
                </div>
            </div>
        </Modal>
    );

};


export default Sale;