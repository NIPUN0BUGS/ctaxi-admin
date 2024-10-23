import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Snackbar,
} from '@mui/material';
import { Alert } from '@mui/material';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation (you can enhance this logic)
    if (!username || !password) {
      setError(true);
      return;
    }

    // Call the onLogin function passed from parent to handle login logic
    onLogin(username, password);
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: '100vh' }} // Full height of the viewport
    >
      <Grid item xs={12} sm={8} md={4}>
      <Paper elevation={3} style={{ padding: '20px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '400px' }}>

          <Typography variant="h5" align="center" style={{ marginBottom: '20px' }}>
            Admin Login
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: '20px' }}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Grid>

      {/* Snackbar for error feedback */}
      <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
        <Alert onClose={() => setError(false)} severity="error" sx={{ width: '100%' }}>
          Please enter both username and password!
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default LoginForm;
