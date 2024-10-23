import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Typography,
  Grid,
  styled,
  Avatar, // Import Avatar here
} from '@mui/material';
import axios from 'axios';
import AdminLayout from '../common/AdminLayout';
import locations from '../config/Locations';
import { IconButton, InputAdornment } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const licensePlatePattern = /^[A-Z]{3}-\d{4}$/; // LICENSE PLATE LOGIC

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  },
}));

const DriverForm = () => {
  const [driver, setDriver] = useState({
    driverName: '',
    driverPhone: '',
    vehicleColor: '',
    vehicleLicencePlate: '',
    driverLocation: '',
    driverPassword: '',
    driverAvailability: true,
  });

  const [drivers, setDrivers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const response = await axios.get('http://localhost:8082/drivers');
    setDrivers(response.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriver({ ...driver, [name]: value }); // Remove profilePhoto handling
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driver.driverName || !driver.driverPhone || !driver.vehicleLicencePlate || !driver.driverLocation || !driver.driverPassword) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    // Validate the license plate format
    if (!licensePlatePattern.test(driver.vehicleLicencePlate)) {
      setErrorMessage('License plate must be in the format "ABN-2024".');
      return;
    }

    setErrorMessage('');

    const payload = {
      driverName: driver.driverName,
      driverPhone: driver.driverPhone,
      vehicleColor: driver.vehicleColor,
      vehicleLicencePlate: driver.vehicleLicencePlate,
      driverLocation: driver.driverLocation,
      driverPassword: driver.driverPassword,
      driverAvailability: driver.driverAvailability,
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:8082/drivers/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:8082/drivers', payload);
      }

      // Resetting form
      setDriver({
        driverName: '',
        driverPhone: '',
        vehicleColor: '',
        vehicleLicencePlate: '',
        driverLocation: '',
        driverPassword: '',
        driverAvailability: true,
      });
      setEditingId(null);
      fetchDrivers();
    } catch (error) {
      console.error('Error submitting driver data:', error);
      setErrorMessage('Error submitting driver data');
    }
  };

  const handleEdit = (driver) => {
    setDriver({
      ...driver,
    });
    setEditingId(driver.id);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this driver?');
    if (confirmDelete) {
      await axios.delete(`http://localhost:8082/drivers/${id}`);
      fetchDrivers();
    }
  };

  const filteredDrivers = drivers.filter((driver) =>
    driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicleLicencePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedDrivers = filteredDrivers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <AdminLayout searchTerm={searchTerm} handleSearchChange={handleSearchChange}>
      <Stack spacing={3} sx={{ padding: 2, mt: -15 }}>
        {/* Form Section */}
        <Paper elevation={2} sx={{ padding: 3 }}>
          <Typography variant="h6" gutterBottom>Add / Update Driver</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Driver Name"
                  name="driverName"
                  value={driver.driverName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Phone"
                  name="driverPhone"
                  value={driver.driverPhone}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Color"
                  name="vehicleColor"
                  value={driver.vehicleColor}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Licence Plate"
                  name="vehicleLicencePlate"
                  value={driver.vehicleLicencePlate}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Location</InputLabel>
                  <Select
                    name="driverLocation"
                    value={driver.driverLocation}
                    onChange={handleChange}
                    label="Location"
                  >
                    {locations.map((location, index) => (
                      <MenuItem key={index} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Password"
                  name="driverPassword"
                  type={showPassword ? 'text' : 'password'} // Toggle between text and password
                  value={driver.driverPassword}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ maxLength: 8, minLength: 8 }} // Enforce 8-character limit
                  error={driver.driverPassword.length !== 8} // Show error if not exactly 8 characters
                  helperText={driver.driverPassword.length !== 8 ? "Password must be exactly 8 characters" : ""} // Error message
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Button type="submit" variant="contained" fullWidth>
                  {editingId ? 'Update Driver' : 'Add Driver'}
                </Button>
              </Grid>
            </Grid>
            {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          </form>
        </Paper>

        {/* Drivers Table Section */}
        <Paper elevation={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Driver Name</StyledTableCell>
                  <StyledTableCell>Phone</StyledTableCell>
                  <StyledTableCell>Color</StyledTableCell>
                  <StyledTableCell>Licence Plate</StyledTableCell>
                  <StyledTableCell>Location</StyledTableCell>
                  <StyledTableCell>Password</StyledTableCell> {/* Added Password Column */}
                  <StyledTableCell>Initial</StyledTableCell>
                  <StyledTableCell>Action</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {paginatedDrivers.map((driver) => (
                  <StyledTableRow key={driver.id}>
                    <TableCell>{driver.driverName}</TableCell>
                    <TableCell>{driver.driverPhone}</TableCell>
                    <TableCell>{driver.vehicleColor}</TableCell>
                    <TableCell>{driver.vehicleLicencePlate}</TableCell>
                    <TableCell>{driver.driverLocation}</TableCell>
                    <TableCell>{driver.driverPassword}</TableCell>
                    <TableCell>
                      <Avatar>{driver.driverName.charAt(0).toUpperCase()}</Avatar> {/* Show the first letter as Avatar in uppercase */}
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => handleEdit(driver)}>
                        Edit
                      </Button>
                      <Button variant="contained" color="error" onClick={() => handleDelete(driver.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(filteredDrivers.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              padding: 2,
              '.MuiPaginationItem-root': {
                fontWeight: 'bold',
                color: '#1976d2',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
                '&.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: '#fff',
                },
              },
              '.MuiPagination-ul': {
                gap: '8px',
              },
            }}
          />

        </Paper>
      </Stack>
    </AdminLayout>
  );
};

export default DriverForm;
