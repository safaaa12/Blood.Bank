// MetaDataDisplay.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MetaDataDisplay = () => {
    const [metaData, setMetaData] = useState(null);

    useEffect(() => {
        const fetchMetaData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/blood/meta');
                console.log('Fetched meta data:', response.data); // Log the response for debugging
                setMetaData(response.data);
            } catch (error) {
                console.error('Error fetching meta data:', error.response?.data || error.message);
            }
        };

        fetchMetaData();
    }, []);

    return (
        <div className="meta-container">
            <h2>META DATA</h2>
            <p>מספר מנות דם בבנק: {metaData?.totalBloodUnits ?? 'לא זמין'}</p>
            <p>מספר תורמים רשומים: {metaData?.totalDonors ?? 'לא זמין'}</p>
            <p>ניפוקים אחרונים: {metaData?.recentDispenses ?? 'לא זמין'}</p>
        </div>
    );


};

export default MetaDataDisplay;