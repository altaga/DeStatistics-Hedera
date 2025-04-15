"use client";
import styles from "@/app/statistics/[db]/components/chart.module.css";
import { baseStat } from "@/utils/constants";
import ContextModule from "@/utils/contextModule";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { BarChart } from "@mui/x-charts/BarChart";
import React, { useEffect, useState } from "react";
import ShareIcon from "@mui/icons-material/Share";
import { useRouter } from "next/navigation";

export default function SimpleCharts({ data }) {
  const myContext = React.useContext(ContextModule);
  const [selector, setSelector] = useState(0);
  const [version, setVersion] = useState(0); // Based on position
  const [checked, setChecked] = useState(false);
  const [dataset, setDataset] = useState(baseStat);
  const router = useRouter();

  // Context Updater
  useEffect(() => {
    if (JSON.stringify(data) === "{}") return;
    if (!checked) {
      myContext.setValue({
        data: baseStat,
      });
    } else {
      myContext.setValue({
        data: {
          uploader: data.uploader,
          description: data.description,
          columns: data.data[version].rows,
          row: data.data[version].columns[selector],
          dbKey: data.data[version].columnKey,
          data: data.data[version].data[selector].map((row) => row),
        },
      });
    }
  }, [selector, checked, version, data]);

  // Version Updater

  useEffect(() => {
    if (JSON.stringify(data) === "{}") return;
    setDataset(data.data[version]);
  }, [version, data]);

  useEffect(() => {
    if (JSON.stringify(data) === "{}") return;
    setVersion(data.version - 1);
  }, [data]);

  useEffect(() => {
    return () => {
      myContext.setValue({
        data: baseStat,
      });
    };
  }, []);

  return (
    <React.Fragment>
      <div className={styles.headerTitle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {(data?.version ?? 1) > 1 ? (
            <ShareIcon
              onClick={() => router.push(`/versions/${data.key}`)}
              fontSize="medium"
              style={{ cursor: "pointer" }}
            />
          ) : null}
          <Select
            sx={{ color: "black" }}
            labelId="data-select-label"
            id="data-select"
            value={version}
            onChange={(event) => setVersion(event.target.value)}
          >
            {Array.from({ length: data?.version ?? 1 }).map((_, index) => (
              <MenuItem key={index} value={index}>
                Version {index + 1}
              </MenuItem>
            ))}
          </Select>
        </div>
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
          <FormControlLabel
            className={styles.includeDB}
            control={
              <Checkbox
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
              />
            }
            label="Include DB"
          />
        </div>
      </div>
      <div className={styles.chartSubContainer}>
        <BarChart
          xAxis={[{ scaleType: "band", data: dataset.rows }]}
          series={[{ data: dataset.data[selector].map((row) => row) }]}
          width={550}
          height={360}
        />
      </div>
    </React.Fragment>
  );
}
