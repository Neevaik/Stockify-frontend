import styles from '../styles/AddNewProduct.module.css';
import { Modal, Input, Select } from 'antd';
import React, { useState, useEffect } from 'react';


function AddNewProduct(props) {

    const [productName, setProductName] = useState('');
    const [productStock, setProductStock] = useState(0);
    const [productPrice, setProductPrice] = useState(null);
    const [productImage, setProductImage] = useState("https://res.cloudinary.com/dj6bueyfl/image/upload/v1702976676/stockpic_unkgms.jpg");
    const [category, setCategory] = useState([]);
    const [categotyId, setCategoryId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // pour le css du bouton de choix d'un fichier



    useEffect(() => { // fetch toutes les catégories pour le menu déroulant de la modal
        fetch('http://localhost:3000/categories/allCategories')
        .then(response => response.json())
        .then(data => {
            let categories = [];
            for (let i=0; i<data.allCategories.length; i++) {
                categories.push({name: data.allCategories[i].name, _id: data.allCategories[i]._id})
            };
            setCategory(categories);
            setCategoryId(categories[0]._id);
        });
    }, []);


    const handleCancel = () => { // Ferme la modal
        setIsOpen(false);
    };

    const handleSubmitButton = () => {

        if(productImage === "https://res.cloudinary.com/dj6bueyfl/image/upload/v1702976676/stockpic_unkgms.jpg") {
            fetch('http://localhost:3000/products/newProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: productName, image: productImage, stock: productStock, category: categotyId, price: productPrice }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    if(data.result == false) {
                        window.confirm(data.error);
                    } else {
                       props.handleCloseButton();  
                    }
                });
                
        } 
        else {
            const formData = new FormData();
            formData.append('photoFromFront', productImage);
            formData.append('name', productName);
            formData.append('stock', productStock);
            formData.append('category', categotyId);
            formData.append('price', productPrice); 

            
        fetch('http://localhost:3000/products/newProductWithImage', {
            method: 'POST',
            body: formData,
            })
            .then(response => response.json())
            .then(data => {
            
            });
            props.handleCloseButton(); 
        }
    };


    const handleNameInputChange = (event) => {
        setProductName(event.target.value);
    };

    const handleStockInputChange = (event) => {
        // Vérifie que c'est bien un nombre
        const isValidInput = /^-?\d*\.?\d*$/.test(event.target.value);

        if (isValidInput) {
            setProductStock(event.target.value);
        }
    };

    const handlePriceInputChange = (event) => {
        const isValidInput = /^-?\d*\.?\d*$/.test(event.target.value);

        if (isValidInput) {
            setProductPrice(event.target.value);
        };
    };

    const handleImageInputChange = (e) => {
        const file = e.target.files[0];
        setProductImage(file);
        setSelectedFile(file);
    };
    

    const handleSelectChange = (event) => { // Gère le choix de la catégorie et cherche son ID
        console.log(event)
        let catName = event;
        let id=category.find(element => element.name === catName)
        setCategoryId(id._id);
    };


    return (
        <Modal open={props.openAddProductModal} onCancel={props.handleCloseButton} footer={null} width={450} height={900}>
            <div className={styles.allContainer} >
                <div className={styles.title} > Add New Product </div>
                    <div className={styles.mainContainer}>
                        <div className={styles.inputContainer}>
                            <p className={styles.inputName}> Name</p>
                            <Input className={styles.inputField} type="text" onChange={handleNameInputChange} value={productName} placeholder="Product name" required />
                        </div>
                        <div className={styles.inputContainer}>
                            <p className={styles.inputName}> Stock</p>
                            <Input className={styles.inputField} type="number" onChange={handleStockInputChange} value={productStock} placeholder="Stock" required />
                        </div>
                        <div className={styles.inputContainer}>
                            <p className={styles.inputName}> Price</p>
                            <Input className={styles.inputField} type="number" onChange={handlePriceInputChange} value={productPrice} placeholder="Price" required />
                        </div>
                        <div className={styles.inputContainer}>
                            <p className={styles.inputName}> Category</p>
                            <Select className={styles.selectInput} onChange={handleSelectChange} >
                            {category.map((data, index) => (
                            <option key={index} value={data.name}> {data.name} </option>
                            ))}
                        </Select>
                        </div>

                        <Input className={styles.imageField} type="file" onChange={handleImageInputChange} accept="image/*" id="fileInput"/>
                            <label className={styles.newImageDiv} htmlFor="fileInput"> 
                            {selectedFile ? 'Image selected :' : 'Select an Image'}
                            </label>
                        <p className={styles.fileName} > {selectedFile ? selectedFile.name : 'No file selected'}</p>
                        

                        <button onClick={() => handleSubmitButton()} className={styles.submitButton} > Submit </button>
                </div>
            </div>

        </Modal>
    );

};


export default AddNewProduct;