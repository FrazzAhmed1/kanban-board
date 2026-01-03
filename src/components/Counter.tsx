'use client';

import { useState } from 'react';

interface CounterProps {
  initial?: number;
}

export default function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', maxWidth: '300px' }}>
      <h2 style={{ marginBottom: '15px' }}>Counter: {count}</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button 
          onClick={() => setCount(count - 1)}
          style={{ padding: '5px 15px', background: '#f0f0f0', border: '1px solid #ddd' }}
        >
          -
        </button>
        
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{count}</span>
        
        <button 
          onClick={() => setCount(count + 1)}
          style={{ padding: '5px 15px', background: '#f0f0f0', border: '1px solid #ddd' }}
        >
          +
        </button>
      </div>
      
      <button 
        onClick={() => setCount(initial)}
        style={{ padding: '5px 15px', background: '#ff6b6b', color: 'white', border: 'none' }}
      >
        Reset to {initial}
      </button>
    </div>
  );
}
