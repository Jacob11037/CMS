// src/app/components/JS LabPendingTests.js
'use client';
import { FiAlertCircle } from 'react-icons/fi';

export default function LabPendingTests() {
  const pendingTests = [
    { id: 1, patient: "John Doe", test: "CBC", priority: "High", date: "2023-10-05" },
    { id: 2, patient: "Jane Smith", test: "Lipid Profile", priority: "Medium", date: "2023-10-05" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <FiAlertCircle className="mr-2 text-red-500" /> Pending Lab Tests
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Test</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingTests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{test.patient}</td>
                <td className="px-4 py-2">{test.test}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    test.priority === "High" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {test.priority}
                  </span>
                </td>
                <td className="px-4 py-2">{test.date}</td>
                <td className="px-4 py-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Start Test
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}