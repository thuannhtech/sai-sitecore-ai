'use client';

import React, { useEffect, useState } from 'react';
import { useOrderCloud } from '@/providers/OrderCloudProvider';
import { Me } from '@/lib/ordercloud';

export const TailstoreConnectivityTest: React.FC = () => {
  const { isAuthenticated, token } = useOrderCloud();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      if (isAuthenticated && token) {
        try {
          const me = await Me.Get();
          setData(me);
        } catch (err: any) {
          setError(err.message || 'Unknown error');
          console.error('OrderCloud Test Failed:', err);
        }
      }
    };

    testConnection();
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
        ⏳ Connecting to OrderCloud...
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-md border border-gray-200 mt-4">
      <h3 className="text-lg font-bold mb-2 text-blue-600">OrderCloud Connectivity Status</h3>
      {error ? (
        <div className="text-red-500">❌ Error: {error}</div>
      ) : data ? (
        <div className="text-green-600">
          ✅ Connected successfully! 
          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify({ 
              username: data.Username, 
              company: data.Buyer?.Name || 'Anonymous Buyer' 
            }, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="text-gray-500 italic">Fetching user data...</div>
      )}
    </div>
  );
};
