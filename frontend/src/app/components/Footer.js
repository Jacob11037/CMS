import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="container-fluid bg-dark text-light footer wow fadeIn" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-3 col-md-6">
              <h5 className="text-white mb-4">Address</h5>
              <p className="mb-2"><i className="fa fa-map-marker-alt me-3"></i>123 Street, New York, USA</p>
              <p className="mb-2"><i className="fa fa-phone-alt me-3"></i>+012 345 67890</p>
              <p className="mb-2"><i className="fa fa-envelope me-3"></i>info@example.com</p>
              <div className="d-flex pt-2">
                <a className="btn btn-outline-light btn-social rounded-circle" href=""><i className="fab fa-twitter"></i></a>
                <a className="btn btn-outline-light btn-social rounded-circle" href=""><i className="fab fa-facebook-f"></i></a>
                <a className="btn btn-outline-light btn-social rounded-circle" href=""><i className="fab fa-youtube"></i></a>
                <a className="btn btn-outline-light btn-social rounded-circle" href=""><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <h5 className="text-white mb-4">Services</h5>
              <a className="btn btn-link" href="">Cardiology</a>
              <a className="btn btn-link" href="">Pulmonary</a>
              <a className="btn btn-link" href="">Neurology</a>
              <a className="btn btn-link" href="">Orthopedics</a>
              <a className="btn btn-link" href="">Laboratory</a>
            </div>
            <div className="col-lg-3 col-md-6">
              <h5 className="text-white mb-4">Quick Links</h5>
              <a className="btn btn-link" href="">About Us</a>
              <a className="btn btn-link" href="">Contact Us</a>
              <a className="btn btn-link" href="">Our Services</a>
              <a className="btn btn-link" href="">Terms & Condition</a>
              <a className="btn btn-link" href="">Support</a>
            </div>
            <div className="col-lg-3 col-md-6">
              <h5 className="text-white mb-4">Newsletter</h5>
              <p>Dolor amet sit justo amet elitr clita ipsum elitr est.</p>
              <div className="position-relative mx-auto" style={{maxWidth: '400px'}}>
                <input className="form-control border-0 w-100 py-3 ps-4 pe-5" type="text" placeholder="Your email" />
                <button type="button" className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2">SignUp</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top"><i className="bi bi-arrow-up"></i></a>
    </footer>
  );
};

export default Footer;