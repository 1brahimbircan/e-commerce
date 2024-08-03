import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.REACT_APP_API_URL;

export const api = createApi({
  reducerPath: "admin",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Products", "Product", "Categories"],
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: "api/v1/users/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getUser: build.query({
      query: (id) => `api/v1/users/${id}`,
      providesTags: ["User"],
    }),
    getProducts: build.query({
      query: () => `api/v1/products`,
      providesTags: ["Products"],
    }),
    getProductById: build.query({
      query: (id) => `api/v1/products/${id}`,
      providesTags: ["Product"],
    }),
    getCategories: build.query({
      query: () => `api/v1/categories`,
      providesTags: ["Categories"],
    }),
    addProduct: build.mutation({
      query: (newProduct) => ({
        url: "api/v1/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation({
      query: ({ id, formData }) => ({
        url: `api/v1/products/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Product", "Products"],
    }),
    updateGalleryImages: build.mutation({
      query: ({ id, formData }) => ({
        url: `api/v1/products/gallery-images/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({
        url: `api/v1/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    verifyToken: build.mutation({
      query: () => ({
        url: "api/v1/users/verify-token",
        method: "POST",
        body: { token: localStorage.getItem("token") },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetUserQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useUpdateGalleryImagesMutation,
  useDeleteProductMutation,
  useVerifyTokenMutation,
} = api;