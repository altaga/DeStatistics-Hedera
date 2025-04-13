"use client";
import styles from "@/app/versions/[db]/components/chart.module.css";
import { baseStat } from "@/utils/constants";
import ContextModule from "@/utils/contextModule";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { BarChart } from "@mui/x-charts/BarChart";
import React, { useEffect, useState } from "react";

export default function SimpleCharts({ data, keys }) {
  const myContext = React.useContext(ContextModule);
  const [selector, setSelector] = useState(0);
  const [version, setVersion] = useState(0); // Based on position
  const [dataset, setDataset] = useState(baseStat);

  // Version Updater

  useEffect(() => {
    if (JSON.stringify(data) === "{}") return;
    setDataset(data.data[version]);
    if (keys === 0) {
      myContext.setValue({ version1: version });
    } else {
      myContext.setValue({ version2: version });
    }
  }, [version, data, keys]);

  return (
    <React.Fragment>
      <div className={styles.headerTitle}>
        <Select
          sx={{ color: "black" }}
          labelId="data-select-label"
          id="data-select"
          value={version}
          onChange={(event) => setVersion(event.target.value)}
        >
          {Array.from({ length: data?.version??1 }).map((_, index) => (
            <MenuItem key={index} value={index}>
              Version {index + 1}
            </MenuItem>
          ))}
        </Select>
        <div>
          {dataset.rowKey}:<span style={{ marginLeft: "10px" }} />
          <Select
            sx={{ color: "black" }}
            labelId="data-select-label"
            id="data-select"
            value={selector}
            onChange={(event) => setSelector(event.target.value)}
          >
            {dataset.columns.map((column, index) => (
              <MenuItem key={index} value={index}>
                {column}
              </MenuItem>
            ))}
          </Select>{" "}
        </div>
      </div>
      <div className={styles.chartSubContainer}>
        <BarChart
          xAxis={[{ scaleType: "band", data: dataset.rows }]}
          series={[{ data: dataset.data[selector].map((row) => row) }]}
          width={500}
          height={360}
        />
      </div>
    </React.Fragment>
  );
}
