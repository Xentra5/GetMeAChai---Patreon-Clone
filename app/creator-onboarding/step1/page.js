"use client";
import { useContext } from 'react';
import { OnboardingContext } from '../layout';
import React from 'react';

export default function Step1() {
    const { formData, setFormData } = useContext(OnboardingContext);
    return (
        <input
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
        />
    );

    return (
        <div className="form-step">
            <div className="form-group">
                <label>Legal Full Name</label>
                <input type="text" placeholder="As it appears on your ID" required />
            </div>
            <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" required />
            </div>
            <div className="form-group">
                <label>Phone Verification</label>
                <div className="otp-row">
                    <input type="text" placeholder="+1 (555) 000-0000" required />
                    <button className="btn btn-outline" type="button">Send Code</button>
                </div>
            </div>
        </div>
    );
}
