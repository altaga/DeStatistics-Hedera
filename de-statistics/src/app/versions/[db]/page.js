import SimpleCharts from "@/app/versions/[db]/components/chart";
import styles from "@/app/versions/[db]/page.module.css";
import ReactDiff from "./components/reactDiff";
import { getAllFetch, getDB } from "@/actions/hederaServer";

export const revalidate = 3600; // Check every 60 seconds for updates
export const dynamicParams = true; // Dynamically generate params

export async function generateStaticParams() {
  const posts = await getAllFetch();
  return posts.map((post) => ({
    db: post.key,
  }));
}

export default async function Versions({ params }) {
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
