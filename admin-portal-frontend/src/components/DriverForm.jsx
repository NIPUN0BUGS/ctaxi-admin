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
  Avatar,
  IconButton,
  InputAdornment,
} from '@mui/material';
import axios from 'axios';
import AdminLayout from '../common/AdminLayout';
import locations from '../config/Locations';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

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
    image: null,
    previewImage: null,
  });

  const [drivers, setDrivers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showPassword, setShowPassword] = useState(false);

  const licensePlatePattern = /^[a-z]{3}-\d{4}$/; // Pattern: "abn-3256"

  
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const response = await axios.get('http://localhost:8082/drivers');
    setDrivers(response.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate vehicleLicencePlate format
    if (name === 'vehicleLicencePlate') {
      const licensePlatePattern = /^[a-z]{3}-\d{4}$/;
      if (!licensePlatePattern.test(value) && value !== '') {
        setErrorMessage('Licence plate must follow the format: abn-3256');
      } else {
        setErrorMessage(''); // Clear error message if format is correct
      }
    }

    // Validate driverPhone format
    if (name === 'driverPhone') {
      const phonePattern = /^\+947\d{8}$/;
      if (!phonePattern.test(value) && value !== '') {
          setErrorMessage('Phone number must follow the format: +947XXXXXXXX');
      } else {
          setErrorMessage(''); // Clear error message if format is correct
      }
  }

    setDriver({ ...driver, [name]: value });
};


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setDriver({
        ...driver,
        image: file,
        previewImage: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data for submission
    const formData = new FormData();
    formData.append('driverName', driver.driverName);
    formData.append('driverPhone', driver.driverPhone);
    formData.append('vehicleColor', driver.vehicleColor);
    formData.append('vehicleLicencePlate', driver.vehicleLicencePlate);
    formData.append('driverLocation', driver.driverLocation);
    formData.append('driverAvailability', driver.driverAvailability);
    formData.append('driverPassword', driver.driverPassword);

    if (driver.image) {
      formData.append('image', driver.image);
    }

    try {
      if (editingId) {
        // For update, ensure `editingId` is passed in URL
        const response = await axios.put(`http://localhost:8082/drivers/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log("Driver updated successfully:", response.data);
      } else {
        // For adding new driver
        const response = await axios.post(`http://localhost:8082/drivers`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log("Driver added successfully:", response.data);
      }
      fetchDrivers(); // Refresh the list after submit
      setEditingId(null); 
      setDriver({
        driverName: '',
        driverPhone: '',
        vehicleColor: '',
        vehicleLicencePlate: '',
        driverLocation: '',
        driverPassword: '',
        driverAvailability: true,
        image: null,
        previewImage: null,
      });
    } catch (error) {
      console.error("Error submitting driver data:", error.response ? error.response.data : error);
    }
  };



  const handleEdit = (driverToEdit) => {
    console.log("Editing driver:", driverToEdit); // Log driver data being edited
    setDriver({
      driverName: driverToEdit.driverName,
      driverPhone: driverToEdit.driverPhone,
      vehicleColor: driverToEdit.vehicleColor,
      vehicleLicencePlate: driverToEdit.vehicleLicencePlate,
      driverLocation: driverToEdit.driverLocation,
      driverPassword: driverToEdit.driverPassword,
      driverAvailability: driverToEdit.driverAvailability,
    });
    setEditingId(driverToEdit.id);
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
                  type={showPassword ? 'text' : 'password'}
                  value={driver.driverPassword}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ maxLength: 8, minLength: 8 }}
                  error={driver.driverPassword.length !== 8}
                  helperText={driver.driverPassword.length !== 8 ? "Password must be exactly 8 characters" : ""}
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

              {/* Image Upload Field - Only for adding a new driver */}
              {!editingId && ( // Only show when not editing
                <Grid item xs={12} sm={3}>
                  {driver.previewImage && (
                    <Avatar
                      src={driver.previewImage}
                      alt="Uploaded Driver Image"
                      sx={{ width: 100, height: 100, marginBottom: 1 }}
                    />
                  )}
                  <Button variant="contained" component="label" fullWidth>
                    Upload Image
                    <input
                      type="file"
                      hidden
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </Button>
                </Grid>
              )}

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
                  <StyledTableCell>Password</StyledTableCell>
                  <StyledTableCell>Profile Pic</StyledTableCell>
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
                      {driver.image ? (
                        <Avatar
                          src={`data:image/png;base64,${driver.image}`}
                          alt="Driver"
                          sx={{ width: 50, height: 50 }}
                        />
                      ) : (
                        <Avatar>{driver.driverName.charAt(0).toUpperCase()}</Avatar>
                      )}
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
