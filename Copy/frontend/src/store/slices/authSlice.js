import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      let userData = { ...action.payload.user };

      // Temporary override to make specific email an admin
      if (userData.email === 'bilalbrahami026@gmail.com') {
        userData.role = 'admin';
      }

      state.user = userData;
      state.token = action.payload.token;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
