function goBack() {
  window.location.href = "processcontrol_form.html";
}

const datakaryawan = JSON.parse(sessionStorage.getItem("datakaryawan"));
const editForm = document.getElementById("editForm");
const btnSave = document.getElementById("btnSave");
const btnCancel = document.getElementById("btnCancel");

// Load parameter to edit (misalnya disimpan di sessionStorage dari halaman sebelumnya)
const paramData = JSON.parse(sessionStorage.getItem("editParam")) || null;

// Render form
function renderForm() {
  if (!paramData) {
    editForm.innerHTML = "<p>No parameter selected</p>";
    return;
  }

  editForm.innerHTML = `
    <div class="form-row">
      <label>Parameter Name</label>
      <div class="input-box">
        <input type="text" name="parameter_name" value="${paramData.parameter_name}">
      </div>
    </div>
    <div class="form-row">
      <label>UOM</label>
      <div class="input-box">
        <input type="text" name="uom" value="${paramData.uom || ""}">
      </div>
    </div>
    <div class="form-row">
      <label>Is Number</label>
      <div class="input-box">
        <select name="isnumber">
          <option value="true" ${paramData.isnumber ? "selected" : ""}>Yes</option>
          <option value="false" ${!paramData.isnumber ? "selected" : ""}>No</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <label>Is Choice</label>
      <div class="input-box">
        <select name="ischoice">
          <option value="true" ${paramData.ischoice ? "selected" : ""}>Yes</option>
          <option value="false" ${!paramData.ischoice ? "selected" : ""}>No</option>
        </select>
      </div>
    </div>
  `;
}

// Save changes
btnSave.addEventListener("click", async () => {
  const formData = new FormData(editForm);
  const body = Object.fromEntries(formData);

  try {
    const res = await fetch(`/process-parameter/${paramData.id_parameter}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to update parameter");
    alert("Parameter updated successfully ✅");
    goBack();
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
});

// Cancel
btnCancel.addEventListener("click", goBack);

// Init
renderForm();
