
import React, { useState, useEffect } from 'react';
import { User, MessResource } from '../types';
import { Package, Plus, Search, AlertCircle, TrendingDown, Clock, Trash2, X, FileText, Sparkles, BrainCircuit, AlertTriangle, AlertOctagon, Check } from 'lucide-react';
import { UserRole } from '../types';

interface InventoryProps {
  user: User;
}

interface ResourceFormData {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  threshold: string;
  pricePerUnit: string;
  monthlyUsage: string;
}

const initialFormData: ResourceFormData = {
  name: '',
  category: 'Groceries',
  quantity: '',
  unit: 'kg',
  threshold: '',
  pricePerUnit: '',
  monthlyUsage: ''
};

const Inventory: React.FC<InventoryProps> = ({ user }) => {
  const [resources, setResources] = useState<MessResource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'stock' | 'usage'>('stock');
  const [predictions, setPredictions] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  const isManager = user.role === UserRole.CHAIRMAN_SECRETARY || user.role === UserRole.WARDEN_MATREN;

  const fetchResources = () => {
    fetch('/api/resources')
      .then((res) => res.json())
      .then((data) => setResources(data))
      .catch((err) => console.error("Failed to fetch resources", err));
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const resourceData = {
      ...formData,
      quantity: Number(formData.quantity) || 0,
      threshold: Number(formData.threshold) || 0,
      pricePerUnit: Number(formData.pricePerUnit) || 0,
      monthlyUsage: Number(formData.monthlyUsage) || 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    try {
      if (editingId) {
        await fetch(`/api/resources/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourceData)
        });
      } else {
        await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourceData)
        });
      }
      fetchResources();
      closeModal();
    } catch (error) {
      console.error("Error saving resource:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await fetch(`/api/resources/${id}`, {
          method: 'DELETE'
        });
        fetchResources();
      } catch (error) {
        console.error("Error deleting resource:", error);
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (resource: MessResource) => {
    setEditingId(resource._id || resource.id);
    setFormData({
      name: resource.name,
      category: resource.category,
      quantity: String(resource.quantity),
      unit: resource.unit,
      threshold: String(resource.threshold),
      pricePerUnit: String(resource.pricePerUnit || ''),
      monthlyUsage: String(resource.monthlyUsage || '')
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  // Calculated metrics
  const totalCategories = new Set(resources.map(r => r.category)).size;
  const lowStockCount = resources.filter(r => r.quantity <= r.threshold).length;
  // Estimate daily consumption cost: (Monthly Consumption * Price) / 30
  const monthlyTotalCost = resources.reduce((acc, curr) => acc + ((curr.monthlyUsage || 0) * (curr.pricePerUnit || 0)), 0);
  const dailyEstCost = (monthlyTotalCost / 30).toFixed(0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resource Tracking</h2>
          <p className="text-gray-500">Monitor mess supplies and {viewMode === 'usage' ? 'monthly consumption' : 'stock levels'}.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
        >
          <Plus size={18} />
          <span className="font-semibold text-sm">Add New Resource</span>
        </button>
      </div>

      {/* Predictive Analysis Section - Only for Managers */}
      {isManager && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          {/* Decorative bg elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black flex items-center mb-2">
                  <Sparkles className="mr-2 text-indigo-400" size={20} />
                  AI Stock Predictor
                </h3>
                <p className="text-indigo-200 text-sm max-w-lg">
                  Our advanced AI analyzes your upcoming menu and current stock levels to predict potential shortages before they happen.
                </p>
              </div>
              <button
                onClick={async () => {
                  setPredictions(null);
                  setPredicting(true);
                  try {
                    const res = await fetch('/api/ai/predict-inventory?type=upcoming', { method: 'POST' });
                    const data = await res.json();
                    setPredictions(data);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setPredicting(false);
                  }
                }}
                disabled={predicting}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/50 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {predicting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <BrainCircuit size={18} />}
                <span>{predicting ? 'Analyzing...' : 'Run Analysis'}</span>
              </button>
            </div>

            {/* Prediction Results */}
            {predictions && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4">
                {predictions.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-bold text-red-300 flex items-center text-sm uppercase tracking-wider">
                      <AlertTriangle size={16} className="mr-2" />
                      Risks Detected
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {predictions.map((p: any, idx: number) => (
                        <div key={idx} className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
                          <div className="mt-1">
                            {p.urgency === 'High' ? <AlertOctagon size={18} className="text-red-400" /> : <AlertTriangle size={18} className="text-orange-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{p.item}</p>
                            <p className="text-xs text-red-100 mt-1">{p.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-emerald-300 gap-3 p-2">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <Check size={20} />
                    </div>
                    <div>
                      <p className="font-bold">All Clear!</p>
                      <p className="text-xs text-emerald-100">Inventory levels look sufficient for the upcoming menu.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Categories</p>
            <p className="text-xl font-bold text-gray-900">{totalCategories} Categories</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Low Stock Alerts</p>
            <p className="text-xl font-bold text-red-600">{lowStockCount < 10 ? `0${lowStockCount}` : lowStockCount} Critical</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Est. Consumption</p>
            <p className="text-xl font-bold text-gray-900">₹{dailyEstCost} <span className="text-xs text-gray-400 font-normal">/day</span></p>
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
            <button
              onClick={() => setViewMode('usage')}
              className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition-colors ${viewMode === 'usage'
                ? 'text-blue-600 border-blue-100 bg-blue-50'
                : 'text-gray-600 border-gray-200 hover:bg-white'
                }`}
            >
              Monthly Usage
            </button>
            <button
              onClick={() => setViewMode('stock')}
              className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition-colors ${viewMode === 'stock'
                ? 'text-blue-600 border-blue-100 bg-blue-50'
                : 'text-gray-600 border-gray-200 hover:bg-white'
                }`}
            >
              Real-time Stock
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Resource Name</th>
                <th className="px-6 py-4">Category</th>
                {viewMode === 'stock' ? (
                  <>
                    <th className="px-6 py-4">Current Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Updated</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4">Monthly Usage</th>
                    <th className="px-6 py-4">Price / Unit</th>
                    <th className="px-6 py-4">Total Cost</th>
                  </>
                )}
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.map((res) => {
                const isLow = res.quantity <= res.threshold;
                const percentage = Math.min((res.quantity / (res.threshold * 4)) * 100, 100);
                const totalCost = ((res.monthlyUsage || 0) * (res.pricePerUnit || 0)).toLocaleString();

                return (
                  <tr key={res._id || res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-900">{res.name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">{res.category}</span>
                    </td>

                    {viewMode === 'stock' ? (
                      <>
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
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
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-2">
                            <TrendingDown size={14} className="text-blue-500" />
                            <p className="text-sm font-bold text-gray-800">{res.monthlyUsage} {res.unit}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-gray-600">₹{res.pricePerUnit} / {res.unit}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-gray-900">₹{totalCost}</p>
                        </td>
                      </>
                    )}

                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(res)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(res._id || res.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Update Resource' : 'Add New Resource'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Resource Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Rice, Milk..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Spices">Spices</option>
                  <option value="Meat & Eggs">Meat & Eggs</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="kg, L..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Low Stock Threshold</label>
                <input
                  type="number"
                  name="threshold"
                  required
                  min="0"
                  value={formData.threshold}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Alert when below..."
                />
              </div>

              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-xs font-bold text-blue-600 mb-3 uppercase tracking-wider">Usage & Cost Data</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monthly Usage</label>
                    <input
                      type="number"
                      name="monthlyUsage"
                      min="0"
                      value={formData.monthlyUsage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Avg usage"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price / Unit (₹)</label>
                    <input
                      type="number"
                      name="pricePerUnit"
                      min="0"
                      value={formData.pricePerUnit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cost"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (editingId ? 'Update Resource' : 'Add Resource')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
