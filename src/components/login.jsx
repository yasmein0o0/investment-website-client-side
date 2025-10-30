import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginThunk } from "../redux/login";
import { googleAuthThunk } from "../redux/googleAuth";
import { loginFormValidation } from "../utils/loginValidation";
import { useGoogleAuth } from "../utils/googleAuth";
import "../style/login.scss";

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { data, loading, error } = useSelector((state) => state.login);
  const {
    data: googleData,
    loading: googleLoading,
    error: googleError,
  } = useSelector((state) => state.googleAuth);
  console.log(error);

  useEffect(() => {
    if (data || googleData) navigate("/home");
    if (error) setErrors({ server: error });
    if (googleError) setErrors({ server: googleError });
  }, [data, googleData, navigate, error, googleError]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = loginFormValidation(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    dispatch(loginThunk(form));
  };

  // Google OAuth handler
  // Google OAuth handler
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      console.log("Google token response:", tokenResponse);

      // Get user info from Google
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error(`Google API error: ${userInfoResponse.status}`);
      }

      const userInfo = await userInfoResponse.json();
      console.log("Google user info:", userInfo);

      // Send to backend
      dispatch(
        googleAuthThunk({
          accessToken: tokenResponse.access_token,
          email: userInfo.email,
          name: userInfo.name,
          googleId: userInfo.sub,
        })
      );
    } catch (error) {
      console.error("Error getting Google user info:", error);
      setErrors({
        server: `Failed to get user information from Google: ${error.message}`,
      });
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google OAuth error:", error);
    setErrors({ server: "Google authentication failed. Please try again." });
  };

  const googleLogin = useGoogleAuth(handleGoogleSuccess, handleGoogleError);

  return (
    <div id="login-container">
      <div id="login-form">
        <h1>
          𝓑𝓲𝓼𝓬<span>𝓶</span>𝓪𝓻𝓴𝓮𝓽
        </h1>
        <h3>log in</h3>
        <form method="post" onSubmit={handleSubmit}>
          <label htmlFor="email">
            {(errors.email && errors.email) || "enter your email"}
          </label>
          <input
            type="email"
            name="email"
            id="email-input"
            placeholder="email"
            required
            onChange={handleChange}
            value={form.email}
            disabled={loading || googleLoading}
          />

          <label htmlFor="password">
            {(errors.password && errors.password) || "enter strong password"}
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password-input"
              placeholder="password"
              required
              onChange={handleChange}
              value={form.password}
              disabled={loading || googleLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={loading || googleLoading}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
                </svg>
              )}
            </button>
          </div>
          <div
            onClick={() => navigate("/forgot-password")}
            className="link-button forgot-btn"
          >
            Forgot password?
          </div>
          <button type="submit" disabled={loading || googleLoading}>
            {loading ? "log in..." : "log in"}
          </button>
          <p id="error-msg">{errors.server ? errors.server : ""}</p>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div id="sign-up-social-networks">
          <button
            id="sign-up-with-google"
            onClick={googleLogin}
            disabled={loading || googleLoading}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24px"
              height="24px"
            >
              <path
                fill="#fbc02d"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#e53935"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4caf50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1565c0"
                d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            <span id="text">
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </span>
          </button>
        </div>

        <div className="auth-links">
          <button onClick={() => navigate("/signup")} className="link-button">
            Don't have account? <span>Sign up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
