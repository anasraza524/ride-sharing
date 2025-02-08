// src/components/Navbar.js
import React, { useContext, useState, useMemo } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box, 
  useMediaQuery, 
  useTheme 
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const navigationLinks = useMemo(() => [
    // { path: "/", label: "Home" },
    { path: "/request-ride", label: "Request Ride" },
    { path: "/ride-history", label: "Ride History" },
    { path: "/nearby-drivers", label: "Nearby Drivers" },
    { path: "/driver-dashboard", label: "Driver Dashboard" },
    { path: "/add-driver", label: "Add Driver", requiresAdmin: true },
  ], []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    handleMenuClose();
  };

  const filteredLinks = navigationLinks.filter(link => {
    if (link.requiresDriver && !auth?.user?.isDriver) return false;
    if (link.requiresAdmin && !auth?.user?.isAdmin) return false;
    return true;
  });

  return (
    <AppBar position="sticky" elevation={4} sx={{ 
      backgroundColor: theme.palette.primary.main,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        padding: { xs: '0 8px', md: '0 16px' }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsCarIcon sx={{ display: { xs: 'none', md: 'block' } }} />
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              fontWeight: 700,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { color: theme.palette.secondary.main }
            }}
          >
            RideShare
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              MenuListProps={{ sx: { minWidth: 180 } }}
            >
              {filteredLinks.map((link) => (
                <MenuItem 
                  key={link.path} 
                  component={Link} 
                  to={link.path} 
                  onClick={handleMenuClose}
                >
                  {link.label}
                </MenuItem>
              ))}
              {auth.token ? (
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              ) : (
                <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
                  Login
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {filteredLinks.map((link) => (
              <Button
                key={link.path}
                color="inherit"
                component={Link}
                to={link.path}
                sx={{
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {link.label}
              </Button>
            ))}
            {auth.token ? (
              <Button
                color="secondary"
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  fontWeight: 600,
                  marginLeft: 2
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                color="secondary"
                variant="contained"
                component={Link}
                to="/login"
                sx={{
                  fontWeight: 600,
                  marginLeft: 2
                }}
              >
                Login
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(Navbar);