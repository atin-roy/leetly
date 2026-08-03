import { Skeleton } from "@/components/ui/skeleton"
import styles from "./route-state.module.css"

/*
 * Covers the server-render gap only. Every page in the shell fetches on the
 * client and shows its own shaped skeleton once mounted, so this stays generic
 * — matching one page's layout would misrepresent the other five.
 */
export default function AppLoading() {
  return (
    <div className={styles.loading}>
      <Skeleton className={styles.loadingHeader} />
      <Skeleton className={styles.loadingBlock} />
      <Skeleton className={styles.loadingStrip} />
    </div>
  )
}
