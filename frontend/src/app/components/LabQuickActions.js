// src/app/components/JS LabQuickActions.js
'use client';
import { FiSearch, FiPrinter, FiClock } from 'react-icons/fi';

export default function LabQuickActions() {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2">
        <button className="bg-blue-100 text-blue-800 p-3 rounded-lg flex flex-col items-center">
          <FiSearch className="mb-1" />
          <span className="text-sm">Search Patient</span>
        </button>
        <button className="bg-green-100 text-green-800 p-3 rounded-lg flex flex-col items-center">
          <FiPrinter className="mb-1" />
          <span className="text-sm">Print Report</span>
        </button>
        <button className="bg-purple-100 text-purple-800 p-3 rounded-lg flex flex-col items-center">
          <FiClock className="mb-1" />
          <span className="text-sm">Test History</span>
        </button>
        <button className="bg-yellow-100 text-yellow-800 p-3 rounded-lg flex flex-col items-center">
          <span className="text-sm">Add Result</span>
        </button>
      </div>
    </div>
  );
}