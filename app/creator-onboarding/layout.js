"use client";

import React, { createContext, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import './onboarding.css';

// Create the Context to share state across steps
export const OnboardingContext = createContext();

export default function OnboardingLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    // Onboarding form state
    const [formData, setFormData] = useState({
        fullName: "",
        dob: "",
        phone: "",
        socialTwitterConnected: false,
        socialGithubConnected: false,
        fileName: "",
        fileAttached: false,
        payoutMethod: "stripe",
        payoutDetails: "",
        agreedTerms: false
    });

    // Determine current step index based on current URL path
    let currentStep = 1;
    if (pathname.includes('/step2')) {
        currentStep = 2;
    } else if (pathname.includes('/step3')) {
        currentStep = 3;
    } else if (pathname.includes('/step4')) {
        currentStep = 4;
    }

    const totalSteps = 4;
    const isSuccessStep = currentStep === 4;

    // Calculate percentage based on current step
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState("");

    const validateCurrentStep = () => {
        setValidationError("");
        if (currentStep === 1) {
            if (!formData.fullName || !formData.fullName.trim()) {
                setValidationError("Legal Full Name is mandatory.");
                return false;
            }
            if (!formData.dob || !formData.dob.trim()) {
                setValidationError("Date of Birth is mandatory.");
                return false;
            }
            if (!formData.phone || !formData.phone.trim()) {
                setValidationError("Phone Verification number is mandatory.");
                return false;
            }
        } else if (currentStep === 2) {
            if (!formData.socialTwitterConnected && !formData.socialGithubConnected && !formData.fileAttached) {
                setValidationError("Mandatory: Please link Twitter/GitHub account or upload Government ID.");
                return false;
            }
        } else if (currentStep === 3) {
            if (!formData.payoutDetails || !formData.payoutDetails.trim()) {
                setValidationError("Payout Account Details are mandatory.");
                return false;
            }
            if (!formData.agreedTerms) {
                setValidationError("You must agree to the Creator Terms of Service to proceed.");
                return false;
            }
        }
        return true;
    };

    const handleContinue = async (e) => {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }

        if (currentStep === 3) {
            // Submit onboarding data to API
            setSubmitting(true);
            try {
                const response = await fetch('/api/creator-onboarding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const resData = await response.json();
                if (response.ok) {
                    router.push('/creator-onboarding/step4');
                } else {
                    setValidationError(resData.error || "Failed to submit onboarding data.");
                }
            } catch (err) {
                console.error("Submission error:", err);
                setValidationError("Network error submitting onboarding. Please try again.");
            } finally {
                setSubmitting(false);
            }
        } else if (currentStep < totalSteps) {
            router.push(`/creator-onboarding/step${currentStep + 1}`);
        }
    };

    return (
        <OnboardingContext.Provider value={{ formData, setFormData }}>
            <div className="onboarding-body">
                <div className="wizard-container">
                    {/* Header: Hidden on success step */}
                    {!isSuccessStep && (
                        <div className="header" id="wizard-header">
                            <h1>Creator Onboarding</h1>
                            <p>Securely verify your identity and set up payouts.</p>
                        </div>
                    )}

                    {/* Progress Indicators: Hidden on success step */}
                    {!isSuccessStep && (
                        <div className="progress-wrapper" id="progress-wrapper">
                            <div className="progress-track">
                                <div 
                                    className="progress-fill" 
                                    id="progress-fill" 
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className={`step-indicator ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>1</div>
                            <div className={`step-indicator ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>2</div>
                            <div className={`step-indicator ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>3</div>
                            <div className={`step-indicator ${currentStep === 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>✓</div>
                        </div>
                    )}

                    {/* Validation error display */}
                    {validationError && (
                        <div style={{
                            background: "rgba(225, 29, 72, 0.15)",
                            border: "1px solid #e11d48",
                            color: "#fda4af",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            marginBottom: "15px",
                            fontSize: "0.85rem",
                            textAlign: "center"
                        }}>
                            ⚠ {validationError}
                        </div>
                    )}

                    {/* Individual page form contents */}
                    {children}

                    {/* Footer Controls: Hidden on success step */}
                    {!isSuccessStep && (
                        <div className="wizard-footer" id="wizard-footer">
                            {currentStep > 1 ? (
                                <Link 
                                    href={`/creator-onboarding/step${currentStep - 1}`} 
                                    className="btn btn-prev"
                                    onClick={() => setValidationError("")}
                                >
                                    Back
                                </Link>
                            ) : (
                                <span className="btn btn-prev" style={{ visibility: 'hidden' }}>Back</span>
                            )}

                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={submitting}
                                className="btn btn-next"
                            >
                                {submitting ? "Submitting..." : currentStep === 3 ? 'Securely Submit' : 'Continue'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </OnboardingContext.Provider>
    );
}
