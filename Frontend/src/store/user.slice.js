import { createSlice } from "@reduxjs/toolkit";
import Axios from "../utils/axios";

const initialVal = {
  userDetails: null,
  isUserLoading: false,
  isUserLoaded: false,
  isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
};

const userSlice = createSlice({
  name: "user",
  initialState: initialVal,
  reducers: {
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    setIsUserLoading: (state, action) => {
      state.isUserLoading = action.payload;
    },
    setIsUserLoaded: (state, action) => {
      state.isUserLoaded = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const {
  setUserDetails,
  setIsUserLoading,
  setIsUserLoaded,
  setIsAuthenticated,
} = userSlice.actions;

export default userSlice.reducer;
