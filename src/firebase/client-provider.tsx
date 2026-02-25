'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './init';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * @fileOverview Strategic Firebase Client Provider.
 * Ensures Firebase is initialized only once on the client side.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); 

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
