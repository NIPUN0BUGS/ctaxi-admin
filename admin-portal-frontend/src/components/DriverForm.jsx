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
} from '@mui/material';
import axios from 'axios';
import AdminLayout from '../common/AdminLayout';
import locations from '../config/Locations';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';




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
    driverAvailability: true,
    profilePhoto: null,
  });

  const [drivers, setDrivers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const response = await axios.get('http://localhost:8082/drivers');
    setDrivers(response.data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePhoto') {
      setDriver({ ...driver, profilePhoto: files[0] });
    } else {
      setDriver({ ...driver, [name]: value });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driver.driverName || !driver.driverPhone || !driver.vehicleLicencePlate || !driver.driverLocation) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }
    setErrorMessage('');

    const formData = new FormData();
    formData.append('driverName', driver.driverName);
    formData.append('driverPhone', driver.driverPhone);
    formData.append('vehicleColor', driver.vehicleColor);
    formData.append('vehicleLicencePlate', driver.vehicleLicencePlate);
    formData.append('driverLocation', driver.driverLocation);
    formData.append('driverAvailability', driver.driverAvailability);
    if (driver.profilePhoto) {
      formData.append('profilePhoto', driver.profilePhoto);
    }

    if (editingId) {
      await axios.put(`http://localhost:8082/drivers/${editingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      await axios.post('http://localhost:8082/drivers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    setDriver({
      driverName: '',
      driverPhone: '',
      vehicleColor: '',
      vehicleLicencePlate: '',
      driverLocation: '',
      driverAvailability: true,
      profilePhoto: null,
    });
    setEditingId(null);
    fetchDrivers();
  };

  const handleEdit = (driver) => {
    setDriver(driver);
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
      <Stack spacing={3} sx={{ padding: 2 }}>
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
                  <InputLabel>Location</InputLabel> {/* The label */}
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
                <label htmlFor="profilePhotoUpload" style={{ cursor: 'pointer', width: '100%' }}>
                  <Box
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 3,
                      padding: 1.5,
                      backgroundColor: '#f9f9f9',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      
                    }}
                  >
                    <FormControl fullWidth>
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <Avatar
                          alt="Profile Photo"
                          src={driver.profilePhoto instanceof File ? URL.createObjectURL(driver.profilePhoto) : undefined}
                          sx={{
                            width: 70,
                            height: 70,
                            border: '2px solid #90caf9',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                          }}
                          
                        />
                        
                        <Box sx={{ display: 'flex', gap: 1, marginTop: 1.5 }}>
                          <IconButton
                            color="primary"
                            component="label"
                          >
                            <CloudUploadIcon sx={{ fontSize: 22 }} />
                            <input
                              id="profilePhotoUpload"
                              type="file"
                              name="profilePhoto"
                              accept="image/*"
                              onChange={handleChange}
                              hidden
                            />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => {
                              setDriver((prev) => ({
                                ...prev,
                                profilePhoto: null,
                              }));
                            }}
                            sx={{
                              bgcolor: '#f5f5f5',
                              borderRadius: '50%',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                              '&:hover': {
                                bgcolor: '#ffcccc',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                              },
                            }}
                          >
                            <ClearIcon sx={{ fontSize: 22 }} />
                          </IconButton>
                        </Box>
                        {driver.profilePhoto && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{
                              marginTop: 0.8,
                              textAlign: 'center',
                              color: '#888',
                            }}
                          >
                            {driver.profilePhoto.name}
                          </Typography>
                        )}
                      </Box>
                    </FormControl>
                  </Box>
                  <input
                    id="profilePhotoUpload"
                    type="file"
                    name="profilePhoto"
                    accept="image/*"
                    onChange={handleChange}
                    hidden
                  />
                </label>
              </Grid>


              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {editingId ? 'Update Driver' : 'Add Driver'}
                </Button>
              </Grid>
            </Grid>
          </form>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        </Paper>

        {/* Driver List */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Driver Name</StyledTableCell>
                <StyledTableCell>Driver Phone</StyledTableCell>
                <StyledTableCell>Vehicle Color</StyledTableCell>
                <StyledTableCell>Vehicle Licence Plate</StyledTableCell>
                <StyledTableCell>Driver Location</StyledTableCell>
                <StyledTableCell>Profile Photo</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDrivers.map((driver) => (
                <StyledTableRow key={driver.id}>
                  <TableCell>{driver.driverName}</TableCell>
                  <TableCell>{driver.driverPhone}</TableCell>
                  <TableCell>{driver.vehicleColor}</TableCell>
                  <TableCell>{driver.vehicleLicencePlate}</TableCell>
                  <TableCell>{driver.driverLocation}</TableCell>
                  <TableCell>
                    {driver.profilePhoto && (
                      <img
                        src={`http://localhost:8082/uploads/${driver.profilePhoto}`}
                        alt={`${driver.driverName} profile`}
                        width="50"
                        height="50"
                        style={{
                          borderRadius: '50%',
                          border: '1px solid #1976d2', // Add a border with your preferred color
                          padding: '2px',
                        }}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <Button variant="outlined" onClick={() => handleEdit(driver)}>
                      Edit
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => handleDelete(driver.id)} sx={{ marginLeft: 1 }}>
                      Delete
                    </Button>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        <Stack
          direction="column"
          spacing={2}
          alignItems="center"
          sx={{
            marginTop: 4,
            padding: 3,
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#616161',
              fontWeight: '500',
            }}
          >
            {`Showing ${Math.min((page - 1) * rowsPerPage + 1, filteredDrivers.length)} to ${Math.min(
              page * rowsPerPage,
              filteredDrivers.length
            )} of ${filteredDrivers.length} drivers`}
          </Typography>
          <Pagination
            count={Math.ceil(filteredDrivers.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                padding: '8px 16px',
                borderRadius: '50px',
                backgroundColor: '#f5f5f5',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                },
              },
              '& .Mui-selected': {
                backgroundColor: '#1976d2',
                color: '#ffffff',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              },
            }}
          />
        </Stack>

      </Stack>
    </AdminLayout>
  );
};

export default DriverForm;
