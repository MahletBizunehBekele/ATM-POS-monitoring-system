import React from 'react';
import { useNavigate } from 'react-router-dom';

function OptionsPage() {
  const navigate = useNavigate();

  const handleOption1 = () => {
    navigate('/atmreport');
  };

  const handleOption2 = () => {
    navigate('/posreport');
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>Select Your Report</h1>
        <div style={styles.buttonContainer}>
          <button onClick={handleOption1} style={styles.button}>
            ATM Alert Report
          </button>
          <button onClick={handleOption2} style={styles.button}>
            POS Alert Report
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5', // Light grey background
    width: '1200px'
  },
  content: {
    textAlign: 'center',
    padding: '30px',
    backgroundColor: '#ffffff', // White background for content box
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    borderRadius: '8px',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#D30033', // Red color for the heading
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    color: '#ffffff', // White text color
    backgroundColor: '#D30033', // Red background color
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

styles.button[':hover'] = {
  backgroundColor: '#8B0000', // Darker red on hover
};

export default OptionsPage;