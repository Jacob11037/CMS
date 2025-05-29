'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import './styles/Home.css'

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselItems = [
    { img: '/img/carousel-1.jpg', title: 'Cardiology', subtitle: 'Expert Heart Care' },
    { img: '/img/carousel-2.jpg', title: 'Neurology', subtitle: 'Advanced Brain Treatment' },
    { img: '/img/carousel-3.jpg', title: 'Pulmonary', subtitle: 'Respiratory Excellence' }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <>
      <Head>
        <title>MedCare - Modern Healthcare Solutions</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="modern-homepage">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-overlay"></div>
            <div className="floating-elements">
              <div className="floating-circle circle-1"></div>
              <div className="floating-circle circle-2"></div>
              <div className="floating-circle circle-3"></div>
            </div>
          </div>
          
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-text">
                <div className="hero-badge">
                  <i className="fas fa-heart-pulse"></i>
                  <span>Healthcare Excellence</span>
                </div>
                <h1 className="hero-title">
                  Good Health Is The
                  <span className="gradient-text"> Root Of All Happiness</span>
                </h1>
                <p className="hero-description">
                  Experience world-class healthcare with our team of expert doctors, 
                  cutting-edge technology, and compassionate care that puts you first.
                </p>
                
                <div className="hero-stats">
                  <div className="stat-item">
                    <div className="stat-number">123</div>
                    <div className="stat-label">Expert Doctors</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">1,234</div>
                    <div className="stat-label">Medical Staff</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">12,345</div>
                    <div className="stat-label">Total Patients</div>
                  </div>
                </div>

                <div className="hero-actions">
                  <button className="btn-primary" onClick={handleGetStarted}>
                    <span>Get Started</span>
                    <i className="fas fa-arrow-right"></i>
                  </button>
                  <button className="btn-secondary">
                    <i className="fas fa-play"></i>
                    <span>Watch Demo</span>
                  </button>
                </div>
              </div>

              <div className="hero-carousel">
                <div className="carousel-container">
                  {carouselItems.map((item, index) => (
                    <div 
                      key={index}
                      className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                    >
                      <div className="carousel-image">
                        <img src={item.img} alt={item.title} />
                        <div className="carousel-overlay">
                          <h3>{item.title}</h3>
                          <p>{item.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="carousel-indicators">
                  {carouselItems.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-images">
                <div className="image-stack">
                  <img src="/img/about-1.jpg" alt="About Us" className="main-image" />
                  <img src="/img/about-2.jpg" alt="About Us" className="overlay-image" />
                </div>
              </div>
              
              <div className="about-text">
                <div className="section-badge">About Us</div>
                <h2 className="section-title">
                  Why You Should Trust Us? 
                  <span className="gradient-text">Get to Know About Us!</span>
                </h2>
                
                <p className="about-description">
                  We combine cutting-edge medical technology with compassionate care to deliver 
                  exceptional healthcare services. Our commitment to excellence drives everything we do.
                </p>
                
                <div className="about-features">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <span>Quality Health Care</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <span>Only Qualified Doctors</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <span>Medical Research Professionals</span>
                  </div>
                </div>

                <button className="btn-primary">
                  <span>Learn More</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section">
          <div className="container">
            <div className="section-header">
              <div className="section-badge">Services</div>
              <h2 className="section-title">
                Health Care <span className="gradient-text">Solutions</span>
              </h2>
              <p className="section-description">
                Comprehensive medical services designed to meet all your healthcare needs 
                with the highest standards of care and professionalism.
              </p>
            </div>

            <div className="services-grid">
              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-heartbeat"></i>
                </div>
                <h3 className="service-title">Cardiology</h3>
                <p className="service-description">
                  Advanced cardiac care with state-of-the-art diagnostic and treatment options 
                  for all heart-related conditions.
                </p>
                <button className="service-link">
                  <span>Learn More</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>

              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-x-ray"></i>
                </div>
                <h3 className="service-title">Pulmonary</h3>
                <p className="service-description">
                  Comprehensive respiratory care including diagnosis, treatment, and management 
                  of lung and breathing disorders.
                </p>
                <button className="service-link">
                  <span>Learn More</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>

              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-brain"></i>
                </div>
                <h3 className="service-title">Neurology</h3>
                <p className="service-description">
                  Expert neurological care for brain, spine, and nervous system conditions 
                  with cutting-edge treatment methods.
                </p>
                <button className="service-link">
                  <span>Learn More</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <div className="features-content">
              <div className="features-text">
                <div className="section-badge light">Features</div>
                <h2 className="section-title light">
                  Why <span className="gradient-text-light">Choose Us</span>
                </h2>
                <p className="section-description light">
                  We pride ourselves on delivering exceptional healthcare services 
                  with a patient-centered approach and cutting-edge medical technology.
                </p>

                <div className="features-grid">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-user-md"></i>
                    </div>
                    <div className="feature-content">
                      <h4>Experienced Doctors</h4>
                      <p>Board-certified specialists</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <div className="feature-content">
                      <h4>Quality Services</h4>
                      <p>Excellence in every treatment</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-comment-medical"></i>
                    </div>
                    <div className="feature-content">
                      <h4>Positive Consultation</h4>
                      <p>Compassionate patient care</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-headset"></i>
                    </div>
                    <div className="feature-content">
                      <h4>24/7 Support</h4>
                      <p>Always here when you need us</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="features-image">
                <div className="image-container">
                  <img src="/img/feature.jpg" alt="Healthcare Features" />
                  <div className="image-overlay"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>


    </>
  );
}