const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Get all expenses with optional year and function filters
router.get('/', async (req, res) => {
  try {
    const { year, function: functionName } = req.query;
    let query = {};

    // Validate year parameter
    if (year) {
      const yearNum = parseInt(year);
      if (isNaN(yearNum)) {
        return res.status(400).json({ 
          message: 'Invalid year parameter',
          received: year
        });
      }

      // Validate year range (e.g., between 2000 and current year + 1)
      const currentYear = new Date().getFullYear();
      if (yearNum < 2000 || yearNum > currentYear + 1) {
        return res.status(400).json({ 
          message: 'Year must be between 2000 and ' + (currentYear + 1),
          received: yearNum
        });
      }

      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum, 11, 31, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (functionName && functionName !== 'all') {
      query.function = functionName;
    }

    console.log('Query:', JSON.stringify(query, null, 2)); // Debug log

    // Check if Expense model is properly defined
    if (!Expense || typeof Expense.find !== 'function') {
      console.error('Expense model is not properly defined');
      return res.status(500).json({ 
        message: 'Database model error',
        error: 'Expense model is not properly defined'
      });
    }

    // Add error handling for the database query
    let expenses;
    try {
      expenses = await Expense.find(query).sort({ date: -1 });
      console.log('Found expenses:', expenses.length); // Debug log
    } catch (dbError) {
      console.error('Database query error:', {
        message: dbError.message,
        stack: dbError.stack,
        query: query
      });
      return res.status(500).json({ 
        message: 'Error querying expenses',
        error: dbError.message
      });
    }

    // Calculate total with error handling
    let totalExpenses = 0;
    try {
      totalExpenses = expenses.reduce((sum, expense) => {
        if (typeof expense.amount !== 'number') {
          console.warn('Invalid amount found:', expense);
          return sum;
        }
        return sum + expense.amount;
      }, 0);
      console.log('Total expenses:', totalExpenses); // Debug log
    } catch (calcError) {
      console.error('Error calculating total:', {
        message: calcError.message,
        stack: calcError.stack
      });
      return res.status(500).json({ 
        message: 'Error calculating total expenses',
        error: calcError.message
      });
    }

    res.json({ expenses, totalExpenses });
  } catch (error) {
    console.error('Detailed error in GET /expenses:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ 
      message: 'Error fetching expenses',
      error: error.message 
    });
  }
});

// Get available years
router.get('/years', async (req, res) => {
  try {
    console.log('Fetching years...'); // Debug log
    
    // Check if Expense model is properly defined
    if (!Expense || typeof Expense.distinct !== 'function') {
      console.error('Expense model is not properly defined');
      return res.status(500).json({ 
        message: 'Database model error',
        error: 'Expense model is not properly defined'
      });
    }

    let dates;
    try {
      dates = await Expense.distinct('date', {});
      console.log('Raw dates:', dates); // Debug log
    } catch (dbError) {
      console.error('Error fetching distinct dates:', {
        message: dbError.message,
        stack: dbError.stack
      });
      return res.status(500).json({ 
        message: 'Error fetching dates',
        error: dbError.message
      });
    }

    const years = dates
      .map(date => {
        try {
          return date.getFullYear();
        } catch (dateError) {
          console.warn('Invalid date found:', date);
          return null;
        }
      })
      .filter(year => year !== null);

    const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
    console.log('Final years array:', uniqueYears); // Debug log
    
    res.json(uniqueYears);
  } catch (error) {
    console.error('Detailed error in GET /expenses/years:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error fetching years',
      error: error.message 
    });
  }
});

// Get yearly totals
router.get('/yearly-totals', async (req, res) => {
  try {
    console.log('Fetching yearly totals...'); // Debug log

    // Check if Expense model is properly defined
    if (!Expense || typeof Expense.aggregate !== 'function') {
      console.error('Expense model is not properly defined');
      return res.status(500).json({ 
        message: 'Database model error',
        error: 'Expense model is not properly defined'
      });
    }

    let expenses;
    try {
      expenses = await Expense.aggregate([
        {
          $group: {
            _id: { $year: '$date' },
            total: { $sum: '$amount' }
          }
        },
        {
          $project: {
            year: '$_id',
            total: 1,
            _id: 0
          }
        },
        {
          $sort: { year: 1 }
        }
      ]);
      console.log('Yearly totals:', expenses); // Debug log
    } catch (dbError) {
      console.error('Error in aggregation:', {
        message: dbError.message,
        stack: dbError.stack
      });
      return res.status(500).json({ 
        message: 'Error calculating yearly totals',
        error: dbError.message
      });
    }

    res.json(expenses);
  } catch (error) {
    console.error('Detailed error in GET /expenses/yearly-totals:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error fetching yearly totals',
      error: error.message 
    });
  }
});

// Add new expense (protected route)
router.post('/', auth, async (req, res) => {
  try {
    const { name, amount, function: functionName, date } = req.body;
    console.log('Received expense data:', req.body); // Debug log

    if (!name || !amount || !functionName) {
      console.log('Missing required fields:', { name, amount, functionName }); // Debug log
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        received: { name, amount, functionName }
      });
    }

    // Validate amount is a number
    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      return res.status(400).json({
        message: 'Amount must be a valid number',
        received: amount
      });
    }

    const expense = new Expense({
      name,
      amount: amountNum,
      function: functionName,
      date: date ? new Date(date) : new Date()
    });

    console.log('Created expense object:', expense); // Debug log
    
    try {
      await expense.save();
      console.log('Saved expense:', expense); // Debug log
    } catch (saveError) {
      console.error('Error saving expense:', {
        message: saveError.message,
        stack: saveError.stack,
        expense: expense
      });
      return res.status(500).json({ 
        message: 'Error saving expense',
        error: saveError.message
      });
    }
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Detailed error in POST /expenses:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Error adding expense',
      error: error.message 
    });
  }
});

module.exports = router; 