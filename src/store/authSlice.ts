import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, LoginRequest, FirebaseRegisterRequest } from "../types/user";
import { login as loginService, logoutRequest, checkSession, loginWithGoogle, registerWithGoogle } from "../services/userServices";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialCheckDone: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialCheckDone: false,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await loginService(credentials);
      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error en login");
    }
  }
);

export const loginWithGoogleThunk = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const data = await loginWithGoogle();
      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error al hacer login con Google");
    }
  }
);

export const registerWithGoogleThunk = createAsyncThunk(
  "auth/registerWithGoogle",
  async (userData: Omit<FirebaseRegisterRequest, 'idToken'>, { rejectWithValue }) => {
    try {
      const data = await registerWithGoogle(userData);
      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error al registrar con Google");
    }
  }
);

export const checkSessionThunk = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const data = await checkSession();
      return data;
    } catch {
      return rejectWithValue("No hay sesión");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await logoutRequest();
  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthState(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // login with Google
      .addCase(loginWithGoogleThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(loginWithGoogleThunk.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogleThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // register with Google
      .addCase(registerWithGoogleThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(registerWithGoogleThunk.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerWithGoogleThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // check session
      .addCase(checkSessionThunk.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialCheckDone = true;
      })
      .addCase(checkSessionThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialCheckDone = true;
      })

      // logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearAuthState, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
