import styles from '../styles/ProductsPage.module.css';
import AddNewProduct from './AddNewProduct';
import Product from './Product';
import FilterCascader from './Tools/FilterCascader';
import { Modal, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

function ProductsPage(props) {

  const [myProducts, setMyProducts] = useState([]);
  const [openAddProductModal, setOpenAddProductModal] = useState(false);
  const [refreshProducts, setRefreshProducts] = useState(false); // recharge les produits après suppression d'un produit
  const [category, setCategory] = useState([]);
  const [price, setPrice] = useState(null);
  const [stock, setStock] = useState(null);
  const [image, setImage] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const [productName, setProductName] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false);

  const user = useSelector((state) => state.user.value);
  const router = useRouter();

  const [nameToSave, setNameToSave] = useState('');

  useEffect(() => {
    if (!user.token) {
      router.push('/');
    }
  }, [user.token, router]);

  useEffect(() => { // Affiche la liste de tous nos produits
    setTimeout(() => {
       fetch('http://localhost:3000/products/allProducts')
      .then(response => response.json())
      .then(data => {
        setMyProducts(data.allProducts);
      });
    }, 2000);
  }, [refreshProducts]);

  useEffect(() => { // fetch toutes les catégories pour le menu déroulant de la modal
    fetch('http://localhost:3000/categories/allCategories')
    .then(response => response.json())
    .then(data => {
        let categories = [];
        for (let i=0; i<data.allCategories.length; i++) {
            categories.push({name: data.allCategories[i].name, _id: data.allCategories[i]._id})
        };
        setCategory(categories);
        setCategoryId(categories[0]._id); // sert à récupérer l'id de la première catégorie pour l'afficher en premier dans le menu
        //(cas de figure ou le user choisi la première catégorie sans touche le menu déroulant)
    });
}, []);

const handleAddProductButton = () => {
  setOpenAddProductModal(true);
};
  
const handleCloseButton = () => {
  setOpenAddProductModal(false);
  setRefreshProducts(!refreshProducts);
}; 

const handleDeleteButton = (name) => {
  fetch(`http://localhost:3000/products/deleteProduct/${name}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })
  .then(data => {
    setRefreshProducts(!refreshProducts);
  })
};

const handleEditButton = (name, price, category, stock, image) => {
  setNameToSave(name);
  setOpenEditModal(true);
  setProductName(name);
  setPrice(price);
  setStock(stock);
  setImage(image);
  console.log(image);
};

const closeEditModal = () => {
  setOpenEditModal(false);
};

const handleNameInputChange = (event) => {
  setProductName(event.target.value);
};

const handleSelectChange = (event) => { // Gère le choix de la catégorie et cherche son ID
  let catName = event.target.value;
  let id=category.find(element => element.name === catName)
  setCategoryId(id._id);
  setCategoryName(catName);
};

const handlePriceInputChange = (event) => {
  const isValidInput = /^-?\d*\.?\d*$/.test(event.target.value);

  if (isValidInput) {
      setPrice(event.target.value);
  };
};

const handleStockInputChange = (event) => {
  const isValidInput = /^-?\d*\.?\d*$/.test(event.target.value);

  if (isValidInput) {
      setStock(event.target.value);
  };
};

const handleImageInputChange = (e) => {
  const file = e.target.files[0];
  setImage(file);
};


const handleSaveButton = () => { 
  fetch(`http://localhost:3000/products/updateMyProduct/${nameToSave}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: productName, category: categoryId, price: price, stock: stock })
  });
  setRefreshProducts(!refreshProducts);
  setOpenEditModal(false);
  };


    return (
      <div className={styles.main}>
        <div className={styles.filterContainer} >
          <FilterCascader />
          <FilterCascader />
          <FilterCascader />
        </div>   
        <Button type="primary" onClick={() => handleAddProductButton()} className={styles.addProductButton} > ADD NEW PRODUCT </Button>
        <div className={styles.productsContainer}>
          {openAddProductModal && 
          <AddNewProduct openAddProductModal={openAddProductModal} handleCloseButton={handleCloseButton} /> }
            {myProducts.map((data, i) => {
            return <Product key={i} name={data.name} stock={data.stock} price={data.price} category={data.category[0].name} image={data.image} handleDeleteButton={handleDeleteButton} handleEditButton={handleEditButton} />
            })}

      </div>

          <Modal open={openEditModal} onCancel={closeEditModal} footer={null} width={800} height={800}>
              <div className={styles.title} > UPDATE PRODUCT </div>
              <div className={styles.mainContainer}>
                NAME <input type="text" onChange={handleNameInputChange} value={productName} placeholder="Product name" />
                <img src={image} alt={productName} />
                CATEGORY <select onChange={handleSelectChange} >
                  {category.map((data, index) => (
                  <option key={index} value={data.name}> {data.name} </option>
                  ))}
                </select>
                PRICE <input type="number" onChange={handlePriceInputChange} value={price} placeholder="Price" required />
                STOCK <input type="number" onChange={handleStockInputChange} value={stock} placeholder="Stock" required />
                <button onClick={() => handleSaveButton()} > SUBMIT </button>
              </div>
          </Modal>
      </div>
)
};

export default ProductsPage;