// Create src/components/DatabaseTest.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DatabaseTest = () => {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    const testDb = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('count(*)')
          .single();

        if (error) {
          setStatus(`❌ Database Error: ${error.message}`);
        } else {
          setStatus('✅ Database Connected Successfully!');
        }
      } catch (err) {
        setStatus(`❌ Connection Failed: ${err}`);
      }
    };
    testDb();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <strong>DB Status:</strong> {status}
    </div>
  );
};