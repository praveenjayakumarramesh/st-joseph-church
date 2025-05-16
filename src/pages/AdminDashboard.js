import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [newDonation, setNewDonation] = useState({
    donorName: '',
    amount: '',
    function: '',
    type: 'income',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingDonation, setEditingDonation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDonations();
  }, [navigate]);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/donations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDonations(response.data.donations);
    } catch (error) {
      setError('Error fetching donations');
    }
  };

  const handleChange = (e) => {
    setNewDonation({
      ...newDonation,
      [e.target.name]: e.target.value
    });
  };

  const handleEditChange = (e) => {
    setEditingDonation({
      ...editingDonation,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/donations`, newDonation, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Donation added successfully');
      setNewDonation({
        donorName: '',
        amount: '',
        function: '',
        type: 'income',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchDonations();
    } catch (error) {
      setError('Error adding donation');
    }
  };

  const handleEdit = (donation) => {
    setEditingDonation({
      ...donation,
      date: new Date(donation.date).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/donations/${editingDonation._id}`, editingDonation, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Donation updated successfully');
      setShowEditModal(false);
      fetchDonations();
    } catch (error) {
      setError('Error updating donation');
    }
  };

  const handleDelete = (donation) => {
    setDonationToDelete(donation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/donations/${donationToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Donation deleted successfully');
      setShowDeleteModal(false);
      setDonationToDelete(null);
      fetchDonations();
    } catch (error) {
      setError('Error deleting donation');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <Container className="admin-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <Button variant="outline-danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="add-donation-section mb-4">
        <h3>Add New Donation</h3>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Donor Name</Form.Label>
                <Form.Control
                  type="text"
                  name="donorName"
                  value={newDonation.donorName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={newDonation.amount}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={newDonation.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Function</Form.Label>
                <Form.Control
                  type="text"
                  name="function"
                  value={newDonation.function}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={newDonation.type}
                  onChange={handleChange}
                  required
                >
                  <option value="income">Income</option>
                  <option value="expenditure">Expenditure</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={newDonation.description}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </div>
          <Button variant="primary" type="submit">
            Add Donation
          </Button>
        </Form>
      </div>

      <div className="donations-list">
        <h3>Recent Donations</h3>
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Donor Name</th>
              <th>Function</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation._id}>
                <td>{new Date(donation.date).toLocaleDateString()}</td>
                <td>{donation.donorName}</td>
                <td>{donation.function}</td>
                <td>₹{donation.amount.toLocaleString()}</td>
                <td>{donation.type}</td>
                <td>{donation.description}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(donation)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(donation)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Donation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Donor Name</Form.Label>
              <Form.Control
                type="text"
                name="donorName"
                value={editingDonation?.donorName || ''}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={editingDonation?.amount || ''}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={editingDonation?.date || ''}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Function</Form.Label>
              <Form.Control
                type="text"
                name="function"
                value={editingDonation?.function || ''}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={editingDonation?.type || 'income'}
                onChange={handleEditChange}
                required
              >
                <option value="income">Income</option>
                <option value="expenditure">Expenditure</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={editingDonation?.description || ''}
                onChange={handleEditChange}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the donation from {donationToDelete?.donorName} for {donationToDelete?.function}?
          <br />
          <strong>Amount: ₹{donationToDelete?.amount?.toLocaleString()}</strong>
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

export default AdminDashboard; 