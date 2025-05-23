'use client';
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import styles from './styles/Home.module.css';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();



  return (
    <div className={styles.container}>
      <Head>
        <title>Medical Homepage</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </Head>

      {/* Header Start */}
      <div className="container-fluid header bg-primary p-0 mb-5">
        <div className="row g-0 align-items-center flex-column-reverse flex-lg-row">
          <div className="col-lg-6 p-5 wow fadeIn" data-wow-delay="0.1s">
            <h1 className="display-4 text-white mb-5">Good Health Is The Root Of All Happiness</h1>
            <div className="row g-4">
              <div className="col-sm-4">
                <div className="border-start border-light ps-4">
                  <h2 className="text-white mb-1">123</h2>
                  <p className="text-light mb-0">Expert Doctors</p>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="border-start border-light ps-4">
                  <h2 className="text-white mb-1">1234</h2>
                  <p className="text-light mb-0">Medical Staff</p>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="border-start border-light ps-4">
                  <h2 className="text-white mb-1">12345</h2>
                  <p className="text-light mb-0">Total Patients</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
            <div className="owl-carousel header-carousel">
              <div className="owl-carousel-item position-relative">
                <img className="img-fluid" src="/img/carousel-1.jpg" alt="Cardiology" />
                <div className="owl-carousel-text">
                  <h1 className="display-1 text-white mb-0">Cardiology</h1>
                </div>
              </div>
              <div className="owl-carousel-item position-relative">
                <img className="img-fluid" src="/img/carousel-2.jpg" alt="Neurology" />
                <div className="owl-carousel-text">
                  <h1 className="display-1 text-white mb-0">Neurology</h1>
                </div>
              </div>
              <div className="owl-carousel-item position-relative">
                <img className="img-fluid" src="/img/carousel-3.jpg" alt="Pulmonary" />
                <div className="owl-carousel-text">
                  <h1 className="display-1 text-white mb-0">Pulmonary</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Header End */}

      {/* About Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <div className="d-flex flex-column">
                <img className="img-fluid rounded w-75 align-self-end" src="/img/about-1.jpg" alt="About Us" />
                <img className="img-fluid rounded w-50 bg-white pt-3 pe-3" src="/img/about-2.jpg" alt="About Us" style={{ marginTop: '-25%' }} />
              </div>
            </div>
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
              <p className="d-inline-block border rounded-pill py-1 px-4">About Us</p>
              <h1 className="mb-4">Why You Should Trust Us? Get to Know About Us!</h1>
              <p>Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos. Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo magna dolore erat amet.</p>
              <p className="mb-4">Stet no et lorem dolor et diam, amet duo ut dolore vero eos. No stet est diam rebum amet diam ipsum. Clita clita labore, dolor duo nonumy clita sit at, sed sit sanctus dolor eos.</p>
              <p><i className="far fa-check-circle text-primary me-3"></i>Quality Health Care</p>
              <p><i className="far fa-check-circle text-primary me-3"></i>Only Qualified Doctors</p>
              <p><i className="far fa-check-circle text-primary me-3"></i>Medical Research Professionals</p>
              <a className="btn btn-primary rounded-pill py-3 px-5 mt-3" href="#">Read More</a>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Service Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
            <p className="d-inline-block border rounded-pill py-1 px-4">Services</p>
            <h1>Health Care Solutions</h1>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="service-item bg-light rounded h-100 p-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-4" style={{ width: '65px', height: '65px' }}>
                  <i className="fa fa-heartbeat text-primary fs-4"></i>
                </div>
                <h4 className="mb-3">Cardiology</h4>
                <p className="mb-4">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet.</p>
                <a className="btn" href="#"><i className="fa fa-plus text-primary me-3"></i>Read More</a>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
              <div className="service-item bg-light rounded h-100 p-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-4" style={{ width: '65px', height: '65px' }}>
                  <i className="fa fa-x-ray text-primary fs-4"></i>
                </div>
                <h4 className="mb-3">Pulmonary</h4>
                <p className="mb-4">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet.</p>
                <a className="btn" href="#"><i className="fa fa-plus text-primary me-3"></i>Read More</a>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
              <div className="service-item bg-light rounded h-100 p-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-4" style={{ width: '65px', height: '65px' }}>
                  <i className="fa fa-brain text-primary fs-4"></i>
                </div>
                <h4 className="mb-3">Neurology</h4>
                <p className="mb-4">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet.</p>
                <a className="btn" href="#"><i className="fa fa-plus text-primary me-3"></i>Read More</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Service End */}

      {/* Feature Start */}
      <div className="container-fluid bg-primary overflow-hidden my-5 px-lg-0">
        <div className="container feature px-lg-0">
          <div className="row g-0 mx-lg-0">
            <div className="col-lg-6 feature-text py-5 wow fadeIn" data-wow-delay="0.1s">
              <div className="p-lg-5 ps-lg-0">
                <p className="d-inline-block border rounded-pill text-light py-1 px-4">Features</p>
                <h1 className="text-white mb-4">Why Choose Us</h1>
                <p className="text-white mb-4 pb-2">Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos. Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo erat amet.</p>
                <div className="row g-4">
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle bg-light" style={{ width: '55px', height: '55px' }}>
                        <i className="fa fa-user-md text-primary"></i>
                      </div>
                      <div className="ms-4">
                        <p className="text-white mb-2">Experience</p>
                        <h5 className="text-white mb-0">Doctors</h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle bg-light" style={{ width: '55px', height: '55px' }}>
                        <i className="fa fa-check text-primary"></i>
                      </div>
                      <div className="ms-4">
                        <p className="text-white mb-2">Quality</p>
                        <h5 className="text-white mb-0">Services</h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle bg-light" style={{ width: '55px', height: '55px' }}>
                        <i className="fa fa-comment-medical text-primary"></i>
                      </div>
                      <div className="ms-4">
                        <p className="text-white mb-2">Positive</p>
                        <h5 className="text-white mb-0">Consultation</h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle bg-light" style={{ width: '55px', height: '55px' }}>
                        <i className="fa fa-headset text-primary"></i>
                      </div>
                      <div className="ms-4">
                        <p className="text-white mb-2">24 Hours</p>
                        <h5 className="text-white mb-0">Support</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 pe-lg-0 wow fadeIn" data-wow-delay="0.5s" style={{ minHeight: '400px' }}>
              <div className="position-relative h-100">
                <img className="position-absolute img-fluid w-100 h-100" src="/img/feature.jpg" style={{ objectFit: 'cover' }} alt="Feature" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Feature End */}
    </div>
  );
}