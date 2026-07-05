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

    const handleContinue = (e) => {
        if (currentStep < totalSteps) {
            e.preventDefault();
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

                    {/* Individual page form contents */}
                    {children}

                    {/* Footer Controls: Hidden on success step */}
                    {!isSuccessStep && (
                        <div className="wizard-footer" id="wizard-footer">
                            {currentStep > 1 ? (
                                <Link 
                                    href={`/creator-onboarding/step${currentStep - 1}`} 
                                    className="btn btn-prev"
                                >
                                    Back
                                </Link>
                            ) : (
                                <span className="btn btn-prev" style={{ visibility: 'hidden' }}>Back</span>
                            )}

                            <Link 
                                href={`/creator-onboarding/step${currentStep + 1}`}
                                onClick={handleContinue}
                                className="btn btn-next"
                            >
                                {currentStep === 3 ? 'Securely Submit' : 'Continue'}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </OnboardingContext.Provider>
    );
}
