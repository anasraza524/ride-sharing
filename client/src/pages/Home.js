import React, { useContext, useState } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Link, 
  Divider, 
  CircularProgress,
  Alert,
  useMediaQuery,
  styled
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const GradientBox = styled(Box)({
  background: 'linear-gradient(135deg, #1976d2 0%, #4a90e2 100%)',
  borderRadius: '8px',
  padding: '32px',
  color: '#ffffff',
});

const Home = () => {
  const { auth, login, logout } = useContext(AuthContext);
  const isMobile = useMediaQuery('(max-width:900px)');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await api.post("/users/login", { email, password });
      const { token, user } = response.data;
      login(token, user._id);
      // Clear form fields after successful login
      setEmail("");
      setPassword("");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '32px 0'
      }}>
        {auth.token ? (
          // Logged-in View
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ 
                padding: '48px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <DirectionsCarIcon sx={{ fontSize: '64px', color: '#1976d2', mb: '16px' }} />
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  marginBottom: '24px',
                  color: '#212121'
                }}>
                  Welcome to RideShare!
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontSize: '1.25rem',
                  marginBottom: '32px',
                  color: '#666'
                }}>
                  You are successfully logged in.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleLogout}
                  sx={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  }}
                >
                  Log Out
                </Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          // Login Form View
          <Grid container spacing={4}>
            {!isMobile && (
              <Grid item md={6}>
                <GradientBox>
                  <Box sx={{ marginBottom: '32px' }}>
                    <DirectionsCarIcon sx={{ fontSize: '48px', mb: '16px' }} />
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700,
                      fontSize: '2.5rem',
                      lineHeight: 1.2
                    }}>
                      RideShare
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.25rem' }}>
                      Your Journey, Our Priority
                    </Typography>
                  </Box>

                  <Box sx={{ marginTop: '32px' }}>
                    <Typography variant="h6" sx={{ 
                      fontSize: '1.25rem',
                      marginBottom: '16px'
                    }}>
                      Why Choose Us?
                    </Typography>
                    {[
                      "Instant ride matching",
                      "24/7 availability",
                      "Real-time tracking",
                      "Secure payments"
                    ].map((feature, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '16px'
                      }}>
                        <CheckCircleIcon sx={{ 
                          marginRight: '12px', 
                          color: '#4caf50' 
                        }} />
                        <Typography>{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                </GradientBox>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Box sx={{ 
                padding: '48px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  marginBottom: '32px',
                  fontSize: '2rem',
                  color: '#212121'
                }}>
                  Welcome Back
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ marginBottom: '24px' }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    sx={{ marginBottom: '24px' }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    type="password"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    sx={{ marginBottom: '24px' }}
                  />

                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    sx={{
                      padding: '12px 24px',
                      marginBottom: '16px',
                      borderRadius: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.1px',
                      backgroundColor: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#1565c0'
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
                  </Button>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                  }}>
                    <Link href="/forgot-password" sx={{ color: '#1976d2' }}>
                      Forgot Password?
                    </Link>
                    <Link href="/signup" sx={{ color: '#1976d2' }}>
                      Create Account
                    </Link>
                  </Box>

                  <Divider sx={{ margin: '32px 0' }}>OR CONTINUE WITH</Divider>

                  <Box sx={{ 
                    display: 'flex', 
                    gap: '16px',
                    justifyContent: 'center'
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<GoogleIcon />}
                      sx={{ 
                        flex: 1,
                        borderColor: '#ddd',
                        color: '#212121'
                      }}
                    >
                      Google
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FacebookIcon />}
                      sx={{ 
                        flex: 1,
                        borderColor: '#ddd',
                        color: '#212121'
                      }}
                    >
                      Facebook
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Home;