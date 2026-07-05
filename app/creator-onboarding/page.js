"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorOnboardingRoot() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/creator-onboarding/step1');
    }, [router]);

    return (
        <div style={{ color: 'white', textAlign: 'center', fontFamily: 'sans-serif', marginTop: '20vh' }}>
            <p>Loading creator onboarding...</p>
        </div>
    );
}
