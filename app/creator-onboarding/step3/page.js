"use client";

import React, { useContext } from 'react';
import { OnboardingContext } from '../layout';

export default function Step3() {
    const { formData, setFormData } = useContext(OnboardingContext);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="form-step">
            <div className="form-group">
                <label>Payout Method</label>
                <select 
                    value={formData.payoutMethod || "stripe"}
                    onChange={(e) => handleInputChange("payoutMethod", e.target.value)}
                >
                    <option value="stripe">Stripe (Direct Bank Transfer)</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">USDC Crypto Wallet</option>
                </select>
            </div>
            <div className="form-group">
                <label>Account Details</label>
                <input 
                    type="text" 
                    placeholder="Enter email or wallet address" 
                    value={formData.payoutDetails || ""}
                    onChange={(e) => handleInputChange("payoutDetails", e.target.value)}
                    required 
                />
            </div>
            
            <div className="checkbox-group">
                <input 
                    type="checkbox" 
                    id="terms" 
                    checked={formData.agreedTerms || false}
                    onChange={(e) => handleInputChange("agreedTerms", e.target.checked)}
                    required 
                />
                <label htmlFor="terms">
                    I agree to the Creator Terms of Service. I confirm that I am at least 18 years old, and my data will be securely processed for KYC compliance.
                </label>
            </div>
        </div>
    );
}
