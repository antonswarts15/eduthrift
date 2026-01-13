import React from 'react';

const ReportsPage = () => {
  return (
    <div>
      <h1>Reports</h1>
      <p>Generate and view system reports.</p>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
          <h3>Sales Report</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input type="date" />
            <input type="date" />
            <button style={{ width: 'auto' }}>Generate</button>
          </div>
        </div>

        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
          <h3>User Growth</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <select style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
            <button style={{ width: 'auto' }}>View</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
