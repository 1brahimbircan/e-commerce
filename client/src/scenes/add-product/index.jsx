import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Select,
  MenuItem,
  useTheme,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import Header from "components/Header";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAddProductMutation, useGetCategoriesQuery } from "state/api";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const AddProduct = () => {
  const { data: categories, error: categoriesError, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const [addProduct] = useAddProductMutation();
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    richDescription: "",
    category: "",
    image: null,
    brand: "",
    countInStock: "",
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData((prev) => ({ ...prev, image: file }));
      setSelectedFileName(file.name);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!productData.name) newErrors.name = "Name is required";
    if (!productData.price) newErrors.price = "Price is required";
    else if (isNaN(productData.price)) newErrors.price = "Price must be a number";
    if (!productData.description) newErrors.description = "Description is required";
    if (!productData.category) newErrors.category = "Category is required";
    if (!productData.image) newErrors.image = "Image is required";
    if (!productData.countInStock) newErrors.countInStock = "Stock count is required";
    else if (!Number.isInteger(Number(productData.countInStock))) newErrors.countInStock = "Stock count must be an integer";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async () => {
    if (validateForm()) {
      try {
        const formData = new FormData();
        for (const key in productData) {
          formData.append(key, productData[key]);
        }
        await addProduct(formData).unwrap();
        setProductData({
          name: "",
          price: "",
          description: "",
          richDescription: "",
          category: "",
          image: null,
          brand: "",
          countInStock: "",
        });
        setSelectedFileName("");
        setSnackbar({ open: true, message: "Product added successfully!", severity: "success" });
      } catch (err) {
        console.error("Failed to add product:", err);
        setSnackbar({ open: true, message: "Failed to add product. Please try again.", severity: "error" });
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      <Header
        title="ADD PRODUCT"
        subtitle="Fill in the details to add a new product to the catalog"
      />
      <Box
        mt="20px"
        sx={{
          p: "2rem",
          backgroundImage: "none",
          backgroundColor: theme.palette.background.alt,
          borderRadius: "0.55rem",
        }}
      >
        {isCategoriesLoading ? (
          <Typography>Loading categories...</Typography>
        ) : categoriesError ? (
          <Typography>Error loading categories</Typography>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Price"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!errors.price}
                helperText={errors.price}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                required
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Rich Description"
                name="richDescription"
                value={productData.richDescription}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={6}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.category}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <Typography color="error">{errors.category}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Brand"
                name="brand"
                value={productData.brand}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Stock Count"
                name="countInStock"
                value={productData.countInStock}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!errors.countInStock}
                helperText={errors.countInStock}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ height: "56px" }}
              >
                Upload Image
                <VisuallyHiddenInput type="file" onChange={handleImageChange} />
              </Button>
              {selectedFileName && (
                <Typography variant="body2" mt={1}>
                  Selected file: {selectedFileName}
                </Typography>
              )}
              {errors.image && <Typography color="error">{errors.image}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAddProduct}
                fullWidth
                sx={{ fontWeight: "bold" }}
              >
                Add Product
              </Button>
            </Grid>
          </Grid>
        )}
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddProduct;