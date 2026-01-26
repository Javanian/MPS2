import os
import time
import psycopg2
import pandas as pd
import numpy as np
import streamlit as st
import plotly.graph_objects as go

# ---------------- CONFIG ----------------
st.set_page_config(
    page_title="SPC Dashboard",
    layout="wide",
)

REFRESH_SEC = 5

# ---------------- DB CONNECTION ----------------
@st.cache_resource
def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )

conn = get_connection()

# ---------------- DATA QUERY ----------------
@st.cache_data(ttl=REFRESH_SEC)
def load_data():
    query = """
        SELECT
            pcd.createddate,
            pcd.machineid,
            pci.parameter_name,
            pci.value::float AS value
        FROM processcontroldata_item pci
        JOIN processcontroldata pcd
            ON pci.id_processcontroldata = pcd.id_processcontroldata
        WHERE
            pci.isnumber = true
            AND pci.value ~ '^[0-9.]+$'
        ORDER BY pcd.createddate DESC
        LIMIT 500
    """
    return pd.read_sql(query, conn)

df = load_data()

# ---------------- UI ----------------
st.title("📊 SPC Realtime Dashboard")

if df.empty:
    st.warning("Belum ada data numerik")
    st.stop()

# Filters
machine = st.selectbox(
    "Machine",
    sorted(df["machineid"].dropna().unique())
)

parameter = st.selectbox(
    "Parameter",
    sorted(df["parameter_name"].unique())
)

df_f = df[
    (df["machineid"] == machine) &
    (df["parameter_name"] == parameter)
].sort_values("createddate")

# ---------------- SPC CALC ----------------
mean = df_f["value"].mean()
std = df_f["value"].std()

ucl = mean + 3 * std
lcl = mean - 3 * std

# ---------------- PLOT ----------------
fig = go.Figure()

fig.add_trace(go.Scatter(
    x=df_f["createddate"],
    y=df_f["value"],
    mode="lines+markers",
    name="Value"
))

fig.add_hline(y=mean, line_dash="dash", name="CL")
fig.add_hline(y=ucl, line_dash="dot", line_color="red", name="UCL")
fig.add_hline(y=lcl, line_dash="dot", line_color="red", name="LCL")

st.plotly_chart(fig, use_container_width=True)

# ---------------- METRIC ----------------
st.metric("Mean", f"{mean:.2f}")
st.metric("Std Dev", f"{std:.2f}")

# ---------------- AUTO REFRESH ----------------
time.sleep(REFRESH_SEC)
st.experimental_rerun()
