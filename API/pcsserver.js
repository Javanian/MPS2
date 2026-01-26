const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


app.use('/process-category', require('./routes/processCategoryRoutes'));
app.use('/process-parameter', require('./routes/processParameterRoutes'));
app.use('/process-parameter-choicebase', require('./routes/processParameterChoicebaseRoutes'));
app.use('/process-control', require('./routes/processControlDataRoutes'));
app.use('/process-control-item', require('./routes/processControlDataItemRoutes'));

const PORT = 3002;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
