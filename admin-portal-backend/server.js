const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 8082;

// Multer configuration for handling file uploads
const upload = multer();

app.use(cors());
app.use(bodyParser.json()); // Use body-parser for JSON data on other routes

// Only apply these parsers to non-file routes
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'taxidb',
  connectTimeout: 10000, // Increase the connection timeout
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
        driverPassword VARCHAR(255),
        image LONGBLOB
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

// GET all drivers
app.get('/drivers', (req, res) => {
  const query = 'SELECT id, driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword, image FROM drivers';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Convert image buffers to base64
    const driversWithImage = results.map(driver => ({
      ...driver,
      image: driver.image ? Buffer.from(driver.image).toString('base64') : null,
    }));
    res.json(driversWithImage);
  });
});

// POST add a new driver
app.post('/drivers', upload.single('image'), (req, res) => {
  const { driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword } = req.body;
  const image = req.file ? req.file.buffer : null; // Get the image data

  console.log("Image Buffer:", req.file); // Log the received file

  if (!driverName || !driverPhone || !vehicleLicencePlate || !driverPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO drivers (driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword, image], (err) => {
    if (err) {
      console.error('Error inserting driver:', err);
      return res.status(500).json({ error: 'Error inserting driver: ' + err.message });
    }
    res.status(201).json({ message: 'Driver added successfully' });
  });
});

// PUT update a driver
app.put('/drivers/:id', upload.single('image'), (req, res) => {
  const { driverName, driverPhone, vehicleColor, vehicleLicencePlate, driverLocation, driverAvailability, driverPassword } = req.body;
  const { id } = req.params;
  const image = req.file ? req.file.buffer : null; // Access the uploaded image buffer

  console.log('Incoming update request:', req.body); // Log the incoming request data

  const updates = [];
  const values = [];

  // Conditionally add fields if present
  if (driverName) {
    updates.push('driverName = ?');
    values.push(driverName);
  }
  if (driverPhone) {
    updates.push('driverPhone = ?');
    values.push(driverPhone);
  }
  if (vehicleColor) {
    updates.push('vehicleColor = ?');
    values.push(vehicleColor);
  }
  if (vehicleLicencePlate) {
    updates.push('vehicleLicencePlate = ?');
    values.push(vehicleLicencePlate);
  }
  if (driverLocation) {
    updates.push('driverLocation = ?');
    values.push(driverLocation);
  }
  if (driverAvailability !== undefined) {
    updates.push('driverAvailability = ?');
    values.push(driverAvailability);
  }
  if (driverPassword) {
    updates.push('driverPassword = ?');
    values.push(driverPassword);
  }
  if (image) {
    updates.push('image = ?');
    values.push(image); // Only push the image buffer if it’s present
  }

  // Check if there are any fields to update
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);
  const query = `UPDATE drivers SET ${updates.join(', ')} WHERE id = ?`;

  db.query(query, values, (err) => {
    if (err) {
      console.error('Error updating driver:', err);
      return res.status(500).json({ error: 'Error updating driver' });
    }
    res.status(200).json({ message: 'Driver updated successfully' });
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
