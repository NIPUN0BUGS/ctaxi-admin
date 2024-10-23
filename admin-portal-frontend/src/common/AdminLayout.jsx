import React, { useState } from 'react';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  ListItemIcon,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const drawerWidth = 240;

const AdminLayout = ({ children, searchTerm, handleSearchChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    console.log("Admin logged out"); // Debugging
    localStorage.removeItem('token'); // Example: Remove token if you are using local storage for authentication
    navigate('/login'); // Redirect to the login page after logout
  };

  // Drawer content (side menu)
  const drawer = (
    <div>
      <Toolbar />
      <List>
        <ListItem button onClick={() => navigate('/dashboard')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => navigate('/manage-drivers')}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Manage Drivers" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div style={{ display: 'flex', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Drawer for sidebar navigation */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
        {drawer}
      </Drawer>

      {/* Main content area */}
      <div style={{ flexGrow: 1, paddingLeft: mobileOpen ? drawerWidth : 0 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#1976d2' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { sm: 'block' },
                '&:focus': {
                  outline: 'none', // Remove focus outline
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'clip', 
                width: '200px', 
                padding: '8px', 
                color: 'white' // Set text color to white
              }} 
            > 
              Taxi Admin 
            </Typography>

            {/* Search Bar */}
            {handleSearchChange && (
              <TextField
                placeholder="Search (e.g., ABN-1234 or name)"
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
                margin="normal"
                sx={{
                  background: 'white',
                  borderRadius: '4px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&:hover fieldset': {
                      borderColor: '#115293',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#115293',
                    },
                  },
                }}
              />
            )}
            {/* Logout Button */}
            <Button 
              color="inherit" 
              onClick={handleLogout} 
              sx={{ marginLeft: '20px', display: 'flex', alignItems: 'center', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
            >
              <ExitToAppIcon sx={{ marginRight: '8px' }} />
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Render children passed from parent components */}
        <main style={{ marginTop: '100px', padding: '20px', backgroundColor: '#f4f6f8' }}>{children}</main>
      </div>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
  searchTerm: PropTypes.string,
  handleSearchChange: PropTypes.func,
};

export default AdminLayout;
