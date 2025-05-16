import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Contact Us</h5>
            <p>
              St. Joseph The Worker Church<br />
              Deva Madha Koil Street<br />
              Mukkudal, Tirunelveli<br />
              Tamil Nadu, India
            </p>
            <p>
              Phone: +91 XXXXXXXXXX<br />
              Email: stjosephchurch@example.com
            </p>
          </Col>
          <Col md={4}>
            <h5>Mass Timings</h5>
            <p>
              Sunday: 8:00 AM & 6:00 PM<br />
              Weekdays: 6:30 AM<br />
              Saturday: 6:30 AM
            </p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/donations">Donations</a></li>
              <li><a href="/gallery">Photo Gallery</a></li>
              <li><a href="/designations">Church Designations</a></li>
            </ul>
          </Col>
        </Row>
        <hr />
        <div className="text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} St. Joseph The Worker Church. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 