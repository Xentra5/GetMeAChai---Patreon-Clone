"use client";

import React, { useContext } from 'react';
import { OnboardingContext } from '../layout';

export default function Step1() {
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
                <label>Legal Full Name</label>
                <input 
                    type="text" 
                    placeholder="As it appears on your ID" 
                    value={formData.fullName || ""}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required 
                />
            </div>
            <div className="form-group">
                <label>Date of Birth</label>
                <input 
                    type="date" 
                    value={formData.dob || ""}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    required 
                />
            </div>
            <div className="form-group">
                <label>Phone Verification</label>
                <div className="otp-row">
                    <input 
                        type="text" 
                        placeholder="+1 (555) 000-0000" 
                        value={formData.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required 
                    />
                    <button className="btn btn-outline" type="button">Send Code</button>
                </div>
            </div>
        </div>
    );
}
