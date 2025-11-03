import { BookOpen, Calculator, Users, DollarSign, Award, Clock } from 'lucide-react';

type JobDataEntryHelpProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function JobDataEntryHelp({ isOpen, onClose }: JobDataEntryHelpProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-[#003865]" />
              <h2 className="text-2xl font-bold text-gray-900">Job Data Entry Field Guide</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Title</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The official title of the job classification as used by your jurisdiction.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Examples:</p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Administrative Assistant</li>
                    <li>• Police Officer</li>
                    <li>• Public Works Director</li>
                    <li>• Library Technician</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Counts (Males, Females, Non-binary)</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The number of employees in each gender category for this job class. Only count employees who meet the minimum work requirements (67+ days/year and 14+ hours/week, or 100+ days for students).
                </p>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm">
                  <p className="font-medium text-amber-900 mb-1">Important:</p>
                  <p className="text-amber-800">
                    A job class is considered "male-dominated" if 70% or more are male, "female-dominated" if 70% or more are female, and "balanced" otherwise.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Evaluation Points</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The total points assigned to this job classification based on your jurisdiction's job evaluation system. Points should reflect the skill, effort, responsibility, and working conditions required for the job.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Point Range Guidelines:</p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Entry-level positions: Typically 100-300 points</li>
                    <li>• Mid-level positions: Typically 300-600 points</li>
                    <li>• Management positions: Typically 600-1000+ points</li>
                  </ul>
                  <p className="text-gray-600 mt-2 italic">
                    Note: Actual ranges vary by jurisdiction and evaluation system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Minimum and Maximum Salary</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The lowest and highest monthly salary amounts for this job classification. Enter as monthly amounts, not annual.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                  <div>
                    <p className="font-medium text-gray-900">For Hourly Employees:</p>
                    <p className="text-gray-700">Convert to monthly: (Hourly Rate × Hours per Week × 52 weeks) ÷ 12 months</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mt-2">Example:</p>
                    <p className="text-gray-700">$20/hour × 40 hours/week × 52 weeks = $41,600/year ÷ 12 = $3,467/month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Years to Maximum Salary</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The number of years it takes an employee to progress from minimum to maximum salary through normal step increases or merit raises.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Calculation Example:</p>
                  <p className="text-gray-700">
                    If there are 10 steps with annual increases: Years to Max = 10 years
                    <br />
                    If there are 6 steps with biennial increases: Years to Max = 12 years
                    <br />
                    If there's no step system: Enter 0
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Exceptional Service Pay (ESP)</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Additional compensation beyond regular salary for longevity, special skills, or exceptional performance. Select the category if this job class receives ESP.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Common ESP Categories:</p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Longevity Pay: Based on years of service</li>
                    <li>• Certification Pay: For professional certifications</li>
                    <li>• Shift Differential: For non-standard hours</li>
                    <li>• Bilingual Pay: For language skills</li>
                    <li>• Education Pay: For advanced degrees</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits Included in Salary</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The monthly cash value of employer-provided benefits if your jurisdiction includes benefits in pay equity calculations. This is optional.
                </p>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                  <p className="font-medium text-blue-900 mb-1">Typical Monthly Benefit Values:</p>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Health Insurance: $500-$1,500/month</li>
                    <li>• Dental Insurance: $50-$100/month</li>
                    <li>• Life Insurance: $20-$50/month</li>
                    <li>• Retirement (employer match): Varies by percentage</li>
                  </ul>
                  <p className="text-blue-700 mt-2">
                    Check with your HR department for exact values used by your jurisdiction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-3">Tips for Accurate Data Entry</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Double-check all salary amounts are monthly, not annual</li>
              <li>✓ Verify employee counts include only eligible employees</li>
              <li>✓ Use consistent point values from your approved job evaluation system</li>
              <li>✓ Round monetary values to the nearest cent</li>
              <li>✓ Review each entry before saving to catch typos</li>
              <li>✓ Save frequently to avoid losing your work</li>
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
