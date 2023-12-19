import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import AddStock from "./AddStock";
import Sale from "./Sale";
import { Table } from "antd";



function Home() {
  const user = useSelector((state) => state.user.value);
  const router = useRouter();
  const [openAddStockModal, setOpenAddStockModal] = useState(false);
  const [openSaleModal, setSaleModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [displayProducts, setDisplayProducts] = useState([]);

  const refreshLastSale = () => {

    setRefresh((prevRefresh) => !prevRefresh);
  };

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

    fetch("http://localhost:3000/products/allProducts")
      .then((response) => response.json())
      .then((data) => {

        const currentDate = new Date();
        const date = currentDate.getDate().toString();
        const month = (currentDate.getMonth() + 1).toString();
        const year = currentDate.getFullYear().toString();

        const todayDateString = `${year}-${month}-${date}`;

        let filteredProducts = data.allProducts.filter((product) => {
          let soldDates = product.soldAt.map((sale) => sale.date.split("T")[0]);
          return soldDates.includes(todayDateString);
        });

        let formattedData = filteredProducts.map((product, index) => {
          const todaySales = product.soldAt.filter((sale) => sale.date.split("T")[0] === todayDateString);

          const history = [
            product.soldAt
              ? product.soldAt.map((sale) => ({
                  type: "vendu ",
                  quantity: sale.quantity,
                  date: new Date(sale.date).toLocaleDateString().split('/').reverse().join('/'),
                }))
              : [],
            product.restockAt
              ? product.restockAt.map((restock) => ({
                  type: "restock ",
                  quantity: restock.quantity,
                  date: new Date(restock.date).toLocaleDateString().split('/').reverse().join('/'),
                }))
              : [],
          ];

          return {
            key: index,
            product: product.name,
            category: product.category[0]?.name || "N/A",
            date: todayDateString,
            stock: product.stock,
            quantitySold: todaySales.reduce(
              (total, sale) => total + sale.quantity,
              0
            ),
            sales: todaySales.length,
            history: history,
          };
        });
       
        
        
        setDisplayProducts(formattedData);
     
        
      });
  }, [refresh]);



  const tableStyle = {
    backgroundColor: "#213F62",
    border: "2px solid #000",
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
          Add stock
        </button>

        <button className={styles.saleProduct} onClick={handleSaleButtonClick}>
          Sale Products
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
                  {record.history.map((operationGroup, groupIndex) => (
                    <li key={groupIndex}>
                      {operationGroup.map((operation, operationIndex) => (
                        <p key={operationIndex}>
                          {operation.type && operation.quantity && operation.date
                            ? `${operation.type} ${operation.quantity} le ${operation.date}`
                            : "Invalid operation data"}
                        </p>
                      ))}
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
          refreshLastSale={refreshLastSale}
          refresh={refresh}
        />
      )}
      {openSaleModal && (
        <Sale
          openSaleModal={openSaleModal}
          handleCloseButton={handleCloseButton}
          refreshLastSale={refreshLastSale}
        />
      )}
    </main>
  );
}

export default Home;
