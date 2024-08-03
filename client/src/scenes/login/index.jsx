import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUserId, setIsAdmin, setExpirationTime } from "state";
import { useLoginMutation } from "state/api";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await login({ email, password }).unwrap();

      if (response.token) {
        const decodedToken = jwtDecode(response.token);
        const userId = decodedToken.userId;
        const isAdmin = decodedToken.isAdmin;

        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("isAdmin", JSON.stringify(isAdmin));
        localStorage.setItem("expirationTime", decodedToken.exp);

        dispatch(setToken(response.token));
        dispatch(setUserId(userId));
        dispatch(setIsAdmin(isAdmin));
        dispatch(setExpirationTime(decodedToken.exp));

        if (!isAdmin) {
          setError("You don't have admin privileges");
        } else {
          navigate("/admin-dashboard");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={4}
          sx={{
            padding: 4,
            borderRadius: 2,
            textAlign: "center",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main", margin: "0 auto" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography sx={{mt:2}} variant="h5" component="h1" gutterBottom>
            E-COMMERCE ADMIN
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                borderRadius: "5px",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "secondary.dark",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "secondary.dark", // Focus durumunda renk kodunu değiştirebilirsiniz
                },
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                borderRadius: "5px",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "secondary.dark",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "secondary.dark", // Focus durumunda renk kodunu değiştirebilirsiniz
                },
              }}
            />
            {error && (
              <Typography color="error" align="center" paragraph>
                {error}
              </Typography>
            )}
            <Box sx={{ position: "relative", mt: 3, mb: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                disabled={isLoading}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "secondary.main",
                  "&:hover": {
                    backgroundColor: "secondary.dark",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Login"
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
