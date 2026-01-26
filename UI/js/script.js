function goToMenu() {
  window.location.href = "mainmenu";
}
function gotoparameter() {
  window.location.href = "processcontrol_form";
}
function gotots() {
  window.location.href = "menutimesheet";
}
function goHome() {
  window.location.href = "index";
}
function goregister() {
  window.location.href = "nfcregist";
}

function gotojob() {
  window.location.href = "menujob";
}

function gotomesin() {
  window.location.href = "menuworkcenter";
}

async function caridata() {
  const order = document.getElementById("orderinput").value;
}


//===============API POSTGRES====================

 async function loaddatapg() {

  const order = document.getElementById("orderinput").value;
  //const order = 1000116114;
  let selectedRow = null; // 🔹 variable global
  try {
    // 🔹 Ganti ke API kamu
    const datakaryawan = JSON.parse(sessionStorage.getItem('datakaryawan'));
const workcenter = datakaryawan.workcenter;

const response = await fetch(`/sow/mesin/${order}?workcenter=${encodeURIComponent(workcenter)}`);
const data = await response.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // reset biar ga dobel

    data.forEach((item) => {
      const container = document.createElement("div");
      container.classList.add("item");

      const rowData = {
        order: item.order_no,
        ssbr_id: item.ssbr_id,
        operationtext: item.operationtext,
        operation_no: item.operation_no,
        planhours: item.planhours,
        workcenter: item.workcenter,
      };

      const orderBox = document.createElement("div");
      orderBox.classList.add("textbox", "order");
      orderBox.textContent = rowData.order;

      const seqBox = document.createElement("div");
      seqBox.classList.add("textbox", "seq");
      seqBox.textContent = rowData.operation_no;

      const hrsBox = document.createElement("div");
      hrsBox.classList.add("textbox", "hrs");
      hrsBox.textContent = rowData.planhours;

      const actBox = document.createElement("div");
      actBox.classList.add("textbox", "act");
      actBox.textContent = rowData.operationtext;
        
      const wctBox = document.createElement("div");
      wctBox.classList.add("textbox", "wct");
      wctBox.textContent = rowData.workcenter;

const identBox = document.createElement("div");
identBox.classList.add("textbox", "ident");
identBox.textContent = rowData.ssbr_id;

container.appendChild(orderBox);
container.appendChild(identBox);
container.appendChild(actBox);
container.appendChild(seqBox);
container.appendChild(hrsBox);
container.appendChild(wctBox);

      // klik row → simpan ke variable
      container.addEventListener("click", () => {
        // hilangkan highlight dari row lain
        document
          .querySelectorAll(".item")
          .forEach((el) => el.classList.remove("selected"));
        container.classList.add("selected");

        selectedRow = rowData;
        let selectedactivity = JSON.parse(sessionStorage.getItem("selectedactivity"));
        sessionStorage.setItem("selectedactivity", JSON.stringify(selectedRow)); // simpan
        // const val = localStorage.getItem("order"); // ambil
        window.location.href = "mainmenu";
        console.log("Row terpilih:", selectedRow);
        console.log("act: ",selectedactivity);
        // contoh akses: console.log(selectedRow.order)
        document.getElementById("order").innerText ="Order: " + selectedRow.order;
        document.getElementById("act").innerText ="Activity: " + selectedRow.act;
        document.getElementById("seq").innerText = "Seq: " + selectedRow.seq;
        document.getElementById("hrs").innerText = "Hours: " + selectedRow.hrs;
        document.getElementById("wct").innerText = "Workcenter: " + selectedRow.workcenter;
      });

      gallery.appendChild(container);
    });
  } catch (error) {
    console.error("Gagal load data dari API", error);
  }
}


 async function loaddatapgall() {

  const order = document.getElementById("orderinput").value;
  //const order = 1000116114;
  let selectedRow = null; // 🔹 variable global
  try {
    // 🔹 Ganti ke API kamu
    const response = await fetch(`/sow/${order}`);
    const data = await response.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // reset biar ga dobel

    data.forEach((item) => {
      const container = document.createElement("div");
      container.classList.add("item");

      const rowData = {
        order: item.order_no,
        ssbr_id: item.ssbr_id,
        operationtext: item.operationtext,
        operation_no: item.operation_no,
        planhours: item.planhours,
        workcenter: item.workcenter,
      };

      const orderBox = document.createElement("div");
      orderBox.classList.add("textbox", "order");
      orderBox.textContent = rowData.order;

      const seqBox = document.createElement("div");
      seqBox.classList.add("textbox", "seq");
      seqBox.textContent = rowData.operation_no;

      const hrsBox = document.createElement("div");
      hrsBox.classList.add("textbox", "hrs");
      hrsBox.textContent = rowData.planhours;

      const actBox = document.createElement("div");
      actBox.classList.add("textbox", "act");
      actBox.textContent = rowData.operationtext;

      const wctBox = document.createElement("div");
      wctBox.classList.add("textbox", "wct");
      wctBox.textContent = rowData.workcenter;

      const identBox = document.createElement("div");
identBox.classList.add("textbox", "ident");
identBox.textContent = rowData.ssbr_id;

container.appendChild(orderBox);
container.appendChild(identBox);
container.appendChild(actBox);
container.appendChild(seqBox);
container.appendChild(hrsBox);
container.appendChild(wctBox);

      // klik row → simpan ke variable
      container.addEventListener("click", () => {
        // hilangkan highlight dari row lain
        document
          .querySelectorAll(".item")
          .forEach((el) => el.classList.remove("selected"));
        container.classList.add("selected");

        selectedRow = rowData;
        let selectedactivity = JSON.parse(sessionStorage.getItem("selectedactivity"));
        sessionStorage.setItem("selectedactivity", JSON.stringify(selectedRow)); // simpan
        // const val = localStorage.getItem("order"); // ambil
        window.location.href = "mainmenu";
        console.log("Row terpilih:", selectedRow);
        console.log("act: ",selectedactivity);
        // contoh akses: console.log(selectedRow.order)
        document.getElementById("order").innerText ="Order: " + selectedRow.order;
        document.getElementById("act").innerText ="Activity: " + selectedRow.act;
        document.getElementById("seq").innerText = "Seq: " + selectedRow.seq;
        document.getElementById("hrs").innerText = "Hours: " + selectedRow.hrs;
        document.getElementById("wct").innerText = "Workcenter: " + selectedRow.workcenter;
      });

      gallery.appendChild(container);
    });
  } catch (error) {
    console.error("Gagal load data dari API", error);
  }
}
//document.getElementById("loadBtn").addEventListener("click", loaddatapg);

