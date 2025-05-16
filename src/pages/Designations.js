import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import API_URL from '../config';
import './Designations.css';

const Designations = () => {
  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/designations`);
      setDesignations(response.data);
    } catch (error) {
      console.error('Error fetching designations:', error);
    }
  };

  return (
    <Container className="designations-container">
      <h2 className="text-center mb-4">Church Designations</h2>
      
      <Row>
        {designations.map((designation) => (
          <Col key={designation._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className="designation-card">
              <div className="image-container">
                <Card.Img
                  variant="top"
                  src={designation.imageUrl}
                  alt={designation.name}
                  className="designation-image"
                />
              </div>
              <Card.Body>
                <Card.Title>{designation.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {designation.position}
                </Card.Subtitle>
                <Card.Text>
                  <strong>Contact:</strong> {designation.contact}
                </Card.Text>
                <Card.Text>
                  <strong>Email:</strong> {designation.email}
                </Card.Text>
                <Card.Text>
                  <strong>Term:</strong> {designation.term}
                </Card.Text>
                {designation.description && (
                  <Card.Text className="mt-2">{designation.description}</Card.Text>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Designations; 