import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Pages
import Home from './pages/Home';
import Income from './pages/Income';
import Gallery from './pages/Gallery';
import Designations from './pages/Designations';
import Login from './pages/Login';
import YearlyExpenditures from './pages/YearlyExpenditures';
import Expenses from './pages/Expenses';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/designations" element={<Designations />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/expenditures" element={<YearlyExpenditures />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
