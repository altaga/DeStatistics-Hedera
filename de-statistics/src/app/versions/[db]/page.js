import { getDB } from "@/actions/recallServer";
import SimpleCharts from "@/app/versions/[db]/components/chart";
import styles from "@/app/versions/[db]/page.module.css";
import ReactDiff from "./components/reactDiff";

/*
// Example Ethereum address
const ethAddress = "0x4bb24Db28959248E00792aDAF04a8EB32C5AB3Ef";

// Derive the Filecoin address (f4 address) from the Ethereum address
const filecoinAddress = newDelegatedEthAddress(ethAddress);

console.log(`Ethereum Address: ${ethAddress}`);
console.log(`Filecoin Address: ${filecoinAddress.toString()}`);
*/

export const revalidate = 60; // Check every 60 seconds for updates
export const dynamicParams = true; // Dynamically generate params

export async function generateStaticParams() {
  const res = await fetch(process.env.RECALL_URL);
  const posts = await res.json();
  return posts.data.map((post) => ({
    db: post.key,
  }));
}

export default async function Statistic({ params }) {
  // Get Statistic Server Side
  const { db } = await params;
  const data = await getDB(db);

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.title}>
          {" "}
          {data.title} {"->"} {data.description}
        </div>
        <div className={styles.subContainer2}>
          <div className={styles.chartContainer}>
            <SimpleCharts keys={0} data={data} />
          </div>
          <div className={styles.chartContainer}>
            <SimpleCharts keys={1} data={data} />
          </div>
        </div>
        <div className={styles.title2}>
          Version Comparison
        </div>
        <div className={styles.versionContainer}>
          <ReactDiff code={data.contents}/>
        </div>
      </div>
    </div>
  );
}
