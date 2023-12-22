// Importe la bibliothèque React.
import React from "react";
// Importe les styles CSS pour la page des statistiques.
import styles from "../styles/StatsPage.module.css";
// Importe les hooks useEffect, useState et useRef de React.
import { useEffect, useState, useRef } from "react";
// Importe le hook useSelector de Redux pour accéder à l'état du store.
import { useSelector } from "react-redux";
// Importe le hook useRouter de Next.js pour la gestion des routes.
import { useRouter } from "next/router";

// Importe CategoryScale de Chart.js pour la mise à l'échelle des catégories sur les graphiques.
import { CategoryScale } from "chart.js";
// Enregistre CategoryScale pour une utilisation avec Chart.js.
Chart.register(CategoryScale);
// Importe la version automatique de Chart.js qui sélectionne automatiquement le contrôleur de graphique et l'échelle.
import Chart from "chart.js/auto";
// Importe l'adaptateur date-fns pour Chart.js pour la gestion des dates.
import "chartjs-adapter-date-fns";
// Importe le composant Bar de react-chartjs-2 pour la création de graphiques à barres.
import { Bar } from "react-chartjs-2";
// Importe le composant Line de react-chartjs-2 pour la création de graphiques linéaires.
import { Line } from "react-chartjs-2";

// Importe des fonctions de transformation de données spécifiques.
import transformDataSell from "./transformDataSell";
import transformDataStock from "./transformDataStock";
import transformDataRestock from "./transformDataRestock";
import transformDataByP from "./transformDataByP";

function StatsPage() {
  // Get the router object from the 'next/router' module
  const router = useRouter();

  // Get the current user object from the Redux state
  const user = useSelector((state) => state.user.value);

  // USER TOKEN
  // If the user does not have a token, redirect them to the home page
  useEffect(() => {
    if (!user.token) {
      router.push("/");
    }
  }, [user.token, router]);

  // FILTERING BY TIME
  // State for time filter, default is 'day'
  const [timeFilter, setTimeFilter] = useState("day");

  // Function to handle changes in time selection
  const handleTimeSelectChange = (event) => {
    setTimeFilter(event.target.value);
  };

  // RENDERING BY TIME
  // State for date, default is current date
  const [date, setDate] = useState(new Date());

  // FETCHING ALL DATA
  // State for category filter, default is 'all'
  const [categoryState, setCategoryState] = useState({
    category: [],
    categoryId: "all",
  });

  // State for filter, default is 'categories'
  const [filter, setFilter] = useState("categories");

  // State for data loading status, default is false
  const [dataLoaded, setDataLoaded] = useState(false);

  // State for chart data
  const [chartData, setChartData] = useState([]);
  const [secondChartData, setSecondChartData] = useState([]); // New state for stock chart
  const [restockChartData, setRestockChartData] = useState([]); // New state for restock chart
  const [isLoading, setIsLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const chartRef = useRef(null); // Créez une référence ici

  // Fetch data from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories
        const responseCategories = await fetch(
          "https://stockify-backend-wheat.vercel.app/categories/allCategories"
        );
        const dataCategories = await responseCategories.json();
        // Update the category state with the fetched categories
        setCategoryState((prevState) => ({
          ...prevState,
          category: dataCategories.allCategories,
        }));

        // Fetch all products
        const responseProducts = await fetch(
          "https://stockify-backend-wheat.vercel.app/products/allProducts"
        );
        const dataProducts = await responseProducts.json();

        // Filter products based on selected category
        let filteredProducts;
        if (categoryState.categoryId === "all") {
          filteredProducts = dataProducts.allProducts;
        } else {
          filteredProducts = dataProducts.allProducts.filter((product) =>
            product.category.some(
              (category) => category._id === categoryState.categoryId
            )
          );
        }

        // Transform data for selling chart
        const transformedDataSell = transformDataSell(
          filteredProducts,
          filter,
          timeFilter
        );
        setChartData({ ...transformedDataSell });

        // Transform data for stock chart
        const transformedDataStock = transformDataStock(
          filteredProducts,
          filter,
          timeFilter
        );
        setSecondChartData({ ...transformedDataStock });

        // Transform data for restock chart
        const transformedDataRestock = transformDataRestock(
          filteredProducts,
          filter,
          timeFilter
        );
        setRestockChartData({ ...transformedDataRestock });

        setIsLoading(false);
        setDataLoaded(true); // Data has been loaded
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        setDataLoaded(true); // An error occurred
      }
    };

    fetchData();
    // This effect runs when 'filter', 'categoryState.categoryId', or 'timeFilter' changes
  }, [filter, categoryState.categoryId, timeFilter]);

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

  const [timeFilterByP, setTimeFilterByP] = useState("day");
  const [productData, setProductData] = useState(null);

  const handleTimeSelectChangeByP = (event) => {
    setTimeFilterByP(event.target.value);
  };

  useEffect(() => {
    if (products.length > 0 && selectedProduct) {
      let product = products.find((p) => p._id === selectedProduct);
      setProductData(transformDataByP(product, timeFilterByP));
    }
    //Dépendances
  }, [products, selectedProduct, timeFilterByP]);

  // State pour l'option de légende
  const [yAxisLegend, setYAxisLegend] = useState("");

  // Bar chart component
  function BarChart({ chartData, yAxisLegend }) {
    // If there are no labels, return a message
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
                  text: yAxisLegend, // Utilisation de la prop pour la légende de l'axe Y
                },
                ticks: {
                  color: "white", // Change la couleur du texte de l'axe y en blanc
                },
                grid: {
                  color: "#232323", // Change la couleur des lignes d'axe pour l'axe x
                },
              },
              x: {
                ticks: {
                  color: "white", // Change la couleur du texte de l'axe x en blanc
                },
                grid: {
                  color: "#232323", // Change la couleur des lignes d'axe pour l'axe x
                },
              },
              // ... Autres configurations de l'axe Y
            },
            // ... Autres options pour le graphique
          }}
        />
      );
    } else {
      return <p>No data available for the chart.</p>;
    }
  }

  useEffect(() => {
    // ... Votre logique pour récupérer ou transformer les données du graphique

    // Mettre à jour la légende de l'axe Y avec "quantité"
    setYAxisLegend("Quantité");
  }, [chartData]); // Assurez-vous de mettre à jour lorsque les données du graphique changent

  // If data is not loaded, show a loading indicator
  if (!dataLoaded) {
    // You can render a loading spinner or another loading indicator here
    return <div>Loading...</div>;
  }

  function LineChart({ chartData }) {
    if (chartData && chartData.datasets) {
      return (
        <Line
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
                  color: "white", // Change la couleur du texte de l'axe y en blanc
                },
                grid: {
                  color: "#232323", // Change la couleur des lignes d'axe pour l'axe x
                },
              },
              x: {
                ticks: {
                  color: "white", // Change la couleur du texte de l'axe x en blanc
                },
                grid: {
                  color: "#232323", // Change la couleur des lignes d'axe pour l'axe x
                },
              },
            },
          }}
        />
      );
    } else {
      return <p>Pas de données disponibles pour le graphique.</p>;
    }
    //return <Line data={chartData} />;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.titleContainer}></div>

      <div className={styles.filterContainer}>
        <div className={styles.filterArea}>
          <div className={styles.filterByTemp}>
            <p>Filter by Temps</p>
            <select onChange={handleTimeSelectChange}>
              <option value="day">Par Jour</option>
              <option value="week">Par Semaine</option>
              <option value="month">Par Mois</option>
            </select>
          </div>
          <div className={styles.filterByObject}>
            <p>Filter by Object</p>
            <select onChange={(e) => setFilter(e.target.value)}>
              <option value="categories">Catégories</option>
              <option value="products">Produits</option>
            </select>
          </div>
        </div>
      </div>
      <div className={styles.statsContainer}>
        <div className={styles.secondChart}>
          <h2>Current Stock Statistics</h2>
          {!isLoading && (
            <BarChart
              className={styles.firstChartCl}
              chartData={chartData}
              yAxisLegend={yAxisLegend} // Prop pour l'option de légende
            />
          )}
        </div>
        <div className={styles.thirdChart}>
          <h2>Restock statistics</h2>
          {!isLoading && (
            <BarChart
              className={styles.firstChartCl}
              chartData={chartData}
              yAxisLegend={yAxisLegend} // Prop pour l'option de légende
            />
          )}
        </div>
        <div className={styles.firstChart}>
          <h2>Sales Statistics</h2>
          {!isLoading && (
            <BarChart
              className={styles.firstChartCl}
              chartData={chartData}
              yAxisLegend={yAxisLegend} // Prop pour l'option de légende
            />
          )}
        </div>
      </div>
      <div className={styles.chartByP}>
        <div className={styles.chartByPTitle}>
          <h2>Statistics by product</h2>
        </div>
        <div>
          <div className={styles.filters}>
            <div className={styles.filterByTemp}>
              <p>Filter by Temps</p>
              <select onChange={handleTimeSelectChangeByP}>
                <option value="day">Par Jour</option>
                <option value="week">Par Semaine</option>
                <option value="month">Par Mois</option>
              </select>
            </div>
            <div className={styles.filterByObject}>
              <p>Filter by Object</p>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.chartByProduct}>
            {!isLoading && <LineChart chartData={productData} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
