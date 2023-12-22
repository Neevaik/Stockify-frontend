import React, { useEffect, useState } from "react";
import { Select } from "antd";
import styles from "../../styles/FilterCascader.module.css";


const FilterCascader = (props) => {
  const [categoriesTab, setCatgoriesTab] = useState([]);
  const [categoriesTabObject, setCategoriersTabObject] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);


  useEffect(() => {
    fetch("https://stockify-backend-wheat.vercel.app/categories/allCategories")
      .then((response) => response.json())
      .then((data) => {
        let categories = [];
        let categoriesTabObject = [];
        for (let i = 0; i < data.allCategories.length; i++) {
          categories.push(data.allCategories[i].name);
          categoriesTabObject.push(data.allCategories[i]);
        }
        setCatgoriesTab(categories);
        setCategoriersTabObject(categoriesTabObject);
      });
  }, []);

  const filteredOptions = categoriesTab.filter(
    (e) => !selectedItems.includes(e)
  );

  const handleFilterChange = (selectedItems) => {
    setSelectedItems(selectedItems);
    props.handleFilterChange(selectedItems);
  };

  return (
      <Select
      mode="multiple"
      placeholder="Filter by category"
      value={selectedItems}
      onChange={handleFilterChange}
      style={{ width: '10rem' }}
      options={filteredOptions.map((item) => ({ value: item, label: item }))}
    />
    
  );
};

export default FilterCascader;
