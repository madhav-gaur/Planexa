import { createSlice } from "@reduxjs/toolkit";
import Axios from "../utils/axios";

const initialVal = {
  userDetails: null,
  isUserLoading: false,
  isUserLoaded: false,
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
  },
});

export const { setUserDetails, setIsUserLoading, setIsUserLoaded } =
  userSlice.actions;

export default userSlice.reducer;
