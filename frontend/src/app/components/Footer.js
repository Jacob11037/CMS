'use client'
import { useState, useEffect } from 'react';
import "../styles/footer.css";
import { 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaTwitter, 
  FaFacebookF, 
  FaYoutube, 
  FaLinkedinIn,
  FaArrowUp 
} from 'react-icons/fa';

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle newsletter signup
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Add your newsletter signup logic here
      console.log('Newsletter signup:', email);
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="footer-container">
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        rel="stylesheet" 
      />

      <div className="container-fluid bg-dark text-light footer wow fadeIn" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="row g-5">
            {/* Address Section */}
            <div className="col-lg-3 col-md-6">
              <h5 className="text-white mb-4">Address</h5>
              <p className="mb-2">
                <FaMapMarkerAlt className="me-3" />
                Ascelpius Clinic, Techno Park Phase 1, Kazhakkoottam, Kerala, India
              </p>
              <p className="mb-2">
                <FaPhoneAlt className="me-3" />
                +91 952 124 7533
              </p>
              <p className="mb-2">
                <FaEnvelope className="me-3" />
                info@klinik.com
              </p>
              <div className="d-flex pt-2">
                <a 
                  className="btn btn-outline-light btn-social rounded-circle" 
                  href="#"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
                <a 
                  className="btn btn-outline-light btn-social rounded-circle" 
                  href="#"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
                <a 
                  className="btn btn-outline-light btn-social rounded-circle" 
                  href="#"
                  aria-label="YouTube"
                >
                  <FaYoutube />
                </a>
                <a 
                  className="btn btn-outline-light btn-social rounded-circle" 
                  href="#"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
              </div>
            </div>

            {/* Services Section */}
            <div className="col-lg-3 col-md-6">
              <h5 className="text-white mb-4">Services</h5>
              <a className="btn btn-link" href="/services/cardiology">
                Cardiology
              </a>
              <a className="btn btn-link" href="/services/pulmonary">
                Pulmonary
              </a>
              <a className="btn btn-link" href="/services/neurology">
                Neurology
              </a>
              <a className="btn btn-link" href="/services/orthopedics">
                Orthopedics
              </a>
              <a className="btn btn-link" href="/services/laboratory">
                Laboratory
              </a>
            </div>

            {/* Quick Links Section */}
            <div className="col-lg-3 col-md-6">
              <h5 className="text-white mb-4">Quick Links</h5>
              <a className="btn btn-link" href="/about">
                About Us
              </a>
              <a className="btn btn-link" href="/contact">
                Contact Us
              </a>
              <a className="btn btn-link" href="/services">
                Our Services
              </a>
              <a className="btn btn-link" href="/terms">
                Terms & Condition
              </a>
              <a className="btn btn-link" href="/support">
                Support
              </a>
            </div>

            {/* Newsletter Section */}
            <div className="col-lg-3 col-md-6">
              <h5 className="text-white mb-4">Newsletter</h5>
              <p>Stay updated with our latest health tips and medical insights.</p>
              <form onSubmit={handleNewsletterSubmit}>
                <div className="position-relative mx-auto" style={{maxWidth: '400px'}}>
                  <input 
                    className="form-control border-0 w-100 py-3 ps-4 pe-5" 
                    type="email" 
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
                  >
                    SignUp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="container">
          <div className="copyright">
            <div className="row">
              <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                <div className="border-top border-secondary pt-3">
                  <p className="mb-0">
                    &copy; 2024 Klinik. All Rights Reserved. 
                    <span className="text-primary"> Designed with ❤️</span>
                  </p>
                </div>
              </div>
              <div className="col-md-6 text-center text-md-end">
                <div className="border-top border-secondary pt-3">
                  <p className="mb-0">
                    <a href="/privacy" className="text-light me-3">Privacy Policy</a>
                    <a href="/terms" className="text-light">Terms of Service</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        className={`btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top ${showBackToTop ? 'show' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <FaArrowUp />
      </button>
    </footer>
  );
};

export default Footer;