const selectedactivity = JSON.parse(sessionStorage.getItem("selectedactivity"));
const selectedmesinku = JSON.parse(sessionStorage.getItem("selectedmesinku"));
const datakaryawan = JSON.parse(sessionStorage.getItem("datakaryawan"));

// cek dulu biar gak error kalau kosong
if (selectedactivity) {
  document.getElementById("orderku").innerText = selectedactivity.order;
document.getElementById("activityku").innerText = 
selectedactivity.operationtext+"\n"+" Sequence : "+selectedactivity.operation_no;

} else {
  document.getElementById("orderku").innerText = "-";
};

if (datakaryawan) {
document.getElementById("wctku").innerText = 
datakaryawan.workcenter+"\n"+datakaryawan.machinename;
} else {
  document.getElementById("wctku").innerText = "-";
};

if (datakaryawan) {
document.getElementById("namaku").innerText = 
datakaryawan.full_name;
document.getElementById("snku").innerText = 
datakaryawan.snssb;
} else {
  document.getElementById("namaku").innerText = "-";
  document.getElementById("snku").innerText = "-";
};