'use client';

import { useState } from 'react';

interface CounterProps {
  initial?: number;
}

export default function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div className="p-4 border rounded-lg shadow-sm max-w-sm">
      <h2 className="text-xl font-semibold mb-4">Counter Component</h2>
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setCount(count - 1)}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          -
        </button>
        
        <span className="text-2xl font-bold">{count}</span>
        
        <button
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          +
        </button>
      </div>
      
      <button
        onClick={() => setCount(initial)}
        className="w-full px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Reset to {initial}
      </button>
    </div>
  );
}
