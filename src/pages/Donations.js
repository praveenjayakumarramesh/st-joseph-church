import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Form, Row, Col, Card, Button, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import API_URL from '../config';
import './Donations.css';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedFunction, setSelectedFunction] = useState('all');
  const [years, setYears] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newDonation, setNewDonation] = useState({
    donorName: '',
    amount: '',
    function: '',
    type: 'income',
    description: ''
  });
  const [totals, setTotals] = useState({
    income: 0,
    expenditure: 0,
    balance: 0
  });

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === 'admin');
      } catch (error) {
        console.error('Error parsing token:', error);
        setIsAdmin(false);
      }
    }
  }, []);

  const fetchDonations = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/donations`, {
        params: {
          year: selectedYear,
          function: selectedFunction
        }
      });
      setDonations(response.data.donations);
      setTotals(response.data.totals);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError(error.response?.data?.message || 'Error fetching donations. Please try again.');
    }
  }, [selectedYear, selectedFunction]);

  const fetchYears = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/donations/years`);
      setYears(response.data);
    } catch (error) {
      console.error('Error fetching years:', error);
      setError(error.response?.data?.message || 'Error fetching years. Please try again.');
    }
  };

  const fetchFunctions = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/donations/functions`);
      setFunctions(response.data);
    } catch (error) {
      console.error('Error fetching functions:', error);
      setError(error.response?.data?.message || 'Error fetching functions. Please try again.');
    }
  };

  useEffect(() => {
    fetchDonations();
    fetchYears();
    fetchFunctions();
  }, [fetchDonations]);

  const handleAddDonation = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to add donations');
        return;
      }
      await axios.post(`${API_URL}/api/donations`, newDonation, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewDonation({
        donorName: '',
        amount: '',
        function: '',
        type: 'income',
        description: ''
      });
      fetchDonations();
    } catch (error) {
      console.error('Error adding donation:', error);
      setError(error.response?.data?.message || 'Error adding donation. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDonation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container className="donations-container">
      <h2 className="text-center mb-4">Donations and Financial Records</h2>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select Year</Form.Label>
            <Form.Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select Function</Form.Label>
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
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Income</Card.Title>
              <Card.Text className="amount">₹{totals.income.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Expenditure</Card.Title>
              <Card.Text className="amount">₹{totals.expenditure.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Balance</Card.Title>
              <Card.Text className="amount">₹{totals.balance.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isAdmin && (
        <div className="text-end mb-3">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add New Donation
          </Button>
        </div>
      )}

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Donor Name</th>
            <th>Function</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Description</th>
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
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Donation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddDonation}>
            <Form.Group className="mb-3">
              <Form.Label>Donor Name</Form.Label>
              <Form.Control
                type="text"
                name="donorName"
                value={newDonation.donorName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={newDonation.amount}
                onChange={handleInputChange}
                required
                min="0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Function</Form.Label>
              <Form.Select
                name="function"
                value={newDonation.function}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Function</option>
                {functions.map((func) => (
                  <option key={func} value={func}>{func}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={newDonation.type}
                onChange={handleInputChange}
                required
              >
                <option value="income">Income</option>
                <option value="expenditure">Expenditure</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newDonation.description}
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Add Donation
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Donations; 