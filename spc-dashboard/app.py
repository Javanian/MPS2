import os
import asyncio
import threading
from collections import deque
from datetime import datetime

import pandas as pd
import streamlit as st
import plotly.graph_objects as go
import asyncpg

# ===================== CONFIG =====================
REFRESH_DB_SECONDS = 10
UI_REFRESH_MS = 1000
MAX_POINTS = 1000

# ===================== SHARED STATE =====================
DATA_BUFFER = deque(maxlen=MAX_POINTS)
DATA_LOCK = threading.Lock()

# ===================== ASYNC DB =====================
async def create_pool():
    return await asyncpg.create_pool(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        database=os.getenv("DB_NAME", "manufacturing"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        min_size=1,
        max_size=3
    )

async def fetch_spc_data(pool):
    query = """
    SELECT
        pcd.createddate,
        pcd.machineid,
        pcd.validation_status,
        pp.parameter_name,
        pci.value::float AS numeric_value
    FROM processcontroldata pcd
    JOIN processcontroldata_item pci
        ON pcd.id_processcontroldata = pci.id_processcontroldata
    JOIN process_parameter pp
        ON pci.id_parameter = pp.id_parameter
    WHERE
        pci.isnumber = true
        AND pci.value ~ '^[0-9.]+$'
        AND pcd.createddate >= NOW() - INTERVAL '1 hour'
    ORDER BY pcd.createddate DESC
    LIMIT 500;
    """
    async with pool.acquire() as conn:
        return await conn.fetch(query)

# ===================== BACKGROUND WORKER =====================
async def spc_background_worker():
    pool = await create_pool()

    while True:
        try:
            rows = await fetch_spc_data(pool)

            with DATA_LOCK:
                DATA_BUFFER.clear()
                for r in rows:
                    DATA_BUFFER.append(dict(r))

        except Exception as e:
            print("Worker error:", e)

        await asyncio.sleep(REFRESH_DB_SECONDS)

def start_worker_once():
    if "worker_started" not in st.session_state:
        st.session_state.worker_started = True

        def runner():
            asyncio.run(spc_background_worker())

        threading.Thread(
            target=runner,
            daemon=True
        ).start()

# ===================== DATA ACCESS =====================
def get_realtime_df():
    with DATA_LOCK:
        if not DATA_BUFFER:
            return pd.DataFrame()
        return pd.DataFrame(list(DATA_BUFFER))

# ===================== SPC FIGURE =====================
def init_spc_figure():
    fig = go.Figure()
    fig.add_scatter(
        x=[],
        y=[],
        mode="lines+markers",
        name="SPC Value",
        line=dict(width=2)
    )
    return fig

# ===================== STREAMLIT APP =====================
def main():
    st.set_page_config(
        page_title="Realtime SPC Dashboard",
        layout="wide"
    )

    start_worker_once()

    st.title("📈 Realtime SPC Dashboard (Async)")
    st.caption("True realtime • No reload • Async background worker")

    # ---------- Sidebar ----------
    with st.sidebar:
        st.header("Filter")
        df = get_realtime_df()
        param_list = sorted(df["parameter_name"].unique()) if not df.empty else []
        selected_param = st.selectbox(
            "Parameter",
            param_list
        )

        machine_list = sorted(df["machineid"].dropna().unique()) if not df.empty else []
        selected_machine = st.selectbox(
            "Machine",
            ["All"] + machine_list
        )

        st.markdown("---")
        st.caption(f"Last UI refresh: {datetime.now().strftime('%H:%M:%S')}")

    # ---------- Data Filter ----------
    if df.empty:
        st.warning("Waiting for realtime data...")
        st.stop()

    if selected_param:
        df = df[df["parameter_name"] == selected_param]

    if selected_machine != "All":
        df = df[df["machineid"] == selected_machine]

    df = df.sort_values("createddate")

    # ---------- SPC Chart ----------
    if "spc_fig" not in st.session_state:
        st.session_state.spc_fig = init_spc_figure()

    fig = st.session_state.spc_fig

    if not df.empty:
        mean_val = df["numeric_value"].mean()
        std_val = df["numeric_value"].std()

        fig.data[0].x = df["createddate"]
        fig.data[0].y = df["numeric_value"]

        fig.layout.shapes = []
        fig.add_hline(y=mean_val, line_dash="dash", line_color="green")
        fig.add_hline(y=mean_val + 3 * std_val, line_dash="dot", line_color="red")
        fig.add_hline(y=mean_val - 3 * std_val, line_dash="dot", line_color="red")

    fig.update_layout(
        height=500,
        xaxis_title="Time",
        yaxis_title="Value",
        hovermode="x unified"
    )

    st.plotly_chart(fig, use_container_width=True)

    # ---------- Stats ----------
    if not df.empty:
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Mean", f"{mean_val:.3f}")
        col2.metric("Std Dev", f"{std_val:.3f}")
        col3.metric("Samples", len(df))

        out_control = df[
            (df["numeric_value"] > mean_val + 3 * std_val) |
            (df["numeric_value"] < mean_val - 3 * std_val)
        ]
        col4.metric("Out of Control", len(out_control))

    # ---------- UI Refresh ----------
    st.autorefresh(interval=UI_REFRESH_MS, key="ui_refresh")

# ===================== ENTRY =====================
if __name__ == "__main__":
    main()
