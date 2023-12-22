import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import AddStock from "./AddStock";
import Sale from "./Sale";
import { Table } from "antd";
import FilterDate from "./Tools/FilterDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import {
  faMinus,
  faExclamation,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

// Importe CategoryScale de Chart.js pour la mise à l'échelle des catégories sur les graphiques.
import { CategoryScale } from "chart.js";
// Enregistre CategoryScale pour une utilisation avec Chart.js.
Chart.register(CategoryScale);
// Importe la version automatique de Chart.js qui sélectionne automatiquement le contrôleur de graphique et l'échelle.
import Chart from "chart.js/auto";
// Importe le composant Bar de react-chartjs-2 pour la création de graphiques à barres.
import { Bar } from "react-chartjs-2";

function Home() {
  const user = useSelector((state) => state.user.value);
  const router = useRouter();
  const [openAddStockModal, setOpenAddStockModal] = useState(false);
  const [openSaleModal, setSaleModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [filter, setFilter] = useState("Today");
  const [myProducts, setMyProducts] = useState([]); // affichage des produits

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
    },
    {
      title: "Category",
      width: 120,
      dataIndex: "category",
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
      sorter: (a, b) => a.stock - b.stock,
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
      render: (text) => (
        <span className={text <= 20 ? "low-stock" : "good-Stock"}>{text}</span>
      ),
    },
    {
      title: "Number of sales",
      dataIndex: "sales",
      width: 120,
      sorter: (a, b) => a.sales - b.sales,
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
    },
    {
      title: "Quantity Sold",
      dataIndex: "quantitySold",
      width: 120,
      sorter: (a, b) => a.quantitySold - b.quantitySold,
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
    },
  ];

  function convertirFormatDate(dateStr) {
    const dateObj = new Date(dateStr);

    const jour = dateObj.getDate().toString().padStart(2, "0");
    const mois = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const annee = dateObj.getFullYear();

    const dateFormatee = `${jour}/${mois}/${annee}`;

    return dateFormatee;
  }

  useEffect(() => {
    fetch("https://stockify-backend-wheat.vercel.app/products/allProducts")
      .then((response) => response.json())
      .then((data) => {
        const currentDate = new Date();
        const date = currentDate.getDate().toString();
        const month = (currentDate.getMonth() + 1).toString();
        const year = currentDate.getFullYear().toString();

        const todayDateString = `${year}-${month}-${date}`;
        const todayDateFR = `${date}/${month}/${year}`;

        let filteredProducts = data.allProducts.filter((product) => {
          let soldDates = product.soldAt.map((sale) => sale.date.split("T")[0]);
          return soldDates.includes(todayDateString);
        });

        let formattedData = filteredProducts.map((product, index) => {
          const todaySales = product.soldAt.filter(
            (sale) => sale.date.split("T")[0] === todayDateString
          );

          const soldHistory = [
            product.soldAt
              ? product.soldAt.map((sale) => ({
                  type: "sold",
                  quantity: sale.quantity,
                  date: convertirFormatDate(sale.date),
                }))
              : [],
          ];

          const restockHistory = [
            product.restockAt
              ? product.restockAt.map((restock) => ({
                  type: "restock",
                  quantity: restock.quantity,
                  date: convertirFormatDate(restock.date),
                }))
              : [],
          ];

          const historyExtended = soldHistory
            .concat(restockHistory)
            .flat()
            .sort((a, b) => {
              const dateA = a.date.split("/").reverse().join("");
              const dateB = b.date.split("/").reverse().join("");
              return parseInt(dateB) - parseInt(dateA);
            });

          const history = [];
          for (let i = 0; i < historyExtended.length; i++) {
            let found = false;

            for (let j = 0; j < history.length; j++) {
              if (
                historyExtended[i].type === history[j].type &&
                historyExtended[i].date === history[j].date
              ) {
                history[j].quantity += historyExtended[i].quantity;
                found = true;
                break;
              }
            }

            if (!found) {
              history.push(historyExtended[i]);
            }
          }

          return {
            key: index,
            product: product.name,
            category: product.category[0]?.name || "N/A",
            date: todayDateFR,
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
  }, [refresh, filter]);

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

  /* Statistics Graph Chart */
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // const handleFilterDateChange = (filter) => {
  //   setFilter(filter);
  // };

  // Fetch data from the server for Stock at present day
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(
          "https://stockify-backend-wheat.vercel.app/products/stocksAtDay"
        );
        const data = await response.json();

        if (data && data.stocksAtDay) {
          const chartData = {
            labels: data.stocksAtDay.map((stock) => stock.productName),
            datasets: [
              {
                label: "Stock",
                data: data.stocksAtDay.map((stock) => stock.currentStock),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          };
          setChartData(chartData);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
  }, [refresh, filter, setChartData]);

  console.log(chartData);

  useEffect(() => {
    fetch("https://stockify-backend-wheat.vercel.app/products/allProducts")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.allProducts);
        if (data.allProducts && data.allProducts.length > 0) {
          setSelectedProduct(data.allProducts[0]._id);
        }
      });
  }, []);

  // Bar chart component
  function BarChart({ chartData, yAxisLegend }) {
    if (chartData && chartData.datasets) {
      return (
        <Bar
          data={chartData}
          options={{
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: yAxisLegend,
                },
                ticks: {
                  color: "white",
                },
                grid: {
                  color: "#232323",
                },
              },
              x: {
                ticks: {
                  color: "white",
                },
                grid: {
                  color: "#232323",
                },
              },
            },
          }}
        />
      );
    } else {
      return <p>No data available for the chart.</p>;
    }
  }

  useEffect(() => {
    // pour lister les produits à droite
    fetch("https://stockify-backend-wheat.vercel.app/products/allProducts")
      .then((response) => response.json())
      .then((data) => {
        let productsSold = [];
        for (let i = 0; i < data.allProducts.length; i++) {
          let sum = 0;
          for (let j = 0; j < data.allProducts[i].soldAt.length; j++) {
            sum += data.allProducts[i].soldAt[j].quantity;
          }
          productsSold.push({
            name: data.allProducts[i].name,
            quantitySold: sum,
            stock: data.allProducts[i].stock,
          });
        }
        productsSold = productsSold.sort(
          (a, b) => b.quantitySold - a.quantitySold
        );

        let topTenProducts = productsSold;
        if (productsSold.length > 10) {
          topTenProducts = productsSold.slice(0, 10);
        }
        setMyProducts(topTenProducts);
      });
  }, [refresh]);

  return (
    <main className={styles.main}>
      <div className={styles.mainContent}>
        <div className={styles.leftSection}>
          <div className={styles.productButton}>
            <div className={styles.groupButtons}>
              {/* <div className={styles.product}> Add stock</div>
              <div className={styles.product}> Sale product</div> */}
              <button
                className={styles.addProduct}
                onClick={handleAddStockButtonClick}
              >
                {" "}
                Add stock{" "}
              </button>
              <button
                className={styles.saleProduct}
                onClick={handleSaleButtonClick}
              >
                {" "}
                Sale Products{" "}
              </button>
            </div>
            <div className={styles.dateFilter}>
              <p className={styles.todaySales}>Today's sales</p>
            </div>
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
                    expandedRowRender: (record) => {
                      return (
                        <ul>
                          <div
                            style={{ maxHeight: "20rem", overflowY: "auto" }}
                          >
                            {record.history.map(
                              (operationGroup, groupIndex) => (
                                <li key={groupIndex}>
                                  {operationGroup.type &&
                                  operationGroup.quantity &&
                                  operationGroup.date
                                    ? `${operationGroup.date.split(" ")[0]}: ${
                                        operationGroup.quantity
                                      } ${operationGroup.type}`
                                    : ""}
                                </li>
                              )
                            )}
                          </div>
                        </ul>
                      );
                    },
                    rowExpandable: (record) => record.history.length > 0,
                  }}
                />
              </div>
            </div>
          </div>
          {/* GRAPH SECTION */}
          <div>
            <div className={styles.firstChart}>
              <h2>Stock Statistics</h2>
              <BarChart chartData={chartData} yAxisLegend="Quantité en stock" />
            </div>
          </div>
          {/* END GRAPH SECTION */}
        </div>

        <div className={styles.rightSection}>
          <div className={styles.productList}>
            <h2 className={styles.productsTitle}> Top 10 products </h2>
            <div className={styles.rightProductsContainer}>
              {myProducts.length === 0 ? (
                <p>No products</p>
              ) : (
                myProducts.map((data, i) => {
                  return (
                    <div
                      key={i}
                      className={`${styles.product} ${styles[data.stockClass]}`}
                    >
                      <div className={styles.dataContainer}>
                        {data.name} - {data.stock} in stock
                      </div>

                      <div>
                        <div className={styles.iconContainer}>
                          {data.stock < 20 && (
                            <div className={styles.iconWrapper}>
                              <FontAwesomeIcon
                                icon={faExclamation}
                                size="xl"
                                color="red"
                                fade
                                className={`${styles.alertIcon} ${styles.iconEffect}`}
                              />
                              <FontAwesomeIcon
                                icon={faCircle}
                                size="xl"
                                color="red"
                                fade
                                className={`${styles.alertIcon} ${styles.iconEffectBKGalert}`}
                              />
                            </div>
                          )}
                        </div>
                        {/* <div className={styles.iconContainer}>
                          {data.stock >= 20 && data.stock < 50 && (
                            <div className={styles.iconWrapper}>
                              <FontAwesomeIcon
                                icon={faMinus}
                                size="xl"
                                color="yellow"
                                className={`${styles.warningIcon} ${styles.iconEffect}`}
                              />
                              <FontAwesomeIcon
                                icon={faCircle}
                                size="xl"
                                color="yellow"
                                className={`${styles.warningIconIcon} ${styles.iconEffectBKGwarning}`}
                              />
                            </div>
                          )}
                        </div> */}
                        {/* <div className={styles.iconContainer}>
                          {data.stock >= 50 && (
                            <div className={styles.iconWrapper}>
                              <FontAwesomeIcon
                                icon={faCheck}
                                size="xl"
                                color="green"
                                className={`${styles.okIcon} ${styles.iconEffect}`}
                              />
                              <FontAwesomeIcon
                                icon={faCircle}
                                size="2xl"
                                color="green"
                                className={`${styles.okIcon} ${styles.iconEffectBKGok}`}
                              />
                            </div>
                          )}
                        </div> */}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
