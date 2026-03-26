import { createSlice } from "@reduxjs/toolkit";
const initialVal = {
  tasks: [],
  isTaskLoading: false,
  isTaskLoaded: false,
};

const taskSlice = createSlice({
  name: "task",
  initialState: initialVal,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = [...action.payload];
    },
    setIsTaskLoading: (state, action) => {
      state.isTaskLoading = action.payload;
    },
    setIsTaskLoaded: (state, action) => {
      state.isTaskLoaded = action.payload;
    },
  },
});

export const {
  setTasks,
  setIsTaskLoading,
  setIsTaskLoaded,
} = taskSlice.actions;

export default taskSlice.reducer;
