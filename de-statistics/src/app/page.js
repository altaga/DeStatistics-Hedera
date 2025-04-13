import styles from "@/app/page.module.css";
import SearchBar from "./components/searchBar";
import { unstable_cache } from "next/cache";
import { getAllFetch } from "@/actions/hederaServer";

const getAllDBs = unstable_cache(
  async () => {
    console.log("Fetching data...");
    return await getAllFetch();
  },
  ["posts"],
  { revalidate: parseInt(process.env.REVALIDATE), tags: ["posts"] } // Cache for 1 hour
);

export default async function Main() {
  const data = await getAllDBs();
  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>
            Empowering <span className={styles.titleSoft}>human knowledge</span>
          </div>
          <div className={styles.titleMiniSoft}>
            through decentralization and cutting-edge AI
          </div>
        </div>
        <SearchBar data={data} />
      </div>
    </div>
  );
}
