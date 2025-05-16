import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import API_URL from '../config';
import './YearlyExpenditures.css';

const YearlyExpenditures = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [years, setYears] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [error, setError] = useState('');
  const [totals, setTotals] = useState({
    income: 0,
    expenditure: 0,
    balance: 0
  });

  useEffect(() => {
    fetchYears();
    fetchExpenditures();
  }, [selectedYear]);

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

  const fetchExpenditures = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/donations`, {
        params: {
          year: selectedYear
        }
      });
      setExpenditures(response.data.donations);
      setTotals(response.data.totals);
    } catch (error) {
      console.error('Error fetching expenditures:', error);
      setError(error.response?.data?.message || 'Error fetching expenditures. Please try again.');
    }
  };

  // Group expenditures by month
  const monthlyExpenditures = expenditures.reduce((acc, donation) => {
    const month = new Date(donation.date).toLocaleString('default', { month: 'long' });
    if (!acc[month]) {
      acc[month] = {
        income: 0,
        expenditure: 0,
        items: []
      };
    }
    if (donation.type === 'income') {
      acc[month].income += donation.amount;
    } else {
      acc[month].expenditure += donation.amount;
    }
    acc[month].items.push(donation);
    return acc;
  }, {});

  return (
    <Container className="yearly-expenditures">
      <h2 className="text-center mb-4">Yearly Financial Report - {selectedYear}</h2>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
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
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Income</Card.Title>
              <Card.Text className="amount income">₹{totals.income.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Expenditure</Card.Title>
              <Card.Text className="amount expenditure">₹{totals.expenditure.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Balance</Card.Title>
              <Card.Text className={`amount ${totals.balance >= 0 ? 'positive' : 'negative'}`}>
                ₹{totals.balance.toLocaleString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {Object.entries(monthlyExpenditures).map(([month, data]) => (
        <div key={month} className="monthly-section mb-4">
          <h3 className="month-title">{month}</h3>
          <Row className="mb-3">
            <Col md={4}>
              <Card className="monthly-summary">
                <Card.Body>
                  <Card.Title>Monthly Income</Card.Title>
                  <Card.Text className="amount income">₹{data.income.toLocaleString()}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="monthly-summary">
                <Card.Body>
                  <Card.Title>Monthly Expenditure</Card.Title>
                  <Card.Text className="amount expenditure">₹{data.expenditure.toLocaleString()}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="monthly-summary">
                <Card.Body>
                  <Card.Title>Monthly Balance</Card.Title>
                  <Card.Text className={`amount ${data.income - data.expenditure >= 0 ? 'positive' : 'negative'}`}>
                    ₹{(data.income - data.expenditure).toLocaleString()}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Function</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.description}</td>
                  <td>{item.function}</td>
                  <td className={item.type === 'income' ? 'income' : 'expenditure'}>
                    ₹{item.amount.toLocaleString()}
                  </td>
                  <td>{item.type}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}
    </Container>
  );
};

export default YearlyExpenditures; 