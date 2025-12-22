// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();


app.use(express.json());

app.use(
  cors({
    origin: true, // auto reflect request origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.use(express.static(path.join(__dirname, "../UI"), {
  extensions: ["html"]   // <--- ini bikin .html bisa disembunyiin
}));

app.get("/health", (req, res) => {
  res.json({ ok: true, port: process.env.PORT || 3001 });
});

// Pastikan di ./routes/sow.js dan ./routes/usernfc.js: module.exports = router;
app.use("/drawings", express.static("//10.44.192.172/PE/02. DRAFTING"));
app.use("/sow", require("./routes/sow"));
app.use("/usernfc", require("./routes/usernfc"));
app.use("/workcenter", require("./routes/workcenter"));
app.use("/timesheet", require("./routes/timesheet_transaction"));
app.use("/process-category", require("./routes/processCategoryRoutes"));
app.use("/process-parameter", require("./routes/processParameterRoutes"));
app.use("/process-parameter-choicebase", require("./routes/processParameterChoicebaseRoutes"));
app.use("/process-control", require("./routes/processControlDataRoutes"));
app.use("/process-control-item", require("./routes/processControlDataItemRoutes"));

app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("Serving static files from:", path.join(__dirname, "../UI"));

});
