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
        profilePhoto VARCHAR(255),
        driverPassword VARCHAR(255)
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
app.post('/drivers', upload.single('profilePhoto'), (req, res) => {
  // Log the request body for debugging
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.file);

  const { driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword } = req.body;
  const profilePhoto = req.file ? req.file.filename : null;

  if (!driverName || !driverPhone || !vehicleLicencePlate || !driverPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO drivers (driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword, profilePhoto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword, profilePhoto], (err, result) => {
    if (err) {
      console.error('Error inserting driver:', err);
      res.status(500).json({ error: 'Error inserting driver' });
    } else {
      res.status(201).json({ message: 'Driver added successfully' });
    }
  });
});

// PUT update a driver with or without a new profile photo
app.put('/drivers/:id', upload.single('profilePhoto'), (req, res) => {
  const { driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword } = req.body;
  const { id } = req.params;
  const profilePhoto = req.file ? req.file.filename : req.body.profilePhoto; // Use existing photo if not updated

  const query = `
    UPDATE drivers
    SET driverName = ?, driverPhone = ?, vehicleColor = ?, vehicleLicencePlate = ?, driverLocation = ?, driverAvailability = ?, driverPassword = ?, profilePhoto = ?
    WHERE id = ?
  `;
  
  db.query(query, [driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword, profilePhoto, id], (err, result) => {
    if (err) {
      console.error('Error updating driver:', err);
      res.status(500).json({ error: 'Error updating driver' });
    } else {
      res.status(200).json({ message: 'Driver updated successfully' });
    }
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
