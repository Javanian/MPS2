document.addEventListener("DOMContentLoaded", () => {
  const inputOrder = document.getElementById("orderinput");
  const gallery = document.getElementById("gallery");

  document.getElementById("btnBack").addEventListener("click", () => goToMenu());
  document.getElementById("btnSearch").addEventListener("click", () => loadData(inputOrder.value, true));
  document.getElementById("btnRefresh").addEventListener("click", () => loadData(inputOrder.value, false));
  document.getElementById("scanBtn").addEventListener("click", startBarcodePreview);

  async function loadData(order, withWorkcenter = true) {
    if (!order) return alert("Masukkan nomor order terlebih dahulu.");

    let url;
    if (withWorkcenter) {
      const datakaryawan = JSON.parse(sessionStorage.getItem("datakaryawan"));
      if (!datakaryawan || !datakaryawan.workcenter) {
        alert("Workcenter karyawan tidak ditemukan.");
        return;
      }
      url = `/sow/mesin/${order}?workcenter=${encodeURIComponent(datakaryawan.workcenter)}`;
    } else {
      url = `/sow/${order}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal ambil data");
      const data = await res.json();

      gallery.innerHTML = "";
      data.forEach(item => {
        const row = document.createElement("div");
        row.className = "item";
        row.innerHTML = `
          <div>${item.order_no}</div>
          <div>${item.operationtext}</div>
          <div>${item.operation_no}</div>
          <div>${item.planhours}</div>
          <div>${item.workcenter}</div>
        `;
        row.addEventListener("click", () => {
          document.querySelectorAll(".item").forEach(el => el.classList.remove("selected"));
          row.classList.add("selected");
          sessionStorage.setItem("selectedactivity", JSON.stringify({
            order: item.order_no,
            operationtext: item.operationtext,
            operation_no: item.operation_no,
            planhours: item.planhours,
            workcenter: item.workcenter
          }));
          window.location.href = "mainmenu.html";
        });
        gallery.appendChild(row);
      });
    } catch (err) {
      alert("Gagal load data: " + err.message);
      console.error(err);
    }
  }

  // contoh fungsi barcode preview
//   function startBarcodePreview() {
//     document.getElementById("preview").classList.remove("hidden");
//     // integrasikan dengan scanner / camera API sesuai kebutuhan
//   }

  // navigasi umum
  function goToMenu() { window.location.href = "mainmenu.html"; }
});
