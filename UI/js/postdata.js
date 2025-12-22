const switchEl = document.getElementById("myswitch");
const labelEl = document.getElementById("switchLabel");

switchEl.addEventListener("change", function () {
  if (this.checked) {
    labelEl.textContent = "Multiple";
  } else {
    labelEl.textContent = "Single";
  }
});

async function postdata() {
  try {
    const selectedactivity = JSON.parse(sessionStorage.getItem("selectedactivity"));
    const datakaryawan = JSON.parse(sessionStorage.getItem("datakaryawan"));
    const selectedmesinku = JSON.parse(sessionStorage.getItem("selectedmesinku"));

    if (!selectedactivity || !datakaryawan) {
      alert("❌ Data tidak lengkap. Silakan pilih activity dan karyawan.");
      return;
    }

    if (labelEl.textContent === "Single") {
      // ✅ CHECKOUT menggunakan endpoint unified (serialnumber)
      const checkoutRes = await fetch("/timesheet/checkout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datakaryawan: { sn: datakaryawan.snssb }  // ✅ Langsung kirim serialnumber
        }),
      });

      // if (!checkoutRes.ok) {
      //   const error = await checkoutRes.json();
      //   console.error("Gagal CHECKOUT:", error);
      //   alert(`❌ Checkout gagal: ${error.error || 'Unknown error'}`);
      //   return;
      // }

      const checkedOut = await checkoutRes.json();
      console.log("Checkout sukses:", checkedOut);

      // ✅ CREATE timesheet baru
      const postRes = await fetch("/timesheet/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          production_order: selectedactivity.order,
          serialnumber: datakaryawan.snssb,
          full_name: datakaryawan.full_name,
          operation_no: selectedactivity.operation_no,
          operation_text: selectedactivity.operationtext,
          workcentercode: datakaryawan.workcenter,
          workcenterdescription: datakaryawan.machinename,
        }),
      });

      if (!postRes.ok) {
        const error = await postRes.json();
        console.error("Gagal POST:", error);
        alert(`❌ Buat timesheet gagal: ${error.error || 'Unknown error'}`);
        return;
      }

      const created = await postRes.json();
      console.log("Timesheet created:", created);

      alert("✅ TIMESHEET berhasil dibuat!");
      window.location.href = "index";

    } else {
      // ✅ MODE MULTIPLE - hanya create tanpa checkout
      const postRes = await fetch("/timesheet/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          production_order: selectedactivity.order,
          serialnumber: datakaryawan.snssb,
          full_name: datakaryawan.full_name,
          operation_no: selectedactivity.operation_no,
          operation_text: selectedactivity.operationtext,
          workcentercode: datakaryawan.workcenter,
          workcenterdescription: datakaryawan.machinename,
        }),
      });

      if (!postRes.ok) {
        const error = await postRes.json();
        console.error("Gagal POST:", error);
        alert(`❌ Buat timesheet gagal: ${error.error || 'Unknown error'}`);
        return;
      }

      const created = await postRes.json();
      console.log("Timesheet created:", created);

      alert("✅ TIMESHEET berhasil dibuat!");
      // Tidak redirect, biarkan user create multiple
    }

  } catch (err) {
    console.error("Error postdata:", err);
    alert(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

async function finish() {
  const selectedactivity = JSON.parse(sessionStorage.getItem("selectedactivity"));

  if (!selectedactivity) {
    alert("❌ Tidak ada activity yang dipilih");
    return;
  }

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
      const error = await postRes.json();
      throw new Error(error.error || "Gagal update status");
    }

    const updated = await postRes.json();
    console.log("Update sukses:", updated);
    
    alert("✅ Update FINISH berhasil!");
    
    // Clear UI
    sessionStorage.removeItem("selectedactivity");
    document.getElementById("orderku").innerText = "";
    document.getElementById("activityku").innerText = "";

  } catch (err) {
    console.error("Error finish:", err);
    alert(`❌ ${err.message}`);
  }
}