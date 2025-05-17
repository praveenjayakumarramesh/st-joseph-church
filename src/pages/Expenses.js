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
import './Expenses.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedFunction, setSelectedFunction] = useState('all');
  const [years] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2019 }, (_, i) => (2020 + i).toString());
  });
  const [functions, setFunctions] = useState(['Feast', 'Christmas', 'Easter']);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    function: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [yearlyData, setYearlyData] = useState({
    labels: [],
    expenses: []
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

  const fetchExpenses = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/expenses`, {
        params: {
          year: selectedYear,
          function: selectedFunction
        }
      });
      setExpenses(response.data.expenses);
      setTotalExpenses(response.data.totalExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError(error.response?.data?.message || 'Error fetching expenses. Please try again.');
    }
  }, [selectedYear, selectedFunction]);

  const fetchYearlyData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/expenses/yearly-totals`);
      const data = response.data;
      
      setYearlyData({
        labels: data.map(item => item.year),
        expenses: data.map(item => item.total)
      });
    } catch (error) {
      console.error('Error fetching yearly data:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchYearlyData();
  }, [fetchExpenses]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to add expenses');
        return;
      }
      await axios.post(`${API_URL}/api/expenses`, newExpense, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewExpense({
        name: '',
        amount: '',
        function: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      setError(error.response?.data?.message || 'Error adding expense. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (expense) => {
    setEditingExpense({
      ...expense,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to edit expenses');
        return;
      }
      await axios.put(`${API_URL}/api/expenses/${editingExpense._id}`, editingExpense, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      setError(error.response?.data?.message || 'Error updating expense. Please try again.');
    }
  };

  const handleDelete = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to delete expenses');
        return;
      }
      await axios.delete(`${API_URL}/api/expenses/${expenseToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError(error.response?.data?.message || 'Error deleting expense. Please try again.');
    }
  };

  const chartData = {
    labels: yearlyData.labels,
    datasets: [
      {
        label: 'Total Expenses',
        data: yearlyData.expenses,
        backgroundColor: '#e74c3c', // Red color
        borderColor: '#e74c3c',
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
        text: 'Yearly Expenses Overview'
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

  return (
    <Container className="expenses-container">
      <h2 className="text-center mb-4">Expenses Records</h2>
      
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
              <Card.Title>Total Expenses</Card.Title>
              <Card.Text className="amount">₹{totalExpenses.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isAdmin && (
        <div className="text-end mb-3">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add New Expense
          </Button>
        </div>
      )}

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Function</th>
            <th>Amount</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id}>
              <td>{new Date(expense.date).toLocaleDateString()}</td>
              <td>{expense.name}</td>
              <td>{expense.function}</td>
              <td>₹{expense.amount.toLocaleString()}</td>
              {isAdmin && (
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(expense)}
                  >
                    Delete
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Yearly Expenses Chart */}
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

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddExpense}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newExpense.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={newExpense.amount}
                onChange={handleInputChange}
                required
                min="0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Function</Form.Label>
              <Form.Select
                name="function"
                value={newExpense.function}
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
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={newExpense.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Add Expense
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editingExpense?.name || ''}
                onChange={(e) => setEditingExpense({...editingExpense, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={editingExpense?.amount || ''}
                onChange={(e) => setEditingExpense({...editingExpense, amount: e.target.value})}
                required
                min="0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Function</Form.Label>
              <Form.Select
                name="function"
                value={editingExpense?.function || ''}
                onChange={(e) => setEditingExpense({...editingExpense, function: e.target.value})}
                required
              >
                <option value="">Select Function</option>
                {functions.map((func) => (
                  <option key={func} value={func}>{func}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={editingExpense?.date || ''}
                onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
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
          Are you sure you want to delete this expense?
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

export default Expenses; 