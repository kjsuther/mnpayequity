import { Calendar } from 'lucide-react';
import type { Jurisdiction } from '../lib/supabase';

interface JurisdictionFormProps {
  jurisdiction: Jurisdiction | null;
  onChange: (field: keyof Jurisdiction, value: string | number) => void;
}

export function JurisdictionForm({ jurisdiction, onChange }: JurisdictionFormProps) {
  if (!jurisdiction) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-500 text-center py-8">
          Please select a jurisdiction to view details
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Jurisdiction Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jurisdiction ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={jurisdiction.jurisdiction_id}
            onChange={(e) => onChange('jurisdiction_id', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jurisdiction Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={jurisdiction.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={jurisdiction.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={jurisdiction.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={jurisdiction.state}
              onChange={(e) => onChange('state', e.target.value)}
              maxLength={2}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zipcode
            </label>
            <input
              type="text"
              value={jurisdiction.zipcode}
              onChange={(e) => onChange('zipcode', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={jurisdiction.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fax
          </label>
          <input
            type="tel"
            value={jurisdiction.fax}
            onChange={(e) => onChange('fax', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jurisdiction Type
          </label>
          <select
            value={jurisdiction.jurisdiction_type}
            onChange={(e) => onChange('jurisdiction_type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
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
            value={jurisdiction.next_report_year || ''}
            onChange={(e) => onChange('next_report_year', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Follow Up Type
          </label>
          <select
            value={jurisdiction.follow_up_type}
            onChange={(e) => onChange('follow_up_type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
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
          <div className="relative">
            <input
              type="date"
              value={jurisdiction.follow_up_date || ''}
              onChange={(e) => onChange('follow_up_date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
