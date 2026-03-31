import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaArrowLeft, FaEnvelope, FaLock, FaChevronRight } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import IISMethods from '../utils/IISMethods';
import Config from '../config/config';
// localStorage imports removed - using backend only
import useAuth from '../hooks/useAuth';
import apiService from '../utils/apiService';
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Login States
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // 2FA States
  const [show2FA, setShow2FA] = useState(false);
  const [is2FASetup, setIs2FASetup] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [tempUserId, setTempUserId] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slider Logic
  const [activeSlide, setActiveSlide] = useState(0);
  const features = Config.loginFeatures;


  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % features.length);
    }, Config.sliderInterval);
    return () => clearInterval(interval);
  }, [features.length]);

  // Resend OTP Timer Logic
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleGoogleLogin = async (credentialResponse) => {
    setIsSubmitting(true);
    try {
      const result = await apiService.googleLogin(credentialResponse.credential);

      if (!result.success) {
        IISMethods.errormsg(result.message || Config.googleLoginFailed, 1);
        return;
      }

      const user = result.user || {};
      const token = result.token || result.accessToken;

      login({
        user: {
          ...user,
          email: user.email,
          id: user.id || user._id,
          roleId: user.roleId || user.roleid,
          role: user.role,
        },
        token,
        rememberMe: true,
      });
    } catch (error) {
      console.error('Google login error:', error);
      IISMethods.errormsg(Config.googleLoginFailed, 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!userEmail.trim()) {
      next.userEmail = `${Config.emaillabel} ${Config.requirederror}`;
    } else if (!EMAIL_REGEX.test(userEmail)) {
      next.userEmail = Config.invalidEmailerror;
    } else if (!userPassword) {
      next.userPassword = `${Config.passwordlabel} ${Config.requirederror}`;
    } else if (userPassword.length < 8) {
      next.userPassword = 'Password must be at least 8 characters';
    }
    setErrors(next);
    return next;
  };

  const validateForgot = () => {
    const next = {};
    if (!forgotEmail.trim()) {
      next.forgotEmail = `${Config.emaillabel} ${Config.requirederror}`;
    } else if (!EMAIL_REGEX.test(forgotEmail)) {
      next.forgotEmail = Config.invalidEmailerror;
    } else if (otpSent) {
      if (!otp) {
        next.otp = `OTP ${Config.requirederror}`;
      } else if (otp.length < 6) {
        next.otp = 'OTP must be 6 characters';
      } else if (!newPassword) {
        next.newPassword = `New ${Config.passwordlabel} ${Config.requirederror}`;
      } else if (newPassword.length < 8) {
        next.newPassword = 'Password must be at least 8 characters';
      } else if (!confirmPassword) {
        next.confirmPassword = `Confirm ${Config.passwordlabel} ${Config.requirederror}`;
      } else if (newPassword !== confirmPassword) {
        next.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(next);
    return next;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // localStorage mode removed - always use API
      const result = await apiService.login({
        email: userEmail.trim(),
        password: userPassword,
      });

      if (!result.success) {
        IISMethods.errormsg(result.message || Config.invalidCredentialserror, 1);
        return;
      }

      // Handle 2FA Setup Required
      if (result.twoFactorSetupRequired) {
        setTempUserId(result.userId);
        setIs2FASetup(true);
        setShow2FA(true);
        
        // Get QR code for setup
        const setupResult = await apiService.setup2FA(result.userId);
        if (setupResult.success) {
          setQrCode(setupResult.data);
        } else {
          IISMethods.errormsg(setupResult.message || 'Failed to setup 2FA', 1);
          return;
        }
        return;
      }

      // Handle 2FA Token Required
      if (result.twoFactorRequired) {
        setTempUserId(result.userId);
        setIs2FASetup(false);
        setShow2FA(true);
        return;
      }

      const user = result.user || {};
      
      login({
        user: {
          ...user,
          email: user.email || userEmail,
          id: user.id || user._id,
          roleId: user.roleId || user.roleid,
          role: user.role,
        },
        rememberMe,
      });

    } catch (error) {
      console.error('Login error:', error);
      IISMethods.errormsg(Config.loginFailederror, 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsSubmitting(true);
    try {
      const result = await apiService.forgotPassword(forgotEmail.trim());
      if (result.success) {
        setResendTimer(Config.otpResendTimer);
        IISMethods.successmsg(result.message || Config.otpResentSuccess, 2);
      } else {
        IISMethods.errormsg(result.message || Config.otpResendFailed, 1);
      }
    } catch (error) {
      IISMethods.errormsg(Config.otpResendFailed, 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForgot();
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      // localStorage mode removed - always use API
      if (!otpSent) {
        const result = await apiService.forgotPassword(forgotEmail.trim());
        if (result.success) {
          setOtpSent(true);
          setResendTimer(Config.otpResendTimer);
          IISMethods.successmsg(result.message || Config.otpSentSuccess, 2);
        } else {
          IISMethods.errormsg(result.message || Config.otpSendFailed, 1);
        }
      } else {
        const result = await apiService.resetPassword({
          email: forgotEmail.trim(),
          otp,
          newPassword
        });
        if (result.success) {
          IISMethods.successmsg(result.message || Config.passwordResetSuccess, 2);
          setShowForgotPassword(false);
          setOtpSent(false);
          setForgotEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          IISMethods.errormsg(result.message || Config.passwordResetFailederror, 1);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      IISMethods.errormsg(error.message || Config.unknownerror, 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      IISMethods.errormsg(errs.userEmail || errs.userPassword || Config.fillallrequiredfild, 1);
      return;
    }
    onSubmit(e);
  };

  const handleNewQRScan = async () => {
    setIsSubmitting(true);
    try {
      // Generate new QR code
      const result = await apiService.setup2FA(tempUserId);
      if (result.success) {
        setQrCode(result.data);
        setTwoFactorToken(''); // Clear previous token
        setIs2FASetup(true); // Switch to setup mode
        IISMethods.successmsg('New QR code generated successfully', 2);
      } else {
        IISMethods.errormsg(result.message || 'Failed to generate new QR code', 1);
      }
    } catch (error) {
      console.error('New QR Scan Error:', error);
      IISMethods.errormsg('Failed to generate new QR code', 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorToken || twoFactorToken.length !== 6) {
      IISMethods.errormsg('Please enter a valid 6-digit code', 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiService.verify2FA({
        userId: tempUserId,
        token: twoFactorToken
      });

      if (result.success) {
        const user = result.user || {};

        login({
          user: {
            ...user,
            email: user.email || userEmail,
            id: user.id || user._id,
            roleId: user.roleId || user.roleid,
            role: user.role,
          },
          rememberMe,
        });
      } else {
        IISMethods.errormsg(result.message || 'Invalid 2FA code', 1);
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      IISMethods.errormsg('Failed to verify 2FA code', 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-left">
        <div className="landing-overlay"></div>
        <div className="landing-left-content">
          <h1>{features[activeSlide].title}</h1>
          <p>{features[activeSlide].desc}</p>
          <div className="feature-dots">
            {features.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(index)}
                style={{ cursor: 'pointer' }}
              ></span>
            ))}
          </div>
        </div>
        <img
          src={Config.defaultBannerImage}
          alt="Login Background"
          className="landing-background-image"
        />
      </div>

      <div className="landing-right">
        <div className="landing-right-content">
          {show2FA ? (
            // 2FA Verification / Setup Form
            <>
              <div className="logo-container mb-10">
                <div className="logo-icon">{Config.projectName.charAt(0)}</div>
                <h2 className="logo-text">{Config.projectName}</h2>
              </div>

              <div className="welcome-back mb-0">
                <button 
                  type="button" 
                  className="back-button-modern" 
                  onClick={() => {
                    setShow2FA(false);
                    setTwoFactorToken('');
                  }}
                >
                  <FaArrowLeft /> Back to login
                </button>
                <h3>{is2FASetup ? 'Setup 2FA' : 'Two-Factor Authentication'}</h3>
                <p>
                  {is2FASetup 
                    ? 'Scan this QR code with Google Authenticator and enter the code below.' 
                    : 'Enter the 6-digit code from your authenticator app.'}
                </p>
              </div>

              {is2FASetup && qrCode && (
                <div style={{ textAlign: 'center', margin: '20px 0', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <img src={qrCode} alt="2FA QR Code" style={{ width: '180px', height: '180px' }} />
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                    Scan this QR code to get your verification codes
                  </div>
                </div>
              )}

              <form className="login-form" onSubmit={handle2FASubmit}>
                <div className="form-group mb-0">
                  <label>Verification Code</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input
                      type="text"
                      value={twoFactorToken}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 6) setTwoFactorToken(val);
                      }}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      style={{ letterSpacing: twoFactorToken ? '8px' : 'normal', textAlign: twoFactorToken ? 'center' : 'left', fontSize: twoFactorToken ? '24px' : 'inherit', fontWeight: 'bold' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting || twoFactorToken.length !== 6} className="proceed-btn-modern">
                  <span>{isSubmitting ? 'Verifying...' : 'Verify & Login'}</span>
                  <FaChevronRight className="btn-icon" />
                </button>

                {!is2FASetup && (
                  <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <button 
                      type="button" 
                      onClick={handleNewQRScan}
                      disabled={isSubmitting}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#2563eb', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        textDecoration: 'underline'
                      }}
                    >
                      {isSubmitting ? 'Generating...' : 'Generate New QR Code'}
                    </button>
                  </div>
                )}
              </form>
            </>
          ) : showForgotPassword ? (
            // Forgot Password Form
            <>
              <div className="logo-container mb-10">
            <div className="logo-icon">{Config.projectName.charAt(0)}</div>
            <h2 className="logo-text">{Config.projectName}</h2>
          </div>

              <div className="welcome-back mb-0">
                <button 
                  type="button" 
                  className="back-button-modern" 
                  onClick={() => {
                    setShowForgotPassword(false);
                    setOtpSent(false);
                    setErrors({});
                  }}
                >
                  <FaArrowLeft /> Back to login
                </button>
                <h3>{Config.forgotPasswordTitle}</h3>
                <p>{otpSent ? Config.otpSentSubtitle : Config.forgotPasswordSubtitle}</p>
              </div>

              <form className="login-form" onSubmit={handleForgotSubmit}>
                <div className="form-group mb-0">
                  <label>{Config.emaillabel}</label>
                  <div className={`input-with-icon ${errors.forgotEmail ? 'error' : ''}`}>
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (errors.forgotEmail) setErrors((prev) => ({ ...prev, forgotEmail: undefined }));
                      }}
                      disabled={otpSent}
                      placeholder={Config.emaillabel}
                    />
                  </div>
                </div>

                {otpSent && (
                  <>
                    <div className="form-group mb-0">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Verification OTP</label>
                        <div className="resend-timer-modern">
                          {resendTimer > 0 ? (
                            <span style={{ fontSize: '11px', color: '#666' }}>Resend in <strong>{resendTimer}s</strong></span>
                          ) : (
                            <button 
                              type="button" 
                              onClick={handleResendOTP} 
                              disabled={isSubmitting}
                              className="resend-btn-modern"
                              style={{ fontSize: '11px', padding: '0', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </div>
                      <div className={`input-with-icon ${errors.otp ? 'error' : ''}`}>
                        <FaLock className="input-icon" />
                        <input
                          type="text"
                          value={otp}
                          autoComplete="one-time-code"
                          inputMode="numeric"
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            if (value.length <= 6) {
                              setOtp(value);
                              if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                            }
                          }}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <div className="form-group mb-0">
                      <label>New Password</label>
                      <div className={`input-with-icon ${errors.newPassword ? 'error' : ''}`}>
                        <FaLock className="input-icon" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          autoComplete="off"
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                          }}
                          placeholder="Enter new password"
                        />
                        <span
                          className="eye-icon-modern"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>

                    <div className="form-group mb-0">
                      <label>Confirm Password</label>
                      <div className={`input-with-icon ${errors.confirmPassword ? 'error' : ''}`}>
                        <FaLock className="input-icon" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          autoComplete="off"
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                          }}
                          placeholder="Confirm your password"
                        />
                        <span
                          className="eye-icon-modern"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={isSubmitting} className="proceed-btn-modern">
                  <span>{isSubmitting ? (otpSent ? 'Resetting...' : 'Sending...') : (otpSent ? Config.resetpasswordbtn : 'Send OTP')}</span>
                  <FaChevronRight className="btn-icon" />
                </button>
              </form>
            </>
          ) : (
            // Login Form
            <>
              <div className="logo-container mb-10">
                <div className="logo-icon">{Config.projectName.charAt(0)}</div>
                <h2 className="logo-text">{Config.projectName}</h2>
              </div>

              <div className="welcome-back mb-0">
                <h3>{Config.loginTitle}</h3>
                <p>{Config.loginSubtitle}</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group mb-0">
                  <label>{Config.emaillabel}</label>
                  <div className={`input-with-icon ${errors.userEmail ? 'error' : ''}`}>
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                        if (errors.userEmail) setErrors((prev) => ({ ...prev, userEmail: undefined }));
                      }}
                      placeholder={Config.emaillabel}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label>{Config.passwordlabel}</label>
                  <div className={`input-with-icon ${errors.userPassword ? 'error' : ''}`}>
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => {
                        setUserPassword(e.target.value);
                        if (errors.userPassword) setErrors((prev) => ({ ...prev, userPassword: undefined }));
                      }}
                      placeholder={Config.passwordlabel}
                      autoComplete="off"
                    />
                    <span
                      className="eye-icon-modern"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                <div className="form-options-modern">
                  <label className="remember-me-modern">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    className="forgot-password-modern" 
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotEmail(userEmail);
                      setErrors({});
                    }}
                  >
                    {Config.forgotpasswordbtn}?
                  </button>
                </div>

                <button type="submit" disabled={isSubmitting} className="proceed-btn-modern">
                  <span>{isSubmitting ? 'Signing in...' : Config.loginbtn}</span>
                  <FaChevronRight className="btn-icon" />
                </button>

                <div className="divider-modern"><span>OR</span></div>

                <div className="google-login-wrapper-modern">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => IISMethods.errormsg('Google Login Failed', 1)}
                    theme="outline"
                    size="large"
                    width="100%"
                  />
                </div>

                <div className="signup-link-modern">
                  <span>Don't have an account?</span>
                  <button type="button" onClick={() => navigate('/signup')}>{Config.signupbtn}</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
