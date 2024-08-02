import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Snackbar,
  Alert,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  useUpdateGalleryImagesMutation,
  useGetProductByIdQuery,
} from "state/api";
import { useParams } from "react-router-dom";
import Header from "components/Header";

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

const MAX_IMAGES = 5;

const AddGallery = () => {
  const { id } = useParams();
  const { data: product, isLoading: isProductLoading, refetch } = useGetProductByIdQuery(id);
  const [updateGalleryImages, { isLoading }] = useUpdateGalleryImagesMutation();
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [displayImages, setDisplayImages] = useState(product?.images || []);
  const [imagesToSelectForRemoval, setImagesToSelectForRemoval] = useState(new Set());

  useEffect(() => {
    refetch();
  }, [imagesToRemove, refetch]);

  useEffect(() => {
    setDisplayImages(product?.images || []);
  }, [product]);

  const ExistingImages = ({ images }) => (
    <Box mt={2} mb={3}>
      <Typography variant="h6" mb={2} textAlign="center">
        Existing Images
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
        {images.map((image, index) => (
          <Box
            key={index}
            position="relative"
            sx={{
              width: 120,
              height: 120,
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #ddd",
              boxShadow: 1,
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 3,
              },
            }}
          >
            <img
              src={image}
              alt={`existing image ${index}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Tooltip title="Select" onClick={() => toggleSelectImageForRemoval(image)}>
              <IconButton
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "#fff",
                  "&:hover": {
                    backgroundColor: "#f44336",
                  },
                }}
              >
                {imagesToSelectForRemoval.has(image) ? (
                  <RemoveCircleIcon color="error" />
                ) : (
                  <RemoveCircleIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const toggleSelectImageForRemoval = (image) => {
    setImagesToSelectForRemoval((prev) => {
      const updated = new Set(prev);
      if (updated.has(image)) {
        updated.delete(image);
      } else {
        updated.add(image);
      }
      return updated;
    });
  };

  const handleRemoveSelectedImages = () => {
    setImagesToRemove((prev) => [...prev, ...imagesToSelectForRemoval]);
    setDisplayImages((prevImages) => prevImages.filter((image) => !imagesToSelectForRemoval.has(image)));
    setImagesToSelectForRemoval(new Set());
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (
      files.length +
        selectedImages.length +
        (product?.images?.length || 0) -
        imagesToRemove.length >
      MAX_IMAGES
    ) {
      setErrors({
        image: `You can upload a maximum of ${MAX_IMAGES} images.`,
      });
      return;
    }
    setErrors({});
    setSelectedImages((prevImages) => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (
      selectedImages.length === 0 &&
      imagesToRemove.length === 0
    ) {
      setErrors({ image: "Please select at least one image or remove an existing image." });
      return;
    }

    const formData = new FormData();
    [...selectedImages].forEach((image) => {
      formData.append("images", image);
    });
    formData.append("imagesToRemove", JSON.stringify(imagesToRemove));

    try {
      await updateGalleryImages({ id, formData }).unwrap();
      setSnackbar({
        open: true,
        message: "Images successfully uploaded.",
        severity: "success",
      });
      setSelectedImages([]);
      setImagesToRemove([]);
      setDisplayImages((prevImages) => prevImages.filter((image) => !imagesToRemove.includes(image)));
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred while uploading images.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const theme = useTheme();

  // Check if the save button should be enabled
  const isSaveButtonDisabled = !(
    selectedImages.length > 0 ||
    imagesToRemove.length > 0 ||
    displayImages.length > product?.images?.length || // When new images are uploaded
    imagesToRemove.length > 0 // When existing images are removed
  );

  // Check if the remove selected images button should be visible
  const showRemoveSelectedImagesButton = displayImages.length > 0;

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="ADD GALLERY IMAGES" subtitle="Update the product gallery" />
      <Box
        mt="20px"
        sx={{
          p: "2rem",
          backgroundColor: theme.palette.background.alt,
          borderRadius: "0.55rem",
        }}
      >
        {isProductLoading ? (
          <Typography variant="body1" textAlign="center">Loading...</Typography>
        ) : displayImages.length > 0 ? (
          <ExistingImages images={displayImages} />
        ) : (
          <Typography variant="body1" textAlign="center" mb={2}>No images have been uploaded yet.</Typography>
        )}
        {showRemoveSelectedImagesButton && (
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveSelectedImages}
            disabled={imagesToSelectForRemoval.size === 0}
            fullWidth
            sx={{ mb: 2 }}
          >
            Remove Selected Images
          </Button>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{
                height: "56px",
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Select Images (Maximum 5)
              <VisuallyHiddenInput
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {errors.image && (
              <Typography color="error" mt={1} textAlign="center">
                {errors.image}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
              {selectedImages.map((image, index) => (
                <Box
                  key={index}
                  position="relative"
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #ddd",
                    boxShadow: 1,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 3,
                    },
                  }}
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`selected image ${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Tooltip title="Remove">
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "#fff",
                        "&:hover": {
                          backgroundColor: "#f44336",
                        },
                      }}
                    >
                      <RemoveCircleIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleImageUpload}
              sx = {{ fontWeight: "bold" }}
              disabled={isLoading || isSaveButtonDisabled}
              fullWidth
            >
              {isLoading ? "Uploading..." : "Save Changes"}
            </Button>
          </Grid>
        </Grid>
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
    </Box>
  );
};

export default AddGallery;
