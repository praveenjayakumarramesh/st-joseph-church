import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './Designations.css';

const Designations = () => {
  const designations = [
    {
      position: 'President',
      name: 'Baskar',
      image: '/images/president.png',
      description: 'Responsible for the overall spiritual and administrative leadership of the parish.'
    },
    {
      position: 'Secretary',
      name: 'John',
      image: '/images/secretary.png',
      description: 'Manages parish records, correspondence, and administrative tasks.'
    },
    {
      position: 'Treasurer',
      name: 'Jaya Seelan',
      image: '/images/treasurer.png',
      description: 'Oversees financial matters, maintains accounts, and prepares financial reports.'
    },
    {
      position: 'Tech Support',
      name: 'Praveen Jaya Kumar',
      image: '/images/treasurer.png',
      description: 'Works on the website development.'
    }
  ];

  return (
    <Container className="designations-container">
      <h2 className="text-center mb-4">Church Designations</h2>
      
      <Row className="justify-content-center">
        {designations.map((designation, index) => (
          <Col key={index} md={4} className="mb-4">
            <Card className="designation-card">
              <div className="image-container">
                <img
                  src={designation.image}
                  alt={designation.name}
                  className="designation-image"
                />
              </div>
              <Card.Body>
                <Card.Title>{designation.name}</Card.Title>
                <Card.Text>
                  <strong>{designation.position}</strong>
                </Card.Text>
                <Card.Text className="description">
                  {designation.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Designations; 