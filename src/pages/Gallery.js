import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import axios from 'axios';
import API_URL from '../config';
import './Gallery.css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState('all');
  const [functions, setFunctions] = useState([]);

  useEffect(() => {
    fetchImages();
    fetchFunctions();
  }, [selectedFunction]);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gallery?function=${selectedFunction}`);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const fetchFunctions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gallery/functions`);
      setFunctions(response.data);
    } catch (error) {
      console.error('Error fetching functions:', error);
    }
  };

  return (
    <Container className="gallery-container">
      <h2 className="text-center mb-4">Photo Gallery</h2>
      
      <Form.Group className="mb-4">
        <Form.Label>Filter by Function</Form.Label>
        <Form.Select
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          <option value="all">All Functions</option>
          {functions.map((func) => (
            <option key={func} value={func}>{func}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Row>
        {images.map((image) => (
          <Col key={image._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className="gallery-card">
              <Card.Img
                variant="top"
                src={image.url}
                alt={image.description}
                className="gallery-image"
              />
              <Card.Body>
                <Card.Title>{image.title}</Card.Title>
                <Card.Text>{image.description}</Card.Text>
                <Card.Text className="text-muted">
                  <small>{new Date(image.date).toLocaleDateString()}</small>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Gallery; 