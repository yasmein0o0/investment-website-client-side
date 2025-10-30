import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  requestPasswordChangeThunk,
  verifyPasswordOtpThunk,
  changePasswordThunk,
  clearPasswordState,
} from "../redux/passwordChange";
import "../style/forgotPassword.scss";

export const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const {
    requestLoading,
    requestError,
    requestSuccess,
    verifyLoading,
    verifyError,
    verifySuccess,
    changeLoading,
    changeError,
    changeSuccess,
    token,
    email: storedEmail,
  } = useSelector((state) => state.passwordChange);

  useEffect(() => {
    if (requestSuccess) {
      setStep(2);
      setErrors({});
    }
  }, [requestSuccess]);

  useEffect(() => {
    if (verifySuccess) {
      setStep(3);
      setErrors({});
    }
  }, [verifySuccess]);

  useEffect(() => {
    if (changeSuccess) {
      // Password changed successfully
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, [changeSuccess]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    setErrors({});
    dispatch(requestPasswordChangeThunk(email));
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrors({ otp: "Please enter all 6 digits" });
      return;
    }
    setErrors({});
    dispatch(verifyPasswordOtpThunk({ email: storedEmail, otp: otpString }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    setErrors({});
    dispatch(changePasswordThunk({ token, newPassword }));
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      dispatch(clearPasswordState());
    }
  };

  return (
    <div id="forgot-password-container">
      <div id="forgot-password-form">
        <h1>
          𝓑𝓲𝓼𝓬<span>𝓶</span>𝓪𝓻𝓴𝓮𝓽
        </h1>

        {step === 1 && (
          <>
            <h2>Reset Your Password</h2>
            <p className="instruction">
              Enter your email address and we'll send you a verification code to
              reset your password.
            </p>

            <form onSubmit={handleEmailSubmit}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={requestLoading}
                required
              />

              {requestError && <p className="error-message">{requestError}</p>}
              {errors.email && <p className="error-message">{errors.email}</p>}

              <button type="submit" disabled={requestLoading}>
                {requestLoading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Enter Verification Code</h2>
            <p className="instruction">
              We sent a 6-digit code to <strong>{storedEmail}</strong>
            </p>

            <form onSubmit={handleOtpSubmit}>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    disabled={verifyLoading}
                    className="otp-input"
                  />
                ))}
              </div>

              {verifyError && <p className="error-message">{verifyError}</p>}
              {errors.otp && <p className="error-message">{errors.otp}</p>}

              <button
                type="submit"
                disabled={verifyLoading || otp.join("").length !== 6}
              >
                {verifyLoading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <button onClick={handleBack} className="back-button">
              Back
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Create New Password</h2>
            <p className="instruction">Enter your new password below.</p>

            <form onSubmit={handlePasswordSubmit}>
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={changeLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={changeLoading}
                required
              />

              {changeError && <p className="error-message">{changeError}</p>}
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
              {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword}</p>
              )}

              {changeSuccess && (
                <p className="success-message">
                  Password changed successfully! Redirecting to login...
                </p>
              )}

              <button type="submit" disabled={changeLoading || changeSuccess}>
                {changeLoading ? "Changing..." : "Change Password"}
              </button>
            </form>

            <button onClick={handleBack} className="back-button">
              Back
            </button>
          </>
        )}

        <div className="auth-links">
          <button
            onClick={() => (window.location.href = "/login")}
            className="link-button"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
