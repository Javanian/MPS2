function goToMenu() { window.location.href = "mainmenu.html"; }
function gotots() { window.location.href = "menutimesheet.html"; }
function goHome() { window.location.href = "index.html"; }
function gotojob() { window.location.href = "menujob.html"; }
function gotomesin() { window.location.href = "menuworkcenter.html"; }

async function loadData(order, withWorkcenter = true) {
  if (!order) {
    alert("Masukkan nomor order terlebih dahulu.");
    return;
  }

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

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    data.forEach(item => {
      const rowData = {
        order: item.order_no,
        operationtext: item.operationtext,
        operation_no: item.operation_no,
        planhours: item.planhours,
        workcenter: item.workcenter,
      };

      const container = document.createElement("div");
      container.classList.add("item");
      container.innerHTML = `
        <div class="textbox order">${rowData.order}</div>
        <div class="textbox act">${rowData.operationtext}</div>
        <div class="textbox seq">${rowData.operation_no}</div>
        <div class="textbox hrs">${rowData.planhours}</div>
        <div class="textbox wct">${rowData.workcenter}</div>
      `;

      container.addEventListener("click", () => {
        document.querySelectorAll(".item").forEach(el => el.classList.remove("selected"));
        container.classList.add("selected");

        // Simpan data yang dipilih
        sessionStorage.setItem("selectedactivity", JSON.stringify(rowData));
        console.log("Row terpilih:", rowData);

        // ❗ Tidak perlu update DOM di sini karena halaman akan berganti
        window.location.href = "mainmenu.html";
      });

      gallery.appendChild(container);
    });

  } catch (err) {
    console.error(err);
    alert("Gagal load data: " + err.message);
  }
}

// Pemanggilan contoh:
document.getElementById("loadBtn").addEventListener("click", () => {
  const order = document.getElementById("orderinput").value;
  loadData(order, true); // true = dengan filter workcenter
});

// Jika mau ambil semua tanpa filter:
document.getElementById("loadAllBtn")?.addEventListener("click", () => {
  const order = document.getElementById("orderinput").value;
  loadData(order, false);
});


document.getElementById("btnSearch").addEventListener("click", () => {
  const order = document.getElementById("orderinput").value;
  loadData(order, true);   // ✅ pakai workcenter
});

document.getElementById("btnRefresh").addEventListener("click", () => {
  const order = document.getElementById("orderinput").value;
  loadData(order, false);  // ✅ tanpa workcenter
});
