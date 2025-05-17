import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Form, Row, Col, Card, Button, Modal, Alert } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import API_URL from '../config';
import './Donations.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Donations = () => {
  const [records, setRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedFunction, setSelectedFunction] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [years] = useState(['2020', '2021', '2022', '2023', '2024', '2025']);
  const [functions, setFunctions] = useState(['Feast', 'Christmas', 'Easter']);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newRecord, setNewRecord] = useState({
    name: '',
    amount: '',
    function: '',
    type: 'offering',
    date: new Date().toISOString().split('T')[0]
  });
  const [totals, setTotals] = useState({
    offerings: 0,
    donations: 0,
    churchTax: 0,
    totalIncome: 0
  });
  const [yearlyData, setYearlyData] = useState({
    labels: [],
    income: []
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

  const fetchRecords = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/records`, {
        params: {
          year: selectedYear,
          function: selectedFunction,
          type: selectedType === 'all' ? undefined : selectedType
        }
      });
      setRecords(response.data.records);
      
      // Calculate totals
      const totals = response.data.records.reduce((acc, record) => {
        if (record.type === 'offering') {
          acc.offerings += record.amount;
        } else if (record.type === 'donation') {
          acc.donations += record.amount;
        } else if (record.type === 'church_tax') {
          acc.churchTax += record.amount;
        }
        acc.totalIncome += record.amount;
        return acc;
      }, { offerings: 0, donations: 0, churchTax: 0, totalIncome: 0 });
      
      setTotals(totals);
    } catch (error) {
      console.error('Error fetching records:', error);
      setError(error.response?.data?.message || 'Error fetching records. Please try again.');
    }
  }, [selectedYear, selectedFunction, selectedType]);

  const fetchYearlyData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/records/yearly-totals`);
      const data = response.data;
      
      setYearlyData({
        labels: data.map(item => item.year),
        income: data.map(item => item.total)
      });
    } catch (error) {
      console.error('Error fetching yearly data:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchYearlyData();
  }, [fetchRecords]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type') {
      // If type is not donation, clear the function field
      setNewRecord(prev => ({
        ...prev,
        [name]: value,
        function: value === 'donation' ? prev.function : ''
      }));
    } else {
      setNewRecord(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to add records');
        return;
      }

      // Only include function if type is donation
      const recordData = {
        ...newRecord,
        function: newRecord.type === 'donation' ? newRecord.function : undefined
      };

      await axios.post(`${API_URL}/api/records`, recordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewRecord({
        name: '',
        amount: '',
        function: '',
        type: 'offering',
        date: new Date().toISOString().split('T')[0]
      });
      fetchRecords();
    } catch (error) {
      console.error('Error adding record:', error);
      setError(error.response?.data?.message || 'Error adding record. Please try again.');
    }
  };

  const chartData = {
    labels: yearlyData.labels,
    datasets: [
      {
        label: 'Total Income',
        data: yearlyData.income,
        backgroundColor: '#27ae60', // Green color
        borderColor: '#27ae60',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Yearly Income Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  const handleEdit = (record) => {
    setEditingRecord({
      ...record,
      date: new Date(record.date).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to edit records');
        return;
      }
      await axios.put(`${API_URL}/api/records/${editingRecord._id}`, editingRecord, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      setEditingRecord(null);
      fetchRecords();
    } catch (error) {
      console.error('Error updating record:', error);
      setError(error.response?.data?.message || 'Error updating record. Please try again.');
    }
  };

  const handleDelete = (record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to delete records');
        return;
      }
      await axios.delete(`${API_URL}/api/records/${recordToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowDeleteModal(false);
      setRecordToDelete(null);
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      setError(error.response?.data?.message || 'Error deleting record. Please try again.');
    }
  };

  return (
    <Container className="donations-container">
      <h2 className="text-center mb-4">Income Records</h2>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {isAdmin && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Body>
                <Card.Title>Add New Record</Card.Title>
                <Form onSubmit={handleAddRecord}>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={newRecord.name}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                          type="number"
                          name="amount"
                          value={newRecord.amount}
                          onChange={handleInputChange}
                          required
                          min="0"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                          name="type"
                          value={newRecord.type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="offering">Offering</option>
                          <option value="donation">Donation</option>
                          <option value="church_tax">Church Tax</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    {newRecord.type === 'donation' && (
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Function</Form.Label>
                          <Form.Select
                            name="function"
                            value={newRecord.function}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Function</option>
                            {functions.map((func) => (
                              <option key={func} value={func}>{func}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    )}
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={newRecord.date}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>                    
                  </Row>
                  <Row>
                    <Col md={12} className="d-flex justify-content-center">
                      <Button variant="primary" type="submit" style={{ width: '200px' }}>
                        Add Record
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col md={4}>
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
        <Col md={4}>
          <Form.Group>
            <Form.Label>Income Type</Form.Label>
            <Form.Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="offering">Offering</option>
              <option value="donation">Donation</option>
              <option value="church_tax">Church Tax</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
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
        <Col md={3}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Offerings</Card.Title>
              <Card.Text className="amount">₹{totals.offerings.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Donations</Card.Title>
              <Card.Text className="amount">₹{totals.donations.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Church Tax</Card.Title>
              <Card.Text className="amount">₹{totals.churchTax.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Income</Card.Title>
              <Card.Text className="amount">₹{totals.totalIncome.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Type</th>
            <th>Function</th>
            <th>Amount</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record._id}>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{record.name}</td>
              <td>{record.type === 'church_tax' ? 'Church Tax' : record.type.charAt(0).toUpperCase() + record.type.slice(1)}</td>
              <td>{record.type === 'donation' ? record.function : '-'}</td>
              <td>₹{record.amount.toLocaleString()}</td>
              {isAdmin && (
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(record)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(record)}
                  >
                    Delete
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Yearly Income Chart */}
      {isAdmin && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="chart-card">
              <Card.Body>
                <Bar data={chartData} options={chartOptions} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editingRecord?.name || ''}
                onChange={(e) => setEditingRecord({...editingRecord, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={editingRecord?.amount || ''}
                onChange={(e) => setEditingRecord({...editingRecord, amount: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={editingRecord?.type || ''}
                onChange={(e) => setEditingRecord({...editingRecord, type: e.target.value})}
                required
              >
                <option value="offering">Offering</option>
                <option value="donation">Donation</option>
                <option value="church_tax">Church Tax</option>
              </Form.Select>
            </Form.Group>
            {editingRecord?.type === 'donation' && (
              <Form.Group className="mb-3">
                <Form.Label>Function</Form.Label>
                <Form.Select
                  name="function"
                  value={editingRecord?.function || ''}
                  onChange={(e) => setEditingRecord({...editingRecord, function: e.target.value})}
                  required
                >
                  <option value="">Select Function</option>
                  {functions.map((func) => (
                    <option key={func} value={func}>{func}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={editingRecord?.date || ''}
                onChange={(e) => setEditingRecord({...editingRecord, date: e.target.value})}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
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
          Are you sure you want to delete this record?
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

export default Donations; 