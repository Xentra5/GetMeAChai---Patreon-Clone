"use client";

import React from 'react';

export default function Step4() {
    return (
        <div className="form-step">
            <div className="dashboard-state">
                <div className="success-icon">✓</div>
                <h2>Review in Progress</h2>
                <p>Your application has been securely encrypted and submitted to our compliance team.</p>
                <p style={{ marginTop: '15px', color: 'var(--accent-primary)', fontWeight: 500 }}>
                    Expected completion: 1 to 24 hours.
                </p>
            </div>
        </div>
    );
}
