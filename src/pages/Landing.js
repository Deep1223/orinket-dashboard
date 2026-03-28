import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import Config from '../config/config';
import IISMethods from '../utils/IISMethods';

const Landing = () => {
  const navigate = useNavigate();

  // Slider Logic
  const [activeSlide, setActiveSlide] = useState(0);
  const features = Config.landingFeatures;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % features.length);
    }, Config.sliderInterval);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleProceed = () => {
    // Direct to login without platform selection
    navigate('/login');
  };

  return (
    <div className="landing-container">
      {/* Left Side - Slider */}
      <div className="landing-left">
        <div className="slider-container">
          <div 
            className="slider-wrapper" 
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {features.map((feature, index) => (
              <div key={index} className="slide">
                <h2>{feature.title}</h2>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
          
          {/* Slider Dots */}
          <div className="slider-dots">
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

      {/* Right Side - Welcome */}
      <div className="landing-right">
        <div className="landing-right-content">
          <div className="welcome-section">
            <div className="welcome-header">
              <h1>Welcome to {Config.projectName}</h1>
              <p>Your comprehensive dashboard for management and analytics.</p>
            </div>
            
            <div className="welcome-back mb-0">
              <h3>Get Started</h3>
              <p>Click below to proceed to login.</p>
            </div>

            <button 
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" 
              onClick={handleProceed}
            >
              Proceed to Login <FaChevronRight size={14} />
            </button>
            
            <div className="landing-footer">
              <p>&copy; {new Date().getFullYear()} {Config.projectName}. {Config.copyrightText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
