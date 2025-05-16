import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import './AdminGallery.css';

const AdminGallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    function: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchImages();
    fetchFunctions();
  }, [navigate]);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gallery`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setImages(response.data);
    } catch (error) {
      setError('Error fetching images');
    }
  };

  const fetchFunctions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gallery/functions`);
      setFunctions(response.data);
    } catch (error) {
      setError('Error fetching functions');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewImage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/gallery`, newImage, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Image added successfully');
      setShowAddModal(false);
      setNewImage({
        title: '',
        description: '',
        function: '',
        imageUrl: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchImages();
      fetchFunctions();
    } catch (error) {
      setError('Error adding image');
    }
  };

  const handleDelete = (image) => {
    setImageToDelete(image);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/gallery/${imageToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Image deleted successfully');
      setShowDeleteModal(false);
      setImageToDelete(null);
      fetchImages();
      fetchFunctions();
    } catch (error) {
      setError('Error deleting image');
    }
  };

  return (
    <Container className="admin-gallery">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gallery Management</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add New Image
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Function</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {images.map((image) => (
            <tr key={image._id}>
              <td>
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="gallery-thumbnail"
                />
              </td>
              <td>{image.title}</td>
              <td>{image.function}</td>
              <td>{new Date(image.date).toLocaleDateString()}</td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(image)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Image Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newImage.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newImage.description}
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Function</Form.Label>
              <Form.Control
                type="text"
                name="function"
                value={newImage.function}
                onChange={handleInputChange}
                required
                list="functions"
              />
              <datalist id="functions">
                {functions.map((func) => (
                  <option key={func} value={func} />
                ))}
              </datalist>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={newImage.imageUrl}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={newImage.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Add Image
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the image "{imageToDelete?.title}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminGallery; 