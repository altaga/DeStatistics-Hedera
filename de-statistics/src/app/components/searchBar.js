"use client";
import styles from "@/app/page.module.css";
import { Autocomplete, TextField } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ data }) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  return (
    <React.Fragment>
      <div className={styles.searchBarContainer}>
        <Autocomplete
          onChange={(_, value) => {
            if (value) {
              setSelected(data.filter((item) => item.title === value)[0].key);
            } else {
              setSelected(null);
            }
          }}
          className={styles.searchBar}
          id="autocomplete"
          freeSolo
          options={data.map((option) => option.title)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                data === undefined || data === null ? "Loading..." : "Search"
              }
            />
          )}
        />
        <button
          onClick={() => {
            if (selected) {
              router.push(`/statistics/${selected}`);
            }
          }}
          className={styles.searchButton}
        >
          Search
        </button>
      </div>
      <div className={styles.buttonsContainer}>
        {data.slice(0, 10).map((topic, index) => (
          <button
            onClick={() => router.push(`/statistics/${topic.key}`)}
            key={index}
            className={styles.topicButton}
          >
            {topic.title}
          </button>
        ))}
      </div>
    </React.Fragment>
  );
}
