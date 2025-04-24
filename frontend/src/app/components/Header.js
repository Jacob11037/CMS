'use client';
import Link from 'next/link';
import "../styles/navbar.css";
import { useAuth } from '../context/AuthContext';
import { SlArrowDown } from "react-icons/sl";
import { FaPhone } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";

const Header = () => {
  return (
    <div>
      {/* <!-- Topbar Start --> */}
      <div className="headercolor container-fluid bg-light p-0 wow fadeIn" data-wow-delay="0.1s">
        <div className="row gx-0 d-none d-lg-flex">
          <div className="col-lg-7 px-5 text-start">
            <div className="h-100 d-inline-flex align-items-center py-3 me-4">
              <small className="fa fa-map-marker-alt text-primary me-2"></small>
              <small>Ascelpius Clinic, Techno Park Phase 1, Kazhakkoottam, Kerala, India</small>
            </div>
            <div className="h-100 d-inline-flex align-items-center py-3">
              <small className="far fa-clock text-primary me-2"></small>
              <small><CiClock2 /> Mon - Fri : 09.00 AM - 09.00 PM</small>
            </div>
          </div>
          <div className="col-lg-5 px-5 text-end">
            <div className="h-100 d-inline-flex align-items-center py-3 me-4">
              <small className="fa fa-phone-alt text-primary me-2"></small>
              <small><FaPhone /> +91 952 124 7533</small>
            </div>
            
          </div>
        </div>
      </div>
      {/* <!-- Topbar End --> */}

      {/* <!-- Navbar Start --> */}
      <nav className="navbar navbar-expand-lg bg-white navbar-light sticky-top p-0 wow fadeIn" data-wow-delay="0.1s">
        <a href="index.html" className="navbar-brand d-flex align-items-center px-4 px-lg-5">
          <h1 className="m-0 text-primary"><i className="far fa-hospital me-3"></i>Klinik</h1>
        </a>
        <button type="button" className="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto p-4 p-lg-0">
            <a href="index.html" className="nav-item nav-link active">Home</a>
            <a href="about.html" className="nav-item nav-link">About</a>
            <a href="service.html" className="nav-item nav-link">Service</a>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link " data-bs-toggle="dropdown">Pages <SlArrowDown /></a>
              <div className="dropdown-menu rounded-0 rounded-bottom m-0">
                <a href="feature.html" className="dropdown-item">Feature</a>
                <a href="team.html" className="dropdown-item">Our Doctor</a>
                <a href="appointment.html" className="dropdown-item">Appointment</a>
                <a href="testimonial.html" className="dropdown-item">Testimonial</a>
                <a href="404.html" className="dropdown-item">404 Page</a>
              </div>
            </div>
            <a href="contact.html" className="nav-item nav-link">Contact</a>
          </div>

          <LogoutButtonWrapper />
        </div>
      </nav>
      {/* <!-- Navbar End --> */}
    </div>
  );
};

const LogoutButtonWrapper = () => {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={logout}
      className="btn btn-primary logout-btn rounded-pill py-3 px-4 ms-3 shadow d-none d-lg-block animate__animated animate__fadeIn"
    >
      Log out <i className="fa fa-sign-out-alt ms-2"></i>
    </button>
  );
};


export default Header;
