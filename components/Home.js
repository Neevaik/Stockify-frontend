import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
// import LastSales from "./LastSales";
import AddStock from "./AddStock";
import Sale from "./Sale";
import { Table } from "antd";

function Home() {
  const user = useSelector((state) => state.user.value);
  const router = useRouter();
  const [openAddStockModal, setOpenAddStockModal] = useState(false);
  const [openSaleModal, setSaleModal] = useState(false);
  const [refresh,setRefresh] = useState(false)
  const [displayProducts, setDisplayProducts] = useState([]);


  const refreshLastSale = () =>{
    console.log("refreshLastSale called");
    setRefresh(prevRefresh => !prevRefresh)
  }


  useEffect(() => {
    if (!user.token) {
      router.push("/");
    }
  }, [user.token, router]);

  
  // const user = useSelector((state) => state.user.value);
  // const router = useRouter();
 

  

  useEffect(() => {
    if (!user.token) {
      router.push("/");
    }
  }, [user.token, router]);
 

  const columns = [
    // Schema du tableau
    {
      title: "Product",
      width: 120,
      dataIndex: "product",
      sorter: true,
    },
    {
      title: "Category",
      width: 120,
      dataIndex: "category",
      sorter: true,
    },
    {
      title: "Date",
      width: 120,
      dataIndex: "date",
    },
    {
      title: "current Stock ",
      dataIndex: "stock",
      width: 120,
      sorter: true,
    },
    {
      title: "Number of sales",
      dataIndex: "sales",
      width: 120,
      sorter: true,
    },
    {
      title: "Quantity Sold",
      dataIndex: "quantitySold",
      width: 120,
      sorter: true,
    },
  ];

  useEffect(() => {
    // Affiche la liste des produits vendus aujourd'hui
    console.log("LastSales useEffect triggered");
    fetch("http://localhost:3000/products/allProducts")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.allProducts);

        const currentDate = new Date();
        const date = currentDate.getDate().toString().padStart(2, "0");
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const year = currentDate.getFullYear().toString();

        const todayDateString = `${year}-${month}-${date}`;
        // console.log(todayDateString)

        let filteredProducts = data.allProducts.filter((product) => {
          let soldDates = product.soldAt.map((sale) => sale.date.split("T")[0]);
          console.log(soldDates);
          return soldDates.includes(todayDateString);
        });

        let formattedData = filteredProducts.map((product,index) => {

          const history = [
            product.soldAt.map((sale) => ({
              type: "vendu le",
              quantity: sale.quantity,
              date: new Date(sale.date).toLocaleString(),
            })),
            product.restockAt.map((restock) => ({
              type: "restock le",
              quantity: restock.quantity,
              date: new Date(restock.date).toLocaleString(),
            })),
          ];
  
          return {
            key: index,
            product: product.name,
            category: product.category[0]?.name || "N/A",
            date: todayDateString,
            stock: product.stock,
            quantitySold: product.soldAt.reduce(
              (total, sale) => total + sale.quantity,
              0
            ),
            sales: product.soldAt.length,
            history: history,
          };
        
        });
        
        // console.log(formattedData);
        setDisplayProducts(formattedData);
      });
  }, [refresh]);
  const tableStyle = {
   
    backgroundColor: '#213F62',
    border: '2px solid #000',
    
  };


  const handleAddStockButtonClick = () => {
    setOpenAddStockModal(true);
  };

  const handleSaleButtonClick = () => {
    setSaleModal(true);
  };

  const handleCloseButton = () => {
    setOpenAddStockModal(false);
    setSaleModal(false);
  };


  return (
    <main className={styles.main}>
      <h1>Welcome</h1>
      <div className={styles.productButton}>
        <button
          className={styles.addProduct}
          onClick={handleAddStockButtonClick}
        >
          ADD STOCK
        </button>

        <button className={styles.saleProduct} onClick={handleSaleButtonClick}>
          SALE PRODUCTS
        </button>
      </div>
      <div className={styles.sale}>
      <div className={styles.sales}>
      <div className={styles.tableContainer}>
        <Table
          className={styles.Table}
          dataSource={displayProducts}
          columns={columns}
          pagination={{ pageSize: 10 }}
          size="large"
          style={tableStyle}
          expandable={{
            expandedRowRender: (record) => (
              <ul>
                {record.history.map((operation, index) => (
                  <li key={index}>
                    {`${operation.type} ${operation.quantity} on ${operation.date}`}
                  </li>
                ))}
              </ul>
            ),
            rowExpandable: (record) => record.history.length > 0,
          }}
        />
      </div>
    </div>
      </div>
      
      {openAddStockModal && (
        <AddStock
          openAddStockModal={openAddStockModal}
          handleCloseButton={handleCloseButton}
          refreshLastSale ={refreshLastSale}
          refresh={refresh}
        />
      )}
      {openSaleModal && (
        <Sale
          openSaleModal={openSaleModal}
          handleCloseButton={handleCloseButton}
        />
      )}
    </main>
  );
}

export default Home;
