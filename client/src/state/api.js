import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.REACT_APP_API_URL;
const token = process.env.REACT_APP_API_TOKEN;

export const api = createApi({
  reducerPath: "admin",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      // Token'ı başlıklara ekleyin
      const token = localStorage.getItem('token');
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Products"],
  endpoints: (build) => ({
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
  }),
});

export const {
  useGetUserQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useUpdateGalleryImagesMutation,
  useDeleteProductMutation,
} = api;
