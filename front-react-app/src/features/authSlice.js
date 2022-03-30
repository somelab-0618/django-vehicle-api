import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = 'http://localhost:8000/';

// Tokenを取得する関数 createAsyncThunk('アクション名', 非同期関数)
export const fetchAsyncLogin = createAsyncThunk('login/post', async (auth) => {
  const res = await axios.post(`${apiUrl}api/auth/`, auth, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
});

// ユーザー作成用関数
export const fetchAsyncRegister = createAsyncThunk('register/post', async (auth) => {
  const res = await axios.post(`${apiUrl}api/create/`, auth, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
});

export const fetchAsyncGetProfile = createAsyncThunk('profile/get', async () => {
  const res = await axios.get(`${apiUrl}api/profile/`, {
    headers: {
      Authorization: `token ${localStorage.token}`,
    },
  });
  return res.data;
});

const initialState = {
  profile: {
    id: 0,
    username: '',
  },
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ログイン成功時の後続処理
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
      // fetchAsyncLogin関数のreturnの値がaction.payloadに入っている
      localStorage.setItem('token', action.payload.token);
    });
    builder.addCase(fetchAsyncGetProfile.fulfilled, (state, action) => {
      // fetchAsyncGetProfile関数のreturnの値がaction.payloadに入っている
      return {
        ...state,
        profile: action.payload,
      };
    });
  },
});

// コンポーネントからstateを参照するためexportする
export const selectProfile = (state) => state.auth.profile;

//  reducerを返す
export default authSlice.reducer;
