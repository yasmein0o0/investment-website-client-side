// hooks/useAuthCheck.js - FIXED for Strict Mode
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshTokenThunk } from '../redux/refresh.js';

export const useAuthCheck = () => {
    const dispatch = useDispatch();
    const { accessToken, shouldRefresh, refreshAttempted } = useSelector(state => state.accessToken);

    // ✅ Use a ref to track if we've already attempted refresh
    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        if (!hasAttemptedRef.current && !accessToken && shouldRefresh && !refreshAttempted) {
            hasAttemptedRef.current = true;
            console.log('useAuthCheck: Attempting token refresh...');
            dispatch(refreshTokenThunk());
        }
    }, [accessToken, shouldRefresh, refreshAttempted, dispatch]);

    return { hasToken: !!accessToken };
};