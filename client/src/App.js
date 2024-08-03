import React, { useEffect, useCallback, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { themeSettings } from "./theme";
import Layout from "./scenes/layout";
import Dashboard from "./scenes/dashboard";
import Products from "./scenes/products";
import AddProduct from "./scenes/add-product";
import EditProduct from "./scenes/edit-product";
import AddGallery from "./scenes/add-gallery";
import { setUserId, setToken, setIsAdmin, setExpirationTime } from "./state";
import Login from "./scenes/login";
import { useVerifyTokenMutation } from "./state/api";
import ProtectedRoute from "./components/ProtectedRoute";
import { jwtDecode } from "jwt-decode";

const AppContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin, token, expirationTime } = useSelector(
    (state) => state.global
  );
  const [verifyToken] = useVerifyTokenMutation();
  const [isInitialized, setIsInitialized] = useState(false);

  const handleLogout = useCallback(() => {
    dispatch(setToken(""));
    dispatch(setUserId(""));
    dispatch(setIsAdmin(false));
    dispatch(setExpirationTime(""));
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("expirationTime");
    navigate("/login");
  }, [dispatch, navigate]);

  const checkTokenExpiration = useCallback(() => {
    const storedExpirationTime = localStorage.getItem("expirationTime");
    if (storedExpirationTime) {
      const expirationTime = parseInt(storedExpirationTime, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= expirationTime) {
        alert("Your session has expired. Please log in again.");
        handleLogout();
      }
    }
  }, [handleLogout]);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem("token");
    const storedExpirationTime = localStorage.getItem("expirationTime");
    if (storedToken && storedExpirationTime && !isInitialized) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = parseInt(storedExpirationTime, 10);

      if (currentTime >= expirationTime) {
        console.error("Token has expired");
        alert("Your session has expired. Please log in again.");
        handleLogout();
      } else {
        try {
          const response = await verifyToken().unwrap();
          dispatch(setToken(storedToken));
          dispatch(setUserId(response.userId));
          dispatch(setIsAdmin(response.isAdmin));
          dispatch(setExpirationTime(expirationTime.toString()));
        } catch (error) {
          console.error("Token verification failed:", error);
          alert("Your session has expired. Please log in again.");
          handleLogout();
        }
      }
    }
    setIsInitialized(true);
  };

  useEffect(() => {
    initializeAuth(); 
  }, []);

  useEffect(() => {
    const intervalId = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(intervalId);
  }, [checkTokenExpiration]);

  if (!isInitialized) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAdmin ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={!!token && isAdmin}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="edit-product/:id" element={<EditProduct />} />
        <Route path="add-gallery/:id" element={<AddGallery />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAdmin ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
};

const App = () => {
  const mode = useSelector((state) => state.global.mode);
  const theme = React.useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
