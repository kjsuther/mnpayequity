import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Jurisdiction } from '../lib/supabase';

interface AddJurisdictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jurisdictionData: Partial<Jurisdiction>) => Promise<void>;
}

export function AddJurisdictionModal({ isOpen, onClose, onSave }: AddJurisdictionModalProps) {
  const [formData, setFormData] = useState<Partial<Jurisdiction>>({
    jurisdiction_id: '',
    name: '',
    address: '',
    city: '',
    state: 'MN',
    zipcode: '',
    phone: '',
    fax: '',
    jurisdiction_type: '',
    next_report_year: undefined,
    follow_up_type: '',
    follow_up_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.jurisdiction_id?.trim()) {
      newErrors.jurisdiction_id = 'Jurisdiction ID is required';
    }
    if (!formData.name?.trim()) {
      newErrors.name = 'Jurisdiction Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving jurisdiction:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      jurisdiction_id: '',
      name: '',
      address: '',
      city: '',
      state: 'MN',
      zipcode: '',
      phone: '',
      fax: '',
      jurisdiction_type: '',
      next_report_year: undefined,
      follow_up_type: '',
      follow_up_date: '',
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: keyof Jurisdiction, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Jurisdiction</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jurisdiction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jurisdiction_id || ''}
                onChange={(e) => handleChange('jurisdiction_id', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent ${
                  errors.jurisdiction_id ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={isSaving}
              />
              {errors.jurisdiction_id && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.jurisdiction_id}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jurisdiction Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={isSaving}
              />
              {errors.name && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  maxLength={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zipcode
                </label>
                <input
                  type="text"
                  value={formData.zipcode || ''}
                  onChange={(e) => handleChange('zipcode', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fax
              </label>
              <input
                type="tel"
                value={formData.fax || ''}
                onChange={(e) => handleChange('fax', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jurisdiction Type
              </label>
              <select
                value={formData.jurisdiction_type || ''}
                onChange={(e) => handleChange('jurisdiction_type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                disabled={isSaving}
              >
                <option value="">Select a type</option>
                <option value="CITY - City">CITY - City</option>
                <option value="CTY - County">CTY - County</option>
                <option value="HCF - Health Care Facility">HCF - Health Care Facility</option>
                <option value="HRA - Housing and Redevelopment Authority">HRA - Housing and Redevelopment Authority</option>
                <option value="ISD - School">ISD - School</option>
                <option value="OTH - Other">OTH - Other</option>
                <option value="SWCD - Soil and Water Conservation District">SWCD - Soil and Water Conservation District</option>
                <option value="TOWN - Township">TOWN - Township</option>
                <option value="UTL - Utility">UTL - Utility</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Report Year
              </label>
              <input
                type="number"
                value={formData.next_report_year || ''}
                onChange={(e) => handleChange('next_report_year', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow Up Type
              </label>
              <select
                value={formData.follow_up_type || ''}
                onChange={(e) => handleChange('follow_up_type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                disabled={isSaving}
              >
                <option value="">Select type...</option>
                <option value="Completed">Completed</option>
                <option value="90 Day">90 Day</option>
                <option value="60 Day">60 Day</option>
                <option value="30 Day">30 Day</option>
                <option value="Penalty Notice">Penalty Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow Up Date
              </label>
              <input
                type="date"
                value={formData.follow_up_date || ''}
                onChange={(e) => handleChange('follow_up_date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#78BE21] text-white rounded hover:bg-[#6ba91d] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Add Jurisdiction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
