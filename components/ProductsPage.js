import styles from '../styles/ProductsPage.module.css';
import AddNewProduct from './AddNewProduct';
import Product from './Product';
import FilterCascader from './Tools/FilterCascader';
import FilterStock from './Tools/FilterStock';
import { Modal, Input, Select,Spin  } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

function ProductsPage(props) {
  const [myProducts, setMyProducts] = useState([]);
  const [openAddProductModal, setOpenAddProductModal] = useState(false);
  const [refreshProducts, setRefreshProducts] = useState(false);
  const [category, setCategory] = useState([]);
  const [price, setPrice] = useState(null);
  const [stock, setStock] = useState(null);
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [myCategory, setMyCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [triggerSortByStock, setTriggerSortByStock] = useState(false);
  const user = useSelector((state) => state.user.value);
  const router = useRouter();
  const [nameToSave, setNameToSave] = useState('');

  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (!user.token) {
      router.push('/');
    }
  }, [user.token, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTimeout(async () => {
          const response = await fetch('https://stockify-backend-wheat.vercel.app/categories/allCategories');
          const data = await response.json();
          setCategory(data.allCategories);
          setCategoryId(data.allCategories[0]._id);
        }, 1000)
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setSpinning(true);

        setTimeout(async () => {

        const response = await fetch('https://stockify-backend-wheat.vercel.app/products/allProducts');
        const data = await response.json();
        setSpinning(false);
      
        if(selectedFilters.length === 0) {
          if (triggerSortByStock === "Stock Ascending") {
            setMyProducts([...data.allProducts].sort(compareByStock));
          } else if (triggerSortByStock === "Stock Descending") {
            setMyProducts([...data.allProducts].sort(compareByStock).reverse());
          } else {
            setMyProducts(data.allProducts);
          }

        } else {

        let productTab = [];

        for (let i = 0; i < selectedFilters.length; i++) {
          for (let j = 0; j < data.allProducts.length; j++) {
            if (selectedFilters[i] === data.allProducts[j].category[0].name) {
              productTab.push(data.allProducts[j]);
            }
          }
        }


          if (triggerSortByStock === "Stock Ascending") {
            setMyProducts(productTab.sort(compareByStock));
            console.log(triggerSortByStock)
          } else if (triggerSortByStock === "Stock Descending") {
            setMyProducts(productTab.sort(compareByStock).reverse());
          } else {
            setMyProducts(productTab);
          }
         }
        }, 1000)
      } catch (error) {
        console.error('Erreur lors de la récupération des produits filtrés :', error);    
    }
    };

    fetchData();
  }, [refreshProducts, selectedFilters, triggerSortByStock]);


  useEffect(() => {
    fetch('https://stockify-backend-wheat.vercel.app/categories/allCategories')
      .then(response => response.json())
      .then(data => {
        let categories = [];
        for (let i = 0; i < data.allCategories.length; i++) {
          categories.push({ name: data.allCategories[i].name, _id: data.allCategories[i]._id })
        };
        setCategory(categories);
        setCategoryId(categories[0]._id);
      });
  }, []);

  const handleAddProductButton = () => {
    setOpenAddProductModal(true);
  };

  function compareByStock(a, b) {
    if (a.stock < b.stock) {
      return -1;
    }
    if (a.stock > b.stock) {
      return 1;
    }
    return 0;
  }


  const handleCloseButton = () => {
    setOpenAddProductModal(false);
    setRefreshProducts(!refreshProducts);
  };

  const handleDeleteButton = (name) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this product?');
    if (isConfirmed) {
      fetch(`https://stockify-backend-wheat.vercel.app/products/deleteProduct/${name}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(data => {
          setRefreshProducts(!refreshProducts);
        })
    }
  };

  const handleEditButton = (name, price, category, stock, image) => {
    setNameToSave(name);
    setOpenEditModal(true);
    setProductName(name);
    setPrice(price);
    setStock(stock);
    setImage(image);
    setMyCategory(category);
  };


  const closeEditModal = () => {
    setOpenEditModal(false);
  };

  const handleNameInputChange = (event) => {
    setProductName(event.target.value);
  };

  const handleSelectChange = (event) => {
    let catName = event;
    let id = category.find(element => element.name === catName)
    setCategoryId(id._id);
    setCategoryName(catName);
    setMyCategory(catName);
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

  const handleSaveButton = () => {
    fetch(`https://stockify-backend-wheat.vercel.app/products/updateMyProduct/${nameToSave}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: productName, category: categoryId, price: price, stock: stock })
    })
      .then(response => response.json())
      .then(data => {
        if (data.result == false) {
          window.confirm('Are you sure you want to delete this product?');
        } else {
          setRefreshProducts(!refreshProducts);
          setOpenEditModal(false);
        }
      })
  };


  const handleFilterChange = (selectedFilters) => {
    setSelectedFilters(selectedFilters);
  }

  const handleStockFilterChange = (stockFilterChange) => {
    setTriggerSortByStock(stockFilterChange);
  }


  return (

    <div className={styles.main}>
      <Spin spinning={spinning} fullscreen />
      <div className={styles.filtersContainer}>
        <div className={styles.myFilters}>
          <FilterCascader handleFilterChange={handleFilterChange} />
          <FilterStock handleStockFilterChange={handleStockFilterChange} />
        </div>
        <button className={styles.addProduct} onClick={() => handleAddProductButton()}> Add New Product </button>
      </div>

      <div className={styles.productCards}>
        {openAddProductModal && <AddNewProduct openAddProductModal={openAddProductModal} handleCloseButton={handleCloseButton} />}
        {myProducts.length === 0 ? (
          <p>Aucun produits</p>
        ) : (
          myProducts.map((data, i) => {
            return <Product key={i} name={data.name} stock={data.stock} price={data.price} category={data.category[0].name} image={data.image} handleDeleteButton={handleDeleteButton} handleEditButton={handleEditButton} />
          })
        )}
      </div> 

      <Modal className={styles.modalMainContent} open={openEditModal} onCancel={closeEditModal} footer={null} width={450} height={800}>
        <div className={styles.modalMainContent}>
          <img src={image} alt={productName} className={styles.image} />
          <div className={styles.title} > Update product </div>
          <div className={styles.mainContainer}>
            <div className={styles.inputContainer}>
              <p className={styles.inputName}> Name</p>
              <Input className={styles.inputField} type="text" onChange={handleNameInputChange} value={productName} placeholder="Product name" />
            </div>
            <div className={styles.inputContainer}>
              <p className={styles.inputName}> Price</p>
              <Input className={styles.inputField} type="number" onChange={handlePriceInputChange} value={price} placeholder="Price" required />
            </div>
            <div className={styles.inputContainer}>
              <p className={styles.inputName}> Stock</p>
              <Input className={styles.inputField} type="number" onChange={handleStockInputChange} value={stock} placeholder="Stock" required />
            </div>
            <div className={styles.inputContainer}>
              <p className={styles.inputName}> Category</p>
              <Select className={styles.selectInput} onChange={handleSelectChange} value={myCategory} >
                {category.map((data, index) => (
                  <option key={index} value={data.name}> {data.name} </option>
                ))}
              </Select>
            </div>
            <button onClick={() => handleSaveButton()} > Save </button>
          </div>
        </div>


      </Modal>
    </div>
  )
};

export default ProductsPage;