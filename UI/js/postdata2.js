

const switchEl = document.getElementById("myswitch");
const labelEl = document.getElementById("switchLabel");

switchEl.addEventListener("change", function () {
  if (this.checked) {
    labelEl.textContent = "Multiple"; // kalau true
  } else {
    labelEl.textContent = "Single"; // kalau false
  }
});

async function postdata() {
  if (labelEl.textContent === "Single") {
    const selectedactivity = JSON.parse(
      sessionStorage.getItem("selectedactivity")
    );
    const datakaryawan = JSON.parse(sessionStorage.getItem("datakaryawan"));
    const selectedmesinku = JSON.parse(
      sessionStorage.getItem("selectedmesinku")
    );

    const serialnumber = datakaryawan.sn;
    const updateRes = await fetch(
      `/timesheet/checkout/${serialnumber}`,
      { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datakaryawan: { sn: datakaryawan.snssb },
        }),
      }
    );
    const updated = await updateRes.json();
    console.log("Update sukses:", updated);

    const postRes = await fetch("/timesheet/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        production_order: selectedactivity.order,
        serialnumber: datakaryawan.snssb,
        full_name: datakaryawan.full_name,
        operation_no: selectedactivity.operation_no,
        operation_text: selectedactivity.operationtext, // perhatikan underscore
        workcentercode: datakaryawan.workcenter,
        workcenterdescription: datakaryawan.machinename,
      }),
    });
    if (!postRes.ok) {
      console.error("Gagal POST:", postRes.status, postRes.statusText);
      return; // ⬅️ hentikan, jangan pindah halaman
    }
    console.log("Timesheet:", updated);
    // ✅ Pop-up sukses
    alert("TIMESHEET berhasil!✅");
    window.location.href = "menutimesheet";

    const updateds = await postRes.json();
    console.log("Update sukses:", updateds);
    //sessionStorage.removeItem("selectedactivity");
    //window.location.href = "index.html"; // pindah hanya kalau sukses
  } else {
    const postRes = await fetch("/timesheet/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        production_order: selectedactivity.order,
        serialnumber: datakaryawan.snssb,
        full_name: datakaryawan.full_name,
        operation_no: selectedactivity.operation_no,
        operation_text: selectedactivity.operationtext, // perhatikan underscore
        workcentercode: datakaryawan.workcenter,
        workcenterdescription: datakaryawan.machinename,
      }),
    });
    if (!postRes.ok) {
      console.error("Gagal POST:", postRes.status, postRes.statusText);
      return; // ⬅️ hentikan, jangan pindah halaman
    }
    console.log("Timesheet:", updated);
    // ✅ Pop-up sukses
    alert("TIMESHEET berhasil!✅");


    const updateds = await postRes.json();
    console.log("Update sukses:", updateds);
    //sessionStorage.removeItem("selectedactivity");
    //window.location.href = "index.html"; // pindah hanya kalau sukses
  }
};

async function finish() {
  const selectedactivity = JSON.parse(sessionStorage.getItem("selectedactivity"));

  try {
    const postRes = await fetch("/sow/finish/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedactivity: {
          production_order: selectedactivity.order,
          operation_no: selectedactivity.operation_no,
        },
      }),
    });
    if (!postRes.ok) {
      throw new Error("Gagal update status");
    }

    const updated = await postRes.json();
    console.log("Update sukses:", updated);
    alert("Update FINISH berhasil! ✅");
    sessionStorage.removeItem("selectedactivity");
    document.getElementById("orderku").innerText = "";
    document.getElementById("activityku").innerText = "";
  } catch (err) {
    console.error("Error finish:", err);
  }
}
