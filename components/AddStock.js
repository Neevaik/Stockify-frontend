import styles from '../styles/AddStock.module.css';
import { Modal, Input, Select, notification } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';


function AddStock(props) {

    const [selectedOption, setSelectedOption] = useState(''); // Pour récupérer le produit choisie par le user
    const [productList, setProductList] = useState([]);
    const [stockToAdd, setStockToAdd] = useState('');
    

    useEffect(() => { // Fetch la liste des produit pour le menu déroulant
        fetch('http://localhost:3000/products/allProducts')
        .then(response => response.json())
        .then(data => {
            let products = [];
            for (let i=0; i<data.allProducts.length; i++) {
                products.push(data.allProducts[i].name)
            };
            setProductList(products);
        })
    }, []);


    const handleCancel = () => { // Ferme la modal
        setIsOpen(false);
    };


    const handleSubmitButton = () => {
        if(!stockToAdd || !selectedOption) {
            window.confirm('Empty fields !');
        } else {
            fetch(`http://localhost:3000/products/addStock/${selectedOption}/${stockToAdd}`, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                props.handleCloseButton();  
                props.refreshLastSale();
                openNotification(selectedOption, stockToAdd);
            })
        }
    };


    const handleSelectChange = (event) => { // Gère le choix du produit
        setSelectedOption(event);
    };

    const handleStockInputChange = (event) => {
        // Vérifie que c'est bien un nombre
        const isValidInput = /^-?\d*\.?\d*$/.test(event.target.value);

        if (isValidInput) {
            setStockToAdd(event.target.value);
        }
    };


    const openNotification = (productName, productStock) => {
        notification.open({
          message: 'Stock added',
          description: (
            <div>
              <p>
                <span style={{ color: 'green', fontWeight: 'bold' }}>{productStock} {productName} added to your stock!</span>.
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
        <Modal open={props.openAddStockModal} onCancel={props.handleCloseButton} footer={null} width={450} height={900}>
            <div className={styles.modalContainer}>
                <div className={styles.title} > Add Stock </div>
                <div className={styles.mainContainer}>
                    <Select className={styles.selectInput} onChange={handleSelectChange} >
                        <option value="" > Select a product </option>
                        {productList.map((data, index) => (
                        <option key={index} value={data} > {data}</option>
                        ))}
                    </Select>
                    <Input className={styles.inputField} type="number" onChange={handleStockInputChange} value={stockToAdd} placeholder="Quantity to add" />
                    <button onClick={() => handleSubmitButton()} className={styles.submitButton} > SUBMIT </button>
                </div>
            </div>
           
        </Modal>
    );

};


export default AddStock;