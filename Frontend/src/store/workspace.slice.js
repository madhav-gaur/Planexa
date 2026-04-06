import { createSlice } from "@reduxjs/toolkit";
const initialVal = {
  workspaces: [],
  workspaceMember: [],
  currWorkspace: {},
  isWorkspaceLoading: false,
  isWorkspaceLoaded: false,
  isWorkspaceMemberLoaded: false,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: initialVal,
  reducers: {
    setWorkspaces: (state, action) => {
      state.workspaces = [...action.payload];
    },
    setWorkspaceMember: (state, action) => {
      state.workspaceMember = [...action.payload];
    },
    setCurrWorkspace: (state, action) => {
      state.currWorkspace = action.payload;
    },
    setIsWorkspaceLoading: (state, action) => {
      state.isWorkspaceLoading = action.payload;
    },
    setIsWorkspaceLoaded: (state, action) => {
      state.isWorkspaceLoaded = action.payload;
    },
    setIsWorkspaceMemberLoaded: (state, action) => {
      state.isWorkspaceMemberLoaded = action.payload;
    },
  },
});

export const {
  setWorkspaces,
  setWorkspaceMember,
  setIsWorkspaceLoading,
  setIsWorkspaceLoaded,
  setCurrWorkspace,
  setIsWorkspaceMemberLoaded
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
