import { RootState } from '@/Redux/store';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';


export const useHeader = () => {
    const router = useRouter();
    // Selectors
    const userDetails: any = useSelector((state: RootState) => state.auth);
    console.log('useSettings, useHeader method use details', userDetails);

    // Actions
    const goBack = useCallback(() => router.back(), [router]);

    // Return exactly what the View needs
    return {
        userDetails,
        goBack,
    };
};