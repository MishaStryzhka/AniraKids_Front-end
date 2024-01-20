import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

axios.defaults.baseURL = 'https://anira-kids-back-end.onrender.com';
// axios.defaults.baseURL = 'http://Localhost:4000';

/*
 * POST @ /users/updateLangusge
 * query: {langusge}
 */
export const updateLanguage = createAsyncThunk(
  'settings/updateLanguage',
  async ({ language }, thunkAPI) => {
    // console.log('credentials', credentials);

    // const { language } = credentials;
    console.log('language', language);

    try {
      const res = await axios.patch(
        `api/settings/updateLanguage?language=${language}`
      );
      console.log('res.data', res.data);
      return res.data;
    } catch (error) {
      console.log('error', error);

      return thunkAPI.rejectWithValue({
        status: error.response.status,
        message: error.response.data.message,
      });
    }
  }
);
