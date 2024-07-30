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
} from "@mui/material";
import Header from "components/Header";
import { useGetProductsQuery } from "state/api";
import FlexBetween from "components/FlexBetween";
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
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
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
          onClick={() => console.log("Edit clicked for:", _id)}
        >
          <EditOutlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => console.log("Review clicked for:", _id)}
        >
          <RateReviewOutlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => console.log("Delete clicked for:", _id)}
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
  );
};

const Products = () => {
  const { data, isLoading } = useGetProductsQuery();
  
  const isNonMobile = useMediaQuery("(min-width: 1000px)");

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="PRODUCTS" subtitle="See your list of products." />
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
