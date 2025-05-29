'use client';
import Link from 'next/link';
import "../styles/navbar.css";
import { useAuth } from '../context/AuthContext';
import { SlArrowDown } from "react-icons/sl";
import { FaPhone, FaMapMarkerAlt, FaHospital, FaSignOutAlt } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";
import { useEffect, useState } from 'react';
import axiosPrivate from '../../../utils/axiosPrivate';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [role, setRole] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkRole();
    }
  }, [isAuthenticated]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkRole = async () => {
    try {
      const response = await axiosPrivate.get('/auth/check-role/');
      setRole(response.data.role);
    } catch (error) {
      console.error('Error checking role:', error);
      setRole(null);
    }
  };

  const getDashboardPath = () => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/pages/ADMIN/admindash';
      case 'doctor':
        return '/pages/doctor/dashboard';
      case 'receptionist':
        return '/pages/receptionist/dashboard';
      case 'pharmacist':
        return '/pages/pharmacist/dashboard';
      case 'lab_technician':
        return '/pages/labtechnician/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        rel="stylesheet" 
      />

      {/* Topbar Start */}
      <div className="headercolor container-fluid bg-light p-0 wow fadeIn" data-wow-delay="0.1s">
        <div className="row gx-0 d-none d-lg-flex">
          <div className="col-lg-7 px-5 text-start">
            <div className="h-100 d-inline-flex align-items-center py-3 me-4">
              <FaMapMarkerAlt className="text-primary me-2" />
              <small>Ascelpius Clinic, Techno Park Phase 1, Kazhakkoottam, Kerala, India</small>
            </div>
            <div className="h-100 d-inline-flex align-items-center py-3">
              <CiClock2 className="text-primary me-2" />
              <small>Mon - Fri : 09.00 AM - 09.00 PM</small>
            </div>
          </div>
          <div className="col-lg-5 px-5 text-end">
            <div className="h-100 d-inline-flex align-items-center py-3 me-4">
              <FaPhone className="text-primary me-2" />
              <small>+91 952 124 7533</small>
            </div>
          </div>
        </div>
      </div>
      {/* Topbar End */}

      {/* Navbar Start */}
      <nav className={`navbar navbar-expand-lg bg-white navbar-light sticky-top p-0 wow fadeIn ${isScrolled ? 'scrolled' : ''}`} data-wow-delay="0.1s">
        <Link href="/" className="navbar-brand d-flex align-items-center px-4 px-lg-5">
          <h1 className="m-0 text-primary">
            <FaHospital className="me-3" />
            Klinik
          </h1>
        </Link>
        
        <button 
          type="button" 
          className="navbar-toggler me-4" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto p-4 p-lg-0">
            <Link href="/" className="nav-item nav-link active">
              Home
            </Link>
            <Link href="/about" className="nav-item nav-link">
              About
            </Link>
            <Link href="/services" className="nav-item nav-link">
              Service
            </Link>
            <div className="nav-item dropdown">
              <a 
                href="#" 
                className="nav-link dropdown-toggle" 
                data-bs-toggle="dropdown"
                role="button"
                aria-expanded="false"
              >
                Pages <SlArrowDown className="ms-1" />
              </a>
              <div className="dropdown-menu rounded-0 rounded-bottom m-0">
                <Link href="/feature" className="dropdown-item">
                  Feature
                </Link>
                <Link href="/team" className="dropdown-item">
                  Our Doctor
                </Link>
                <Link href="/appointment" className="dropdown-item">
                  Appointment
                </Link>
                <Link href="/testimonial" className="dropdown-item">
                  Testimonial
                </Link>
                <Link href="/404" className="dropdown-item">
                  404 Page
                </Link>
              </div>
            </div>
            <Link href="/contact" className="nav-item nav-link">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <>
                <Link
                  href={getDashboardPath()}
                  className="btn btn-primary header-btn rounded-pill py-2 px-4 ms-3 d-none d-lg-block"
                >
                  Dashboard
                </Link>

                <button
                  onClick={logout}
                  className="btn logout-btn rounded-pill py-2 px-4 ms-2 d-none d-lg-block"
                  type="button"
                >
                  Log out <FaSignOutAlt className="ms-1" />
                </button>
              </>
            ) : (
              <Link
                href="/pages/login"
                className="btn btn-primary header-btn rounded-pill py-2 px-4 ms-3 d-none d-lg-block"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* Navbar End */}

      {/* Bootstrap JS */}
      <script 
        src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js"
      ></script>
    </div>
  );
};

export default Header;