import React from 'react';
import { TextField, Paper, Typography } from '@mui/material';

const DriverFilter = ({ searchTerm, handleSearchChange }) => {
  return (
    <Paper elevation={2} sx={{ padding: 2, marginBottom: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Drivers
      </Typography>
      <TextField
        label="Search by Name or Licence Plate"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
      />
    </Paper>
  );
};

export default DriverFilter;
