import axios from "axios";
import Api from "@/services/api";

import { AUTH_ENDPOINTS } from "@/modules/auth/endpoint/auth.endpoint";

import type {
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  VerifyOTPCredentials,
  ForgotPasswordSendOTPCredentials,
  ForgotPasswordResetCredentials,
} from "../types";

/* ==================================================
 * LOGIN
 * ================================================== */

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const response =
      await Api.post<AuthResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials
      );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
        "Login failed"
      );
    }

    throw error;
  }
};

/* ==================================================
 * SIGNUP
 * ================================================== */

export const signup = async (
  credentials: SignupCredentials
): Promise<AuthResponse> => {
  try {
    const response =
      await Api.post<AuthResponse>(
        AUTH_ENDPOINTS.SIGNUP,
        credentials
      );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
        "Signup failed"
      );
    }

    throw error;
  }
};

/* ==================================================
 * LOGOUT
 * ================================================== */

export const logout = async (): Promise<void> => {
  try {
    await Api.post(
      AUTH_ENDPOINTS.LOGOUT,
      {}
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
        "Logout failed"
      );
    }

    throw error;
  }
};

/* ==================================================
 * VERIFY OTP
 * ================================================== */

export const verifyOTP = async (
  credentials: VerifyOTPCredentials
): Promise<AuthResponse> => {
  try {
    const response =
      await Api.post<AuthResponse>(
        AUTH_ENDPOINTS.VERIFY_OTP,
        credentials
      );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
        "OTP verification failed"
      );
    }

    throw error;
  }
};

/* ==================================================
 * FORGOT PASSWORD - SEND OTP
 * ================================================== */

export const forgotPasswordSendOTP = async (
  credentials: ForgotPasswordSendOTPCredentials
): Promise<{ message: string }> => {
  try {
    const response =
      await Api.post<{ message: string }>(
        AUTH_ENDPOINTS.FORGOT_PASSWORD_SEND_OTP,
        credentials
      );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
        "Failed to send OTP"
      );
    }

    throw error;
  }
};

/* ==================================================
 * CHECK AUTH
 * ================================================== */

export const checkAuth = async (): Promise<AuthResponse> => {
  try {
    const response = await Api.get(AUTH_ENDPOINTS.CHECK_AUTH);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: "Not authenticated",
          isAuthenticated: false,
        };
      }

      throw new Error(
        error.response?.data?.message ||
        "Failed to check authentication"
      );
    }

    throw new Error("Failed to check authentication");
  }
};

/* ==================================================
 * FORGOT PASSWORD - VERIFY OTP / RESET
 * ================================================== */

export const forgotPasswordVerifyOTP =
  async (
    credentials: ForgotPasswordResetCredentials
  ): Promise<{ message: string }> => {
    try {
      const response =
        await Api.post<{ message: string }>(
          AUTH_ENDPOINTS
            .FORGOT_PASSWORD_VERIFY_OTP,
          credentials
        );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
          "Failed to reset password"
        );
      }

      throw error;
    }
  };