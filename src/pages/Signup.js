import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock, FaChevronRight } from 'react-icons/fa';
import IISMethods from '../utils/IISMethods';
import Config from '../config/config';
import apiService from '../utils/apiService';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX = /^[+]?[\d\s()-]{10,}$/;

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Slider Logic
  const [activeSlide, setActiveSlide] = useState(0);
  const features = [
    { title: 'Join Our Community', desc: 'Create your account to start managing your analytics and team efficiently.' },
    { title: 'Advanced Analytics', desc: 'Gain deeper insights into your data with our powerful reporting tools.' },
    { title: 'Secure Workspace', desc: 'Your data is protected with industry-leading encryption and security.' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  const clearError = (field) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!firstName.trim()) next.firstName = 'First name is required';
    if (!lastName.trim()) next.lastName = 'Last name is required';
    if (!userEmail.trim()) next.userEmail = 'Email is required';
    else if (!EMAIL_REGEX.test(userEmail)) next.userEmail = 'Invalid email address';
    if (!phoneNumber.trim()) next.phoneNumber = 'Phone number is required';
    else if (!PHONE_REGEX.test(phoneNumber.replace(/\s/g, ''))) next.phoneNumber = 'Invalid phone number';
    if (!userPassword) next.userPassword = 'Password is required';
    else if (userPassword.length < 8) next.userPassword = 'Password must be at least 8 characters';
    if (!confirmPassword) next.confirmPassword = 'Confirm password is required';
    else if (userPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      const firstMsg =
        errs.firstName ||
        errs.lastName ||
        errs.userEmail ||
        errs.phoneNumber ||
        errs.userPassword ||
        errs.confirmPassword ||
        'Please fix the errors below.';
      IISMethods.errormsg(firstMsg, 1);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const combinedUsername = `${firstName.trim()} ${lastName.trim()}`;
      
      const res = await apiService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: combinedUsername,
        email: userEmail.trim(),
        phone: phoneNumber.trim(),
        password: userPassword,
      });

      if (!res.success) {
        IISMethods.errormsg(res.message || Config.signupFailederror, 1);
        return;
      }

      IISMethods.successmsg(Config.accountCreatedSuccess || 'Account created successfully', 2);
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      IISMethods.errormsg(Config.signupFailederror, 1);
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
          src="/stock-2.jpg"
          alt="Signup Background"
          className="landing-background-image"
        />
      </div>

      <div className="landing-right">
        <div className="landing-right-content">
          <div className="logo-container mb-10">
            <div className="logo-icon">{Config.projectName.charAt(0)}</div>
            <h2 className="logo-text">{Config.projectName}</h2>
          </div>

          <div className="welcome-back mb-0">
            <h3>{Config.signupTitle}</h3>
            <p>{Config.signupSubtitle}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-row-modern">
              <div className="form-group mb-0">
                <label>{Config.firstnamelabel}</label>
                <div className={`input-with-icon ${errors.firstName ? 'error' : ''}`}>
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    value={firstName}
                    autoComplete="off"
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearError('firstName');
                    }}
                    placeholder={Config.firstnamelabel}
                  />
                </div>
              </div>
              <div className="form-group mb-0">
                <label>{Config.lastnamelabel}</label>
                <div className={`input-with-icon ${errors.lastName ? 'error' : ''}`}>
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    value={lastName}
                    autoComplete="off"
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearError('lastName');
                    }}
                    placeholder={Config.lastnamelabel}
                  />
                </div>
              </div>
            </div>

            <div className="form-group mb-0">
              <label>{Config.emaillabel}</label>
              <div className={`input-with-icon ${errors.userEmail ? 'error' : ''}`}>
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  value={userEmail}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  onChange={(e) => {
                    setUserEmail(e.target.value);
                    clearError('userEmail');
                  }}
                  placeholder={Config.emaillabel}
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label>{Config.phonelabel}</label>
              <div className={`input-with-icon ${errors.phoneNumber ? 'error' : ''}`}>
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  value={phoneNumber}
                  autoComplete="off"
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    clearError('phoneNumber');
                  }}
                  placeholder={Config.phonelabel}
                />
              </div>
            </div>

            <div className="form-row-modern">
              <div className="form-group mb-0">
                <label>{Config.passwordlabel}</label>
                <div className={`input-with-icon ${errors.userPassword ? 'error' : ''}`}>
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userPassword}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    onChange={(e) => {
                      setUserPassword(e.target.value);
                      clearError('userPassword');
                    }}
                    placeholder={Config.passwordlabel}
                  />
                  <span className="eye-icon-modern" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              <div className="form-group mb-0">
                <label>{Config.confirmpasswordlabel}</label>
                <div className={`input-with-icon ${errors.confirmPassword ? 'error' : ''}`}>
                  <FaLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError('confirmPassword');
                    }}
                    placeholder={Config.confirmpasswordlabel}
                  />
                  <span className="eye-icon-modern" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="proceed-btn-modern">
              <span>{isSubmitting ? 'Creating account...' : Config.signupbtn}</span>
              <FaChevronRight className="btn-icon" />
            </button>

            <div className="signup-link-modern">
              <span>Already have an account?</span>
              <button type="button" onClick={() => navigate('/login')}>
                {Config.loginbtn}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
