"use client";

import React, { useState, useContext } from 'react';
import { OnboardingContext } from '../layout';

export default function Step2() {
    const { formData, setFormData } = useContext(OnboardingContext);
    const [dragActive, setDragActive] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleInputChange("fileName", e.dataTransfer.files[0].name);
            handleInputChange("fileAttached", true);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleInputChange("fileName", e.target.files[0].name);
            handleInputChange("fileAttached", true);
        }
    };

    return (
        <div className="form-step">
            <div className="form-group">
                <label>Link Social Account (Proof of Audience)</label>
                <button 
                    className="social-btn" 
                    type="button"
                    onClick={() => handleInputChange("socialTwitterConnected", !formData.socialTwitterConnected)}
                >
                    {formData.socialTwitterConnected ? "✓ Twitter / X Connected" : "🔗 Connect Twitter / X"}
                </button>
                <button 
                    className="social-btn" 
                    type="button"
                    onClick={() => handleInputChange("socialGithubConnected", !formData.socialGithubConnected)}
                >
                    {formData.socialGithubConnected ? "✓ GitHub Connected" : "🔗 Connect GitHub"}
                </button>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label>Upload Government ID</label>
                
                <input 
                    type="file" 
                    id="id-upload-input" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                />
                
                <label 
                    htmlFor="id-upload-input"
                    className={`file-upload ${dragActive ? 'dragover' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    style={formData.fileAttached ? {
                        borderColor: "var(--success)",
                        background: "rgba(16, 185, 129, 0.05)"
                    } : {}}
                >
                    {formData.fileAttached ? (
                        <>
                            <div className="file-upload-icon" style={{ background: "var(--success)", color: "white", border: "none" }}>✓</div>
                            <p style={{ color: "var(--success)", fontWeight: 600 }}>{formData.fileName} attached!</p>
                        </>
                    ) : (
                        <>
                            <div className="file-upload-icon">📄</div>
                            <p>Drag & drop your Passport or Driver's License here, or click to upload</p>
                        </>
                    )}
                </label>
            </div>
        </div>
    );
}
