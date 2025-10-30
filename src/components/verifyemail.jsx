import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmailThunk, resendOtpThunk } from "../redux/verifyemail";
import "../style/verifyemail.scss";
import { setData } from "../redux/signup";

export const VerifyEmail = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const location = useLocation();

  const { loading, error, resendLoading, resendError, resendSuccess } =
    useSelector((state) => state.verifyemail);

  const { data } = useSelector((state) => state.signup);
  console.log(data);

  useEffect(() => {
    // Get email from location state or signup data
    const userEmail = data?.email;
    console.log(userEmail);

    if (userEmail) {
      console.log(userEmail);
      setEmail(userEmail);
    } else {
      // Redirect to signup if no email found
      navigate("/signup");
    }
  }, [data]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const pasteArray = pasteData.split("");
      const newOtp = [...otp];
      pasteArray.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);

      // Focus the next empty input or last input
      const nextEmptyIndex = pasteArray.length < 6 ? pasteArray.length : 5;
      inputRefs.current[nextEmptyIndex].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      return;
    }

    dispatch(verifyEmailThunk({ email, otp: otpString }));
  };

  const handleResendOtp = () => {
    dispatch(resendOtpThunk(email));
  };

  // Redirect on successful verification
  useEffect(() => {
    const pendingVerification = JSON.parse(
      localStorage.getItem("pendingVerification") || "{}"
    );
    if (pendingVerification.verified) {
      navigate("/home");
      localStorage.removeItem("pendingVerification");
    }
  }, [navigate]);

  if (data?.email)
    return (
      <div id="verify-email-container">
        <div id="verify-email">
          <form method="post" id="verify-email-form" onSubmit={handleSubmit}>
            <h1>
              𝓑𝓲𝓼𝓬<span>𝓶</span>𝓪𝓻𝓴𝓮𝓽
            </h1>
            <h2>Verify Your Email</h2>
            <p className="instruction">
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </p>

            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading}
                  className="otp-input"
                />
              ))}
            </div>

            {error && <p className="error-message">{error}</p>}
            {resendError && <p className="error-message">{resendError}</p>}
            {resendSuccess && (
              <p className="success-message">New OTP sent successfully!</p>
            )}

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="resend-button"
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                dispatch(setData(null));
                navigate("/signup");
              }}
              className="back-button"
            >
              Back to Sign Up
            </button>
          </form>
        </div>
      </div>
    );
};
