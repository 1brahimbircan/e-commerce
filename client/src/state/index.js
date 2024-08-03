import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "dark",
  userId: localStorage.getItem("userId") || "",
  token: localStorage.getItem("token") || "",
  isAdmin: localStorage.getItem("isAdmin") === "true" || false,
  expirationTime: localStorage.getItem("expirationTime") || "",
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
      localStorage.setItem("userId", action.payload);
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    setIsAdmin: (state, action) => {
      state.isAdmin = action.payload;
      localStorage.setItem("isAdmin", JSON.stringify(action.payload));
    },
    setExpirationTime: (state, action) => {
      state.expirationTime = action.payload;
      localStorage.setItem("expirationTime", action.payload);
    },
  },
});

export const { setMode, setUserId, setToken, setIsAdmin, setExpirationTime } = globalSlice.actions;

export default globalSlice.reducer;