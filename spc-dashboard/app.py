import os
import psycopg2
import pandas as pd
import numpy as np
import streamlit as st
import plotly.graph_objects as go
from contextlib import contextmanager

# ---------------- CONFIG ----------------
st.set_page_config(
    page_title="SPC Dashboard",
    layout="wide",
)

REFRESH_SEC = 5

# ---------------- DB CONNECTION ----------------
@contextmanager
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "ptssb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "@dminta9"),
    )
    try:
        yield conn
    finally:
        conn.close()

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
            AND pci.value ~ '^[0-9]+\.?[0-9]*$'
            AND pci.value != ''
        ORDER BY pcd.createddate DESC
        LIMIT 500
    """
    with get_db_connection() as conn:
        return pd.read_sql(query, conn)

# ---------------- UI ----------------
st.title("📊 SPC Realtime Dashboard")

# Auto-refresh toggle
col1, col2 = st.columns([3, 1])
with col2:
    auto_refresh = st.checkbox("Auto Refresh", value=True)

df = load_data()

if df.empty:
    st.warning("Belum ada data numerik")
    st.stop()

# Filters
col1, col2 = st.columns(2)
with col1:
    machine = st.selectbox(
        "Machine",
        sorted(df["machineid"].dropna().unique())
    )

with col2:
    parameter = st.selectbox(
        "Parameter",
        sorted(df["parameter_name"].unique())
    )

df_f = df[
    (df["machineid"] == machine) &
    (df["parameter_name"] == parameter)
].sort_values("createddate").reset_index(drop=True)

if len(df_f) < 3:
    st.error("Data terlalu sedikit untuk SPC analysis")
    st.stop()

# ---------------- SPC CALC (Proper Subgroups) ----------------
subgroup_size = 5
n_subgroups = len(df_f) // subgroup_size

if n_subgroups == 0:
    st.warning(f"Data kurang dari {subgroup_size} untuk subgroup analysis")
    # Fallback to individual chart
    mean = df_f["value"].mean()
    std = df_f["value"].std()
    ucl = mean + 3 * std
    lcl = mean - 3 * std
    use_subgroups = False
else:
    # Calculate subgroups
    subgroups = []
    for i in range(n_subgroups):
        start = i * subgroup_size
        end = start + subgroup_size
        sg = df_f.iloc[start:end]["value"].values
        subgroups.append({
            'x_bar': np.mean(sg),
            'r': np.max(sg) - np.min(sg)
        })
    
    sg_df = pd.DataFrame(subgroups)
    x_double_bar = sg_df['x_bar'].mean()
    r_bar = sg_df['r'].mean()
    
    # Constants for n=5
    A2 = 0.577
    ucl = x_double_bar + A2 * r_bar
    lcl = x_double_bar - A2 * r_bar
    mean = x_double_bar
    use_subgroups = True

# ---------------- PLOT ----------------
fig = go.Figure()

fig.add_trace(go.Scatter(
    x=df_f["createddate"],
    y=df_f["value"],
    mode="lines+markers",
    name="Value",
    marker=dict(size=6),
    line=dict(width=2)
))

fig.add_hline(y=mean, line_dash="solid", line_color="green", 
              annotation_text=f"CL={mean:.2f}")
fig.add_hline(y=ucl, line_dash="dash", line_color="red", 
              annotation_text=f"UCL={ucl:.2f}")
fig.add_hline(y=lcl, line_dash="dash", line_color="red", 
              annotation_text=f"LCL={lcl:.2f}")

fig.update_layout(
    title=f"SPC Chart - {machine} / {parameter}",
    xaxis_title="Time",
    yaxis_title="Value",
    template="plotly_white",
    height=500
)

st.plotly_chart(fig, use_container_width=True)

# ---------------- METRICS ----------------
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("Mean", f"{mean:.2f}")

with col2:
    std_val = df_f["value"].std()
    st.metric("Std Dev", f"{std_val:.2f}")

with col3:
    ooc = len(df_f[(df_f["value"] > ucl) | (df_f["value"] < lcl)])
    st.metric("Out of Control", ooc)

with col4:
    st.metric("Total Points", len(df_f))

# ---------------- STATUS ----------------
if ooc > 0:
    st.error(f"⚠️ Process OUT OF CONTROL - {ooc} points exceeded limits")
else:
    st.success("✅ Process IN CONTROL")

# ---------------- INFO ----------------
st.info(f"""
**Method:** {'X-bar Chart (Subgroups)' if use_subgroups else 'Individual Chart (3-sigma)'}  
**Last Update:** {df_f['createddate'].max()}  
**Data Points:** {len(df_f)}
""")

# ---------------- AUTO REFRESH ----------------
if auto_refresh:
    import time
    time.sleep(REFRESH_SEC)
    st.rerun()