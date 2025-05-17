import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import API_URL from '../config';
import './YearlyExpenditures.css';

const YearlyExpenditures = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [years] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2019 }, (_, i) => (2020 + i).toString());
  });
  const [expenditures, setExpenditures] = useState([]);
  const [error, setError] = useState('');
  const [yearlyData, setYearlyData] = useState({
    income: 0,
    expenditure: 0,
    balance: 0
  });

  useEffect(() => {
    fetchExpenditures();
  }, [selectedYear]);

  const fetchExpenditures = async () => {
    try {
      setError('');
      // Fetch income records
      const incomeResponse = await axios.get(`${API_URL}/api/records`, {
        params: {
          year: selectedYear
        }
      });

      // Fetch expense records
      const expenseResponse = await axios.get(`${API_URL}/api/expenses`, {
        params: {
          year: selectedYear
        }
      });

      // Calculate yearly totals
      const incomeTotal = incomeResponse.data.records.reduce((sum, record) => sum + record.amount, 0);
      const expenseTotal = expenseResponse.data.expenses.reduce((sum, expense) => sum + expense.amount, 0);

      setYearlyData({
        income: incomeTotal,
        expenditure: expenseTotal,
        balance: incomeTotal - expenseTotal
      });
    } catch (error) {
      console.error('Error fetching yearly data:', error);
      setError(error.response?.data?.message || 'Error fetching yearly data. Please try again.');
    }
  };

  return (
    <Container className="yearly-expenditures">
      <h2 className="text-center mb-4">Yearly Financial Report</h2>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Row className="mb-4">
        <Col md={3}>
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
              <Card.Title>Yearly Income</Card.Title>
              <Card.Text className="amount income">₹{yearlyData.income.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Yearly Expenditure</Card.Title>
              <Card.Text className="amount expenditure">₹{yearlyData.expenditure.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Yearly Balance</Card.Title>
              <Card.Text className={`amount ${yearlyData.balance >= 0 ? 'positive' : 'negative'}`}>
                ₹{yearlyData.balance.toLocaleString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default YearlyExpenditures; 