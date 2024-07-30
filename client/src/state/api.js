import { createApi , fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = process.env.REACT_APP_API_URL;
const token = process.env.REACT_APP_API_TOKEN;


export const api = createApi({
    reducerPath: 'admin',
    baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            // Token'ı başlıklara ekleyin
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["User","Products"],
    endpoints: (build) => ({
        getUser: build.query({
            query: (id) => `api/v1/users/${id}`,
            providesTags: ['User'],
        }),
        getProducts: build.query({
            query: () => `api/v1/products`,
            providesTags: ['Products'],
        }),
    }),
});

export const { useGetUserQuery, useGetProductsQuery } = api;