import React from 'react';
import { Container, Row, Col, Card, Carousel } from 'react-bootstrap';
import './Home.css';

const Home = () => {
  const announcements = [
    {
      title: 'Sunday Mass',
      description: 'Join us for Sunday Mass at 8:00 AM and 6:00 PM',
      date: '2024-03-20'
    },
    {
      title: 'Easter Celebration',
      description: 'Special Easter Mass and celebrations on March 31st',
      date: '2024-03-31'
    },
    {
      title: 'Community Prayer',
      description: 'Weekly community prayer every Wednesday at 6:00 PM',
      date: '2024-03-27'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Feast of St. Joseph',
      date: '2024-05-01',
      description: 'Annual feast celebration with special mass and cultural programs'
    },
    {
      title: 'Christmas Celebration',
      date: '2024-12-25',
      description: 'Midnight mass and cultural programs'
    }
  ];

  return (
    <Container className="home-container">
      <Carousel className="mb-4">
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-image"
            src="/images/church-exterior.png"
            alt="Church Exterior"
          />
          <Carousel.Caption>
            <h3>St. Joseph The Worker Church</h3>
            <p>Deva Madha Koil Street, Mukkudal, Tirunelveli</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-image"
            src="/images/church-interior.png"
            alt="Church Interior"
          />
          <Carousel.Caption>
            <h3>Welcome to Our Parish</h3>
            <p>A place of worship and community</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <Card.Title>Mass Timings</Card.Title>
              <Card.Text>
                <ul className="list-unstyled">
                  <li>Sunday: 8:00 AM & 6:00 PM</li>
                  <li>Weekdays: 6:30 AM</li>
                  <li>Saturday: 6:30 AM</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <Card.Title>Contact Information</Card.Title>
              <Card.Text>
                <p><strong>Address:</strong> Deva Madha Koil Street, Mukkudal, Tirunelveli</p>
                <p><strong>Phone:</strong> +91 XXXXXXXXXX</p>
                <p><strong>Email:</strong> stjosephchurch@example.com</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="announcements-card">
            <Card.Body>
              <Card.Title>Announcements</Card.Title>
              {announcements.map((announcement, index) => (
                <div key={index} className="announcement-item">
                  <h5>{announcement.title}</h5>
                  <p>{announcement.description}</p>
                  <small className="text-muted">
                    {new Date(announcement.date).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="events-card">
            <Card.Body>
              <Card.Title>Upcoming Events</Card.Title>
              {upcomingEvents.map((event, index) => (
                <div key={index} className="event-item">
                  <h5>{event.title}</h5>
                  <p>{event.description}</p>
                  <small className="text-muted">
                    {new Date(event.date).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home; 