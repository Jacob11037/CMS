// src/app/components/JS InventoryStatus.js
'use client';

export default function InventoryStatus() {
  const inventoryItems = [
    { name: "Blood Tubes", stock: 15, threshold: 20 },
    { name: "Glucose Strips", stock: 5, threshold: 10 },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Inventory Status</h2>
      <div className="space-y-3">
        {inventoryItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>{item.name}</span>
            <span className={`font-medium ${
              item.stock < item.threshold ? "text-red-500" : "text-green-500"
            }`}>
              {item.stock} left
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}