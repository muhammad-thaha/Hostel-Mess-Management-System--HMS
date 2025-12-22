
import React, { useState } from 'react';
import { User, MessResource } from '../types';
import { MOCK_RESOURCES } from '../constants';
import { Package, Plus, Search, AlertCircle, TrendingDown, Clock } from 'lucide-react';

interface InventoryProps {
  user: User;
}

const Inventory: React.FC<InventoryProps> = ({ user }) => {
  const [resources, setResources] = useState<MessResource[]>(MOCK_RESOURCES);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resource Tracking</h2>
          <p className="text-gray-500">Monitor mess supplies and consumption levels.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
          <Plus size={18} />
          <span className="font-semibold text-sm">Add New Resource</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Categories</p>
            <p className="text-xl font-bold text-gray-900">12 Items</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Low Stock Alerts</p>
            <p className="text-xl font-bold text-red-600">03 Critical</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Est. Consumption</p>
            <p className="text-xl font-bold text-gray-900">₹14.2k <span className="text-xs text-gray-400 font-normal">/day</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter resources..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-white">Monthly Usage</button>
            <button className="px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-100 bg-blue-50 rounded-lg">Real-time Stock</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Resource Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.map((res) => {
                const isLow = res.quantity <= res.threshold;
                const percentage = Math.min((res.quantity / (res.threshold * 4)) * 100, 100);
                
                return (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-900">{res.name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">{res.category}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-gray-800">{res.quantity} {res.unit}</p>
                        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isLow ? 'Critical Stock' : 'Stable Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={12} className="mr-1.5" />
                        {res.lastUpdated}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">
                        Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
