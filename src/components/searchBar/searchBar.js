import React, { use } from "react";
import { useState, useEffect } from "react";
import styles from "./searchBar.module.css";

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };
  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm]);

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Search tracks..."
      />
    </div>
  );
}
