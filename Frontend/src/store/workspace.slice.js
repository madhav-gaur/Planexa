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
    mergeWorkspace: (state, action) => {
      const w = action.payload;
      if (!w?._id) return;
      const id = w._id.toString();
      state.workspaces = state.workspaces.map((item) =>
        item._id?.toString() === id ? { ...item, ...w } : item,
      );
      if (state.currWorkspace?._id?.toString() === id) {
        state.currWorkspace = { ...state.currWorkspace, ...w };
      }
    },
    removeWorkspace: (state, action) => {
      const workspaceId = action.payload?.toString();
      state.workspaces = state.workspaces.filter(
        (item) => item._id?.toString() !== workspaceId,
      );
      if (state.currWorkspace?._id?.toString() === workspaceId) {
        state.currWorkspace = state.workspaces[0] || {};
      }
    },
  },
});

export const {
  setWorkspaces,
  setWorkspaceMember,
  setIsWorkspaceLoading,
  setIsWorkspaceLoaded,
  setCurrWorkspace,
  setIsWorkspaceMemberLoaded,
  mergeWorkspace,
  removeWorkspace,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
