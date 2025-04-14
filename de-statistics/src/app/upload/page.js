import { unstable_cache } from "next/cache";
import styles from "@/app/upload/page.module.css";
import Upload from "./components/uploadDB";
import { getAllFetch } from "@/actions/hederaServer";

const getAllDBs = unstable_cache(
  async () => {
    console.log("Fetching data...");
    return await getAllFetch();
  },
  ["posts"],
  { revalidate: 60, tags: ["posts"] }
);

export default async function Page() {
  const data = await getAllDBs();
  return (
    <div className={styles.fullContainer}>
      <div className={styles.container}>
        <Upload data={data} />
      </div>
    </div>
  );
}
