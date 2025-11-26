const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());  // <-- THIS LINE IS REQUIRED

app.use('/api', routes);

app.get('/', (req, res) => res.send('GoTrip backend running'));

app.use(errorHandler);

module.exports = app;
