import os
import re
import pandas as pd
import psycopg2
from filelock import FileLock, Timeout

LOCK_FILE = "/tmp/sow_export.lock"
EXPORT_DIR = "/data/export"

os.makedirs(EXPORT_DIR, exist_ok=True)

def safe_filename(value) -> str:
    value = str(value).strip()
    value = re.sub(r"[\/\\:*?\"<>|]", "-", value)
    value = re.sub(r"\s+", "_", value)
    return value

try:
    lock = FileLock(LOCK_FILE, timeout=1)
    with lock:
        print("🔒 Lock acquired, starting export")

        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "db"),
            port=os.getenv("DB_PORT", "5432"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )

        select_query = """
        SELECT
            order_no,
            ssbr_id,
            part_name,
            operationtext,
            operation_no,
            planhours,
            workcenter
        FROM sow
        WHERE sync <> 'update'
          AND order_no IS NOT NULL
        ORDER BY order_no, operation_no
        """

        df = pd.read_sql(select_query, conn)

        if df.empty:
            print("ℹ No new data to export")
            conn.close()
            exit(0)

        cursor = conn.cursor()

        for order_no, g in df.groupby("order_no"):
            order_no_safe = safe_filename(order_no)
            ssbr_id_safe = safe_filename(g.ssbr_id.iloc[0])
            part_safe = safe_filename(g.part_name.iloc[0])

            filename = f"{order_no_safe}_{ssbr_id_safe}_{part_safe}.csv"
            filepath = os.path.join(EXPORT_DIR, filename)

            # EXPORT CSV
            g[[
                "order_no",
                "ssbr_id",
                "operationtext",
                "operation_no",
                "planhours",
                "workcenter"
            ]].to_csv(filepath, index=False)

            print("✔ exported", filepath)

            # UPDATE sync -> update (SETELAH sukses export)
            cursor.execute(
                """
                UPDATE sow
                SET sync = 'update'
                WHERE order_no = %s
                """,
                (order_no,)
            )

        conn.commit()
        cursor.close()
        conn.close()

        print("✅ Export & sync update finished")

except Timeout:
    print("⏳ Another export is still running. Skipping this run.")

except Exception as e:
    print("❌ Error occurred:", e)
