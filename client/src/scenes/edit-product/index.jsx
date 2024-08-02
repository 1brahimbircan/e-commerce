import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Header from "components/Header";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useGetCategoriesQuery,
} from "state/api";
import { useParams, useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";

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

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: product,
    error: productError,
    isLoading: isProductLoading,
  } = useGetProductByIdQuery(id);
  const {
    data: categories,
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = useGetCategoriesQuery();
  const [updateProduct] = useUpdateProductMutation();
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    richDescription: "",
    category: "",
    image: null,
    currentImageUrl: "",
    brand: "",
    countInStock: "",
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddGallery = () => {
    navigate(`/add-gallery/${id}`);
  }

  useEffect(() => {
    if (product) {
      setProductData({
        name: product.name,
        price: product.price,
        description: product.description,
        richDescription: product.richDescription,
        category: product.category._id,
        image: null,
        currentImageUrl: product.image,
        brand: product.brand,
        countInStock: product.countInStock,
      });
      setSelectedFileName(product.image ? product.image.split("/").pop() : "");
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: name === "category" ? value : value.trim(),
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData((prev) => ({ ...prev, image: file, currentImageUrl: "" }));
      setSelectedFileName(file.name);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!productData.name) newErrors.name = "Name is required";
    if (!productData.price) newErrors.price = "Price is required";
    else if (isNaN(productData.price))
      newErrors.price = "Price must be a number";
    if (!productData.description)
      newErrors.description = "Description is required";
    if (!productData.category) newErrors.category = "Category is required";
    if (!productData.countInStock)
      newErrors.countInStock = "Stock count is required";
    else if (!Number.isInteger(Number(productData.countInStock)))
      newErrors.countInStock = "Stock count must be an integer";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProduct = async () => {
    if (validateForm()) {
      try {
        const formData = new FormData();
        if (productData.image) {
          formData.append("image", productData.image);
        }
        for (const key in productData) {
          if (key !== "image" && key !== "currentImageUrl") {
            formData.append(key, productData[key]);
          }
        }

        await updateProduct({ id, formData }).unwrap();
        setSnackbar({
          open: true,
          message: "Product updated successfully!",
          severity: "success",
        });
      } catch (err) {
        console.error("Failed to update product:", err);
        setSnackbar({
          open: true,
          message: "Failed to update product. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleImageClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Header
          title="EDIT PRODUCT"
          subtitle="Update the details of the product"
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAddGallery}
          sx={{ fontWeight: "bold" }}
        >
          Add Gallery Images
        </Button>
      </Box>
      <Box
        mt="20px"
        sx={{
          p: "2rem",
          backgroundImage: "none",
          backgroundColor: theme.palette.background.alt,
          borderRadius: "0.55rem",
        }}
      >
        {isProductLoading || isCategoriesLoading ? (
          <Typography>Loading...</Typography>
        ) : productError || categoriesError ? (
          <Typography>Error loading product or categories</Typography>
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
                  value={productData.category || ""}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography color="error">{errors.category}</Typography>
                )}
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
              <Box>
                <FlexBetween gap="0.5rem">
                  {productData.currentImageUrl && (
                    <Box
                      component="img"
                      src={productData.currentImageUrl}
                      alt="profile"
                      borderRadius="5%"
                      width="56px"
                      height="56px"
                      sx={{ objectFit: "cover", cursor: "pointer" }}
                      onClick={handleImageClick}
                    />
                  )}
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ height: "56px" }}
                  >
                    {productData.currentImageUrl
                      ? "Change Image"
                      : "Upload Image"}
                    <VisuallyHiddenInput
                      type="file"
                      onChange={handleImageChange}
                    />
                  </Button>
                </FlexBetween>

                {selectedFileName && (
                  <Typography variant="body2" mt={1}>
                    Selected file: {selectedFileName}
                  </Typography>
                )}
                {errors.image && (
                  <Typography color="error">{errors.image}</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleUpdateProduct}
                fullWidth
                sx={{ fontWeight: "bold" }}
              >
                Update Product
              </Button>
            </Grid>
          </Grid>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <img
            src={productData.currentImageUrl}
            alt="Enlarged Product"
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            onClick={handleCloseDialog}
            sx={{ color: theme.palette.secondary[900], fontWeight: "bold" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditProduct;
