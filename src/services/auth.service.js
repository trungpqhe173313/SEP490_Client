import API from "@/utils/axios";

class AuthService {
  // Login function
  async login(username, password) {
    try {
      const response = await API.post("/Account/Login", {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Request OTP for password reset
  async requestPasswordReset(email) {
    try {
      const response = await API.post("/Account/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP to retrieve reset token
  async verifyOtp({ email, otpCode }) {
    try {
      const response = await API.post("/Account/verify-otp", {
        email,
        otpCode
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Confirm OTP token and set new password
  async resetPassword({ resetToken, newPassword }) {
    try {
      const response = await API.post("/Account/reset-password", {
        resetToken,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Store authentication data
  storeAuthData(authData) {
    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("refreshToken", authData.refreshToken);
    localStorage.setItem("userInfo", JSON.stringify(authData.userInfo));
    localStorage.setItem("token", authData.accessToken); // For axios interceptor
  }

  // Get stored user info
  getUserInfo() {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAccessToken();
    return !!token;
  }

  // Logout function
  logout() {
    localStorage.clear();
  }

  async getProfile() {
    try {
      const response = await API.get("/Account/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(data) {
    try {
      const response = await API.put("/Account/profile", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(data) {
    try {
      const response = await API.post("/Account/change-password", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }
  // Refresh token function (if needed in the future)
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await API.post("/Account/RefreshToken", {
        refreshToken
      });

      if (response.data.success) {
        this.storeAuthData(response.data.data);
        return response.data;
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw error;
    }
  }
}

export default new AuthService();

