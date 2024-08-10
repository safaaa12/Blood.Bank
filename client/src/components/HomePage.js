import React from 'react';
import { NavLink } from 'react-router-dom';

const HomePage = () => {
    return (
        <div>
            <div className="button-container">
                    <NavLink to="/add-donation" className="page-button">הוסף תרומה</NavLink>
                    <NavLink to="/dispense-blood" className="page-button">ניפוק דם</NavLink>
                    <NavLink to="/emergency-dispense" className="page-button">ניפוק חירום</NavLink>
            </div>  
        </div>
    );
};

export default HomePage;
