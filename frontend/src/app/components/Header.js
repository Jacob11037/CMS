'use client';
import Link from 'next/link';
import "../styles/navbar.css";
import { useAuth } from '../context/AuthContext';
import { SlArrowDown } from "react-icons/sl";
import { FaPhone } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";
import { useEffect, useState } from 'react';
import axiosPrivate from '../../../utils/axiosPrivate';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [role, setRole] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      checkRole();    }
  }, [isAuthenticated]);

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
      {/* Topbar Start */}
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
      {/* Topbar End */}

      {/* Navbar Start */}
      <nav className="navbar navbar-expand-lg bg-white navbar-light sticky-top p-0 wow fadeIn" data-wow-delay="0.1s">
        <Link href="/" className="navbar-brand d-flex align-items-center px-4 px-lg-5">
          <h1 className="m-0 text-primary"><i className="far fa-hospital me-3"></i>Klinik</h1>
        </Link>
        <button type="button" className="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto p-4 p-lg-0">
            <Link href="/" className="nav-item nav-link active">Home</Link>
            <Link href="/about" className="nav-item nav-link">About</Link>
            <Link href="/services" className="nav-item nav-link">Service</Link>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link" data-bs-toggle="dropdown">Pages <SlArrowDown /></a>
              <div className="dropdown-menu rounded-0 rounded-bottom m-0">
                <Link href="/feature" className="dropdown-item">Feature</Link>
                <Link href="/team" className="dropdown-item">Our Doctor</Link>
                <Link href="/appointment" className="dropdown-item">Appointment</Link>
                <Link href="/testimonial" className="dropdown-item">Testimonial</Link>
                <Link href="/404" className="dropdown-item">404 Page</Link>
              </div>
            </div>
            <Link href="/contact" className="nav-item nav-link">Contact</Link>
          </div>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <>
              <Link
  href={getDashboardPath()}
  className="btn btn-primary header-btn rounded-pill py-2 px-4 ms-3 shadow d-none d-lg-block animate__animated animate__fadeIn"
>
  Dashboard
</Link>


              <button
                onClick={logout}
                className="btn btn-primary logout-btn rounded-pill py-2 px-4 ms-2 shadow d-none d-lg-block animate__animated animate__fadeIn"
              >
                Log out <i className="fa fa-sign-out-alt ms-2"></i>
              </button>
            </>
          ) : (
            <Link
            href="/pages/login"
            className="btn btn-primary header-btn rounded-pill py-2 px-4 ms-3 shadow d-none d-lg-block animate__animated animate__fadeIn"
          >
            Login
          </Link>

          )}
        </div>
      </nav>
      {/* Navbar End */}
    </div>
  );
};

export default Header;
