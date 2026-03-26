import { createSlice } from "@reduxjs/toolkit";
const initialVal = {
  projects: [],
  isProjectLoading: false,
  isProjectLoaded: false,
};

const projectSlice = createSlice({
  name: "project",
  initialState: initialVal,
  reducers: {
    setProjects: (state, action) => {
      state.projects = [...action.payload];
    },
    setIsProjectLoading: (state, action) => {
      state.isProjectLoading = action.payload;
    },
    setIsProjectLoaded: (state, action) => {
      state.isProjectLoaded = action.payload;
    },
  },
});

export const {
  setProjects,
  setIsProjectLoading,
  setIsProjectLoaded,
} = projectSlice.actions;

export default projectSlice.reducer;
