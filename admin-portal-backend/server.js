const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8082;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'taxidb'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to MySQL');
    
    // Create drivers table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        driverName VARCHAR(100) NOT NULL,
        driverPhone VARCHAR(20) NOT NULL,
        vehicleColor VARCHAR(50),
        vehicleLicencePlate VARCHAR(50) UNIQUE,
        driverLocation VARCHAR(100),
        driverAvailability BOOLEAN DEFAULT TRUE,
        profilePhoto VARCHAR(255)
      );
    `;
    
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating drivers table:', err);
      } else {
        console.log('Drivers table is ready or already exists.');
      }
    });
  }
});

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET all drivers
app.get('/drivers', (req, res) => {
  db.query('SELECT * FROM drivers', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// POST add a new driver with profile photo
app.post('/drivers', (req, res) => {
  upload.single('profilePhoto')(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      return res.status(400).json({ error: err.message });
    }
    const { driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability } = req.body;
    const profilePhoto = req.file ? req.file.filename : null;
    
    const query = 'INSERT INTO drivers (driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, profilePhoto) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, profilePhoto], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Driver added successfully', driverId: result.insertId });
    });
  });
});

// PUT update a driver with or without a new profile photo
app.put('/drivers/:id', (req, res) => {
  upload.single('profilePhoto')(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      return res.status(400).json({ error: err.message });
    }
    const { id } = req.params;
    const { driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, existingPhoto } = req.body;
    const profilePhoto = req.file ? req.file.filename : existingPhoto;  // Retain existing photo if no new file is uploaded

    const query = 'UPDATE drivers SET driverName = ?, driverPhone = ?, vehicleColor = ?, vehicleLicencePlate = ?, driverLocation = ?, driverAvailability = ?, profilePhoto = ? WHERE id = ?';
    db.query(query, [driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, profilePhoto, id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'Driver updated successfully' });
    });
  });
});

// DELETE a driver
app.delete('/drivers/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM drivers WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Driver deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
