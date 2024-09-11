// import React, { useEffect, useState } from 'react';

// const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// const ResearchDataPage = () => {
//   const [data, setData] = useState({}); // Use an object to store blood type counts
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch the data from the API
//     fetch('/api/blood/stats')
//       .then(response => response.json())
//       .then(result => {
//         if (result && result.bloodTypeCounts) {
//           const bloodTypeCounts = {};

//           // Initialize all blood types with count 0
//           bloodTypes.forEach(type => {
//             bloodTypeCounts[type] = 0;
//           });

//           // Update with actual counts from the server
//           result.bloodTypeCounts.forEach(item => {
//             if (bloodTypeCounts[item._id] !== undefined) {
//               bloodTypeCounts[item._id] = item.count;
//             }
//           });

//           setData(bloodTypeCounts); // Set the updated data
//         }
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error("Error fetching research data:", err);
//         setError("Error fetching research data");
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>{error}</p>;
//   }

//   return (
//     <div>
//       <h1>Blood Type Statistics</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Blood Type</th>
//             <th>Count</th>
//           </tr>
//         </thead>
//         <tbody>
//           {bloodTypes.map((type) => (
//             <tr key={type}>
//               <td>{type}</td>
//               <td>{data[type]}</td> {/* Display the count for each blood type */}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ResearchDataPage;
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';  // Automatically register the required Chart.js components
import './ResearchDataPage.css'; // Import the CSS file

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ResearchDataPage = () => {
  const [data, setData] = useState({}); // Use an object to store blood type counts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the data from the API
    fetch('/api/blood/stats')
      .then(response => response.json())
      .then(result => {
        if (result && result.bloodTypeCounts) {
          const bloodTypeCounts = {};

          // Initialize all blood types with count 0
          bloodTypes.forEach(type => {
            bloodTypeCounts[type] = 0;
          });

          // Update with actual counts from the server
          result.bloodTypeCounts.forEach(item => {
            if (bloodTypeCounts[item._id] !== undefined) {
              bloodTypeCounts[item._id] = item.count;
            }
          });

          setData(bloodTypeCounts); // Set the updated data
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching research data:", err);
        setError("Error fetching research data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Prepare chart data
  const chartData = {
    labels: bloodTypes,
    datasets: [{
      label: 'Blood Type Count',
      data: bloodTypes.map(type => data[type] || 0), // Use actual data or 0 if undefined
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <div>
      <h1>Blood Type Statistics</h1>
      <table>
        <thead>
          <tr>
            <th>Blood Type</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {bloodTypes.map((type) => (
            <tr key={type}>
              <td>{type}</td>
              <td>{data[type]}</td> {/* Display the count for each blood type */}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ width: '600px', height: '400px', marginTop: '50px' }}>
        <Bar data={chartData} options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: ${context.raw}`,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Blood Types',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Count',
              },
            },
          },
        }} />
      </div>
    </div>
  );
};

export default ResearchDataPage;
