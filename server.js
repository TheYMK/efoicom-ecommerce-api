// ============================================================
//                  Importations
// ============================================================
const express = require('express'),
	mongoose = require('mongoose'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	{ readdirSync } = require('fs');
require('dotenv').config();
const connectDB = require('./config/db');
// app initialization
const app = express();

// Routes importation
// const authRoutes = require('./routes/api/auth');

// ============================================================
//                    Database Connection
// ============================================================
connectDB();
// ============================================================
//                   Middlewares
// ============================================================
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(cors());
// ============================================================
//                      Route Middlewares
// ============================================================
// app.use('/api', authRoutes);
readdirSync('./routes/api').map((route) => app.use('/api', require('./routes/api/' + route))); // another way of reading all files from the routes folder
// ============================================================
//                          Server
// ============================================================
const port = process.env.PORT || 8000;
app.listen(port, () => {
	console.log(`====> EFOICOM server running on port ${port}...`);
});
