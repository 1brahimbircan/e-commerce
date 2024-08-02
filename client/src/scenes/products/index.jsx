import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  Typography,
  Rating,
  useTheme,
  useMediaQuery,
  IconButton,
  CardActions,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Divider,
  Paper
} from "@mui/material";
import Header from "components/Header";
import { useGetProductsQuery, useDeleteProductMutation } from "state/api";
import FlexBetween from "components/FlexBetween";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  RateReviewOutlined,
  DeleteOutline,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

const Product = ({
  _id,
  name,
  description,
  price,
  rating,
  category,
  image,
  brand,
  numReviews,
  countInStock,
  dateCreated,
  images,
  onDelete,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);

  const handleEditClick = () => {
    navigate(`/edit-product/${_id}`);
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(_id);
    setOpenDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
  };

  const handleReviewClick = () => {
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
  };

  return (
    <>
      <Card
        sx={{
          backgroundImage: "none",
          backgroundColor: theme.palette.background.alt,
          borderRadius: "0.55rem",
          transition: "0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 3,
          },
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Box
            component="img"
            src={image}
            alt={name}
            sx={{
              width: "100%",
              height: 140,
              objectFit: "cover",
              borderRadius: "0.5rem",
              mb: 1,
            }}
          />
          <Typography variant="h6" noWrap sx={{ mb: 0.5 }}>
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ mb: 0.5 }}
          >
            {category.name}
          </Typography>
          <FlexBetween>
            <Typography variant="h6" color={theme.palette.secondary[400]}>
              {Number(price).toFixed(2)} TL
            </Typography>
            <Box gap="0.1rem" sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                ({numReviews})
              </Typography>
              <Rating value={rating} readOnly size="small" />
            </Box>
          </FlexBetween>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", p: 1.5 }}>
          <IconButton
            size="small"
            onClick={handleEditClick}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleReviewClick}
          >
            <RateReviewOutlined fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDeleteClick}
          >
            <DeleteOutline fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "0.3s",
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </CardActions>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            <Typography variant="body2" paragraph>
              {description}
            </Typography>
            <Typography variant="caption" display="block">
              Brand: {brand}
            </Typography>
            <Typography variant="caption" display="block">
              Stock: {countInStock}
            </Typography>
            <Typography variant="caption" display="block">
              Created: {new Date(dateCreated).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Collapse>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={openReviewDialog}
        onClose={handleCloseReviewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box
                  component="img"
                  src={image}
                  alt="Product"
                  sx={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6">{name}</Typography>
                <Typography variant="body1" paragraph>
                  {description}
                </Typography>
                <Typography variant="caption" display="block">
                  Brand: {brand}
                </Typography>
                <Typography variant="caption" display="block">
                  Stock: {countInStock}
                </Typography>
                <Typography variant="caption" display="block">
                  Created: {new Date(dateCreated).toLocaleDateString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Gallery</Typography>
                {images.length > 0 ? (
                  <Grid container spacing={2}>
                    {images.map((img, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper elevation={3} sx={{ p: 1 }}>
                          <Box
                            component="img"
                            src={img}
                            alt={`gallery-image-${index}`}
                            sx={{
                              width: "100%",
                              height: 150,
                              objectFit: "cover",
                              borderRadius: "0.5rem",
                            }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    This product does not have gallery images.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Products = () => {
  const { data, isLoading } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();

  const isNonMobile = useMediaQuery("(min-width: 1000px)");
  const navigate = useNavigate();
  const theme = useTheme();

  const handleAddProductClick = () => {
    navigate("/add-product");
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id).unwrap();
    } catch (error) {
      console.error("Failed to delete the product", error);
    }
  };

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="PRODUCTS" subtitle="See your list of products." />
        <Button color="secondary" variant="contained" onClick={handleAddProductClick} sx={{color:theme.palette.secondary[900],fontWeight:"bold"}}>
          Add Product
        </Button>
      </FlexBetween>

      {data || !isLoading ? (
        <Box
          mt="20px"
          display="grid"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          justifyContent="space-between"
          rowGap="20px"
          columnGap="1.33%"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
          }}
        >
          {data?.map(
            ({
              _id,
              name,
              description,
              price,
              rating,
              category,
              image,
              brand,
              numReviews,
              countInStock,
              dateCreated,
              images,
            }) => (
              <Product
                key={_id}
                _id={_id}
                name={name}
                description={description}
                price={price}
                rating={rating}
                category={category}
                image={image}
                brand={brand}
                numReviews={numReviews}
                countInStock={countInStock}
                dateCreated={dateCreated}
                images={images}
                onDelete={handleDeleteProduct}
              />
            )
          )}
        </Box>
      ) : (
        <>Loading...</>
      )}
    </Box>
  );
};

export default Products;
