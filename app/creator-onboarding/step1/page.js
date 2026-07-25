"use client";
import React, { useContext, useState } from 'react';
import { OnboardingContext } from '../layout';

export default function Step1() {
    const { formData, setFormData } = useContext(OnboardingContext);
    const [codeSent, setCodeSent] = useState(false);
    const [sending, setSending] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const [phoneError, setPhoneError] = useState("");

    const handleSendCode = () => {
        setPhoneError("");
        if (!formData.phone || !formData.phone.trim()) {
            setPhoneError("Please enter a valid phone number first.");
            return;
        }
        setSending(true);
        setTimeout(() => {
            setSending(false);
            setCodeSent(true);
        }, 1000);
    };

    return (
        <div className="form-step">
            <div className="form-group">
                <label>Legal Full Name <span style={{ color: "var(--accent-primary, #e11d48)" }}>*</span></label>
                <input 
                    type="text" 
                    placeholder="As it appears on your ID" 
                    value={formData.fullName || ""}
                    onChange={e => handleInputChange("fullName", e.target.value)}
                    required 
                />
            </div>
            <div className="form-group">
                <label>Date of Birth <span style={{ color: "var(--accent-primary, #e11d48)" }}>*</span></label>
                <input 
                    type="date" 
                    value={formData.dob || ""}
                    onChange={e => handleInputChange("dob", e.target.value)}
                    required 
                />
            </div>
            <div className="form-group">
                <label>Phone Verification <span style={{ color: "var(--accent-primary, #e11d48)" }}>*</span></label>
                <div className="otp-row">
                    <input 
                        type="text" 
                        placeholder="+1 (555) 000-0000" 
                        value={formData.phone || ""}
                        onChange={e => handleInputChange("phone", e.target.value)}
                        required 
                    />
                    <button 
                        className="btn btn-outline" 
                        type="button"
                        onClick={handleSendCode}
                        disabled={sending}
                        style={codeSent ? { borderColor: "var(--success, #10b981)", color: "var(--success, #10b981)" } : {}}
                    >
                        {sending ? "Sending..." : codeSent ? "✓ Code Sent" : "Send Code"}
                    </button>
                </div>
                {phoneError && (
                    <p style={{ color: "#fda4af", fontSize: "0.8rem", marginTop: "6px" }}>
                        ⚠️ {phoneError}
                    </p>
                )}
                {codeSent && (
                    <p style={{ color: "var(--success, #10b981)", fontSize: "0.8rem", marginTop: "6px" }}>
                        Verification SMS sent to {formData.phone}. Enter code when received.
                    </p>
                )}
            </div>
        </div>
    );
}

