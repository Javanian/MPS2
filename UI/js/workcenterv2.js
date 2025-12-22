function goToMenu() {
  window.location.href = "mainmenu.html";
}

let datamesin = [];
let selectedmesin = null;

// Ambil data awal
fetch("/workcenter/")
  .then(res => res.json())
  .then(data => {
    datamesin = data;
    renderGallery(datamesin);
  })
  .catch(err => console.error("Gagal ambil workcenter:", err));

function renderGallery(data) {
  const gallery = document.getElementById('gallerymesin');
  gallery.innerHTML = "";

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'cardmesin';

    const rowdatamesin = {
      workcenter_description: item.workcenter_description,
      machineid: item.machineid,
      groupname: item.groupname,
      workcenternew: item.workcenternew,
    };

    card.innerHTML = `
      <div class="label">Mesin:</div> <div class="value">${item.workcenter_description}</div>
      <div class="label">ID:</div> <div class="value">${item.machineid}</div>
      <div class="label">Group:</div> <div class="value">${item.groupname}</div>
      <div class="label">Workcenter:</div> <div class="value">${item.workcenternew}</div>
    `;

    card.addEventListener("click", async () => {
      selectedmesin = rowdatamesin;
      sessionStorage.setItem("selectedmesinku", JSON.stringify(selectedmesin));

      const datakaryawan = JSON.parse(sessionStorage.getItem("datakaryawan"));
      if (!datakaryawan || !datakaryawan.nfcid) {
        alert("Data karyawan tidak lengkap.");
        return;
      }

      try {
        // update mesin ke server
        const response = await fetch("/usernfc/update/", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serialnumber: datakaryawan.snssb,
            machineid: selectedmesin.machineid,
            machinename: selectedmesin.workcenter_description,
            workcenter: selectedmesin.workcenternew
          })
        });

        if (!response.ok) throw new Error("Gagal update mesin");
        console.log("Update mesin sukses:", await response.json());
        alert("Update mesin berhasil! ✅");

        // refresh datakaryawan terbaru
        const res = await fetch(`/usernfc/nfcid/${datakaryawan.nfcid}`);
        if (!res.ok) throw new Error("Gagal ambil data karyawan terbaru");
        const data = await res.json();
        if (data && Object.keys(data).length) {
          sessionStorage.setItem("datakaryawan", JSON.stringify(data));
          console.log("Session datakaryawan diupdate:", data);
        }

        window.location.href = "mainmenu.html";
      } catch (err) {
        console.error(err);
        alert("Update mesin gagal: " + err.message);
      }
    });

    gallery.appendChild(card);
  });
}

// 🔍 Fitur Search
document.getElementById('searchInput').addEventListener('input', function () {
  const keyword = this.value.toLowerCase();
  const filtered = datamesin.filter(item =>
    item.workcenter_description.toLowerCase().includes(keyword) ||
    item.machineid.toLowerCase().includes(keyword) ||
    item.groupname.toLowerCase().includes(keyword)
  );
  renderGallery(filtered);
});
