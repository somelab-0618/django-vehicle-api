import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = 'http://localhost:8000/';

// Segment取得
export const fetchAsyncGetSegments = createAsyncThunk('segment/get', async () => {
  const res = await axios.get(`${apiUrl}api/segments/`, {
    headers: {
      Authorization: `token ${localStorage.token}`,
    },
  });
  return res.data;
});

// Segment作成
export const fetchAsyncCreateSegments = createAsyncThunk(
  'segment/post',
  async (segment) => {
    const res = await axios.post(`${apiUrl}api/segments/`, {
      headers: {
        'Content-type': 'application/json',
        Authorization: `token ${localStorage.token}`,
      },
    });
    return res.data;
  }
);

// Segment更新
export const fetchAsyncUpdateSegments = createAsyncThunk(
  'segment/put',
  async (segment) => {
    const res = await axios.put(`${apiUrl}api/segments/${segment.id}`, segment, {
      headers: {
        'Content-type': 'application/json',
        Authorization: `token ${localStorage.token}`,
      },
    });
    return res.data;
  }
);

// Segment削除
export const fetchAsyncDeleteSegments = createAsyncThunk(
  'segment/delete',
  async (id) => {
    await axios.delete(`${apiUrl}api/segments/${id}`, {
      headers: {
        'Content-type': 'application/json',
        Authorization: `token ${localStorage.token}`,
      },
    });

    return id;
  }
);

// Brand取得
export const fetchAsyncGetBrands = createAsyncThunk('brand/get', async () => {
  const res = await axios.get(`${apiUrl}api/brand/`, {
    headers: {
      Authorization: `token ${localStorage.token}`,
    },
  });
  return res.data;
});

// Brand作成
export const fetchAsyncCreateBrand = createAsyncThunk(
  'brand/post',
  async (brand) => {
    const res = await axios.post(`${apiUrl}api/brand/`, {
      headers: {
        'Content-type': 'application/json',
        Authorization: `token ${localStorage.token}`,
      },
    });
    return res.data;
  }
);

// Brand更新
export const fetchAsyncUpdateBrand = createAsyncThunk('brand/put', async (brand) => {
  const res = await axios.put(`${apiUrl}api/brand/${brand.id}`, brand, {
    headers: {
      'Content-type': 'application/json',
      Authorization: `token ${localStorage.token}`,
    },
  });
  return res.data;
});

// Brand削除
export const fetchAsyncDeleteBrand = createAsyncThunk('brand/delete', async (id) => {
  await axios.delete(`${apiUrl}api/brands/${id}`, {
    headers: {
      'Content-type': 'application/json',
      Authorization: `token ${localStorage.token}`,
    },
  });

  return id;
});

// Vehicle取得
export const fetchAsyncGetVehicles = createAsyncThunk('vehicle/get', async () => {
  const res = await axios.get(`${apiUrl}api/vehicles/`, {
    headers: {
      Authorization: `token ${localStorage.token}`,
    },
  });
  return res.data;
});

// Vehicle作成
export const fetchAsyncCreateVehicle = createAsyncThunk(
  'vehicle/post',
  async (vehicle) => {
    const res = await axios.post(`${apiUrl}api/vehicle/`, {
      headers: {
        'Content-type': 'application/json',
        Authorization: `token ${localStorage.token}`,
      },
    });
    return res.data;
  }
);

// Vehicle更新
export const fetchAsyncUpdateVehicle = createAsyncThunk(
  'vehicle/put',
  async (vehicle) => {
    const res = await axios.put(`${apiUrl}api/vehicle/${vehicle.id}`, vehicle, {
      headers: {
        'Content-type': 'application/json',
        Authorization: `token ${localStorage.token}`,
      },
    });
    return res.data;
  }
);

// Vehicle削除
export const fetchAsyncDeleteVehicle = createAsyncThunk(
  'vehicle/delete',
  async (id) => {
    await axios.delete(`${apiUrl}api/vehicles/${id}`, {
      headers: {
        'Content-type': 'application/json',
        Authorization: `token ${localStorage.token}`,
      },
    });

    return id;
  }
);

export const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: {
    segments: [
      {
        id: 0,
        segment_name: '',
      },
    ],
    brands: [
      {
        id: 0,
        brand_name: '',
      },
    ],
    vehicles: [
      {
        id: 0,
        vehicle_name: '',
        release_year: 2020,
        price: 0.0,
        segment: 0,
        brand: 0,
        segment_name: '',
        brand_name: '',
      },
    ],
    // 以下、編集途中のstateを管理する
    editedSegment: {
      id: 0,
      segment_name: '',
    },
    editedBrand: {
      id: 0,
      brand_name: '',
    },
    editedVehicle: {
      id: 0,
      vehicle_name: '',
      release_year: 2020,
      price: 0.0,
      segment: 0,
      brand: 0,
      // segment_nameとbrand_nameはgetしたときに返ってくるだけなので、
      // 編集対象の属性ではない
    },
  },
  reducers: {
    // actonの定義
    editSegment(state, action) {
      state.editedSegment = action.payload;
    },
    editBrand(state, action) {
      state.editedBrand = action.payload;
    },
    editVehicle(state, action) {
      state.editedBrand = action.payload;
    },
    // 非同期関数の後続処理
    extraReducers: (builder) => {
      // Segments
      builder.addCase(fetchAsyncGetSegments.fulfilled, (state, action) => {
        return {
          ...state,
          segments: action.payload,
        };
      });
      builder.addCase(fetchAsyncCreateSegments.fulfilled, (state, action) => {
        return {
          ...state,
          segments: [...state, action.payload],
        };
      });
      builder.addCase(fetchAsyncUpdateSegments.fulfilled, (state, action) => {
        return {
          ...state,
          segments: state.segments.map((seg) =>
            seg.id === action.payload.id ? action.payload : seg
          ),
        };
      });
      builder.addCase(fetchAsyncDeleteSegments.fulfilled, (state, action) => {
        return {
          ...state,
          segments: state.segments.filter((seg) => seg.id !== action.payload),
          vehicles: state.vehicles.filter((veh) => veh.segment !== action.payload),
        };
      });
      // Brands
      builder.addCase(fetchAsyncGetBrands.fulfilled, (state, action) => {
        return {
          ...state,
          brand: action.payload,
        };
      });
      builder.addCase(fetchAsyncCreateBrand.fulfilled, (state, action) => {
        return {
          ...state,
          brand: [...state, action.payload],
        };
      });
      builder.addCase(fetchAsyncUpdateBrand.fulfilled, (state, action) => {
        return {
          ...state,
          brand: state.brand.map((brand) =>
            brand.id === action.payload.id ? action.payload : brand
          ),
        };
      });
      builder.addCase(fetchAsyncDeleteBrand.fulfilled, (state, action) => {
        return {
          ...state,
          brand: state.brand.filter((brand) => brand.id !== action.payload),
          vehicles: state.vehicles.filter((veh) => veh.brand !== action.payload),
        };
      });

      // Vehicles
      builder.addCase(fetchAsyncGetVehicles.fulfilled, (state, action) => {
        return {
          ...state,
          vehicle: action.payload,
        };
      });
      builder.addCase(fetchAsyncCreateVehicle.fulfilled, (state, action) => {
        return {
          ...state,
          vehicle: [...state, action.payload],
        };
      });
      builder.addCase(fetchAsyncUpdateVehicle.fulfilled, (state, action) => {
        return {
          ...state,
          vehicle: state.vehicles.map((vehicle) =>
            vehicle.id === action.payload.id ? action.payload : vehicle
          ),
        };
      });
      builder.addCase(fetchAsyncDeleteVehicle.fulfilled, (state, action) => {
        return {
          ...state,
          vehicles: state.vehicles.filter((veh) => veh.vehicle !== action.payload),
        };
      });
    },
  },
});

export const { editSegment, editBrand, editVehicle } = vehicleSlice.actions;

export const selectSegments = (state) => state.vehicle.segments;
export const selectEditedSegment = (state) => state.vehicle.editedSegment;
export const selectBrands = (state) => state.vehicle.brands;
export const selectEditedBrand = (state) => state.vehicle.editedBrand;
export const selectVehicles = (state) => state.vehicle.vehicles;
export const selectEditedVehicle = (state) => state.vehicle.editedVehicle;

export default vehicleSlice.reducer;
