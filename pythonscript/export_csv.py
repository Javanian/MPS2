import os
import pandas as pd
import psycopg2
from filelock import FileLock, Timeout

LOCK_FILE = "/tmp/sow_export.lock"
EXPORT_DIR = "/data/export"

os.makedirs(EXPORT_DIR, exist_ok=True)

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

        query = """
        SELECT order_no, ssbr_id, part_name,
               operationtext, operation_no,
               planhours, workcenter
        FROM sow
        ORDER BY order_no, operation_no
        """

        df = pd.read_sql(query, conn)
        conn.close()

        for order_no, g in df.groupby("order_no"):
            ssbr_id = g.ssbr_id.iloc[0]
            part = g.part_name.iloc[0].replace(" ", "_").replace("/", "-")
            filename = f"{order_no}_{ssbr_id}_{part}.csv"

            g[[
                "order_no",
                "ssbr_id",
                "operationtext",
                "operation_no",
                "planhours",
                "workcenter"
            ]].to_csv(f"{EXPORT_DIR}/{filename}", index=False)

            print("✔ exported", filename)

        print("✅ Export finished")

except Timeout:
    print("⏳ Another export is still running. Skipping this run.")
