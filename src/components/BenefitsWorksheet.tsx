import { useState, useEffect } from 'react';
import { AlertCircle, Calculator, CheckCircle } from 'lucide-react';
import { JobClassification, BenefitsWorksheet as BenefitsWorksheetType } from '../lib/supabase';

type BenefitsWorksheetProps = {
  jobs: JobClassification[];
  worksheetData: BenefitsWorksheetType | null;
  onSave: (data: Partial<BenefitsWorksheetType>) => Promise<void>;
};

type BenefitsByClass = {
  [jobId: string]: {
    jobTitle: string;
    points: number;
    males: number;
    females: number;
    employerContribution: number;
  };
};

export function BenefitsWorksheet({ jobs, worksheetData, onSave }: BenefitsWorksheetProps) {
  const [benefitsByClass, setBenefitsByClass] = useState<BenefitsByClass>({});
  const [lowestPoints, setLowestPoints] = useState(0);
  const [highestPoints, setHighestPoints] = useState(0);
  const [pointRange, setPointRange] = useState(0);
  const [comparableValueRange, setComparableValueRange] = useState(0);
  const [triggerDetected, setTriggerDetected] = useState(false);
  const [triggerExplanation, setTriggerExplanation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (jobs.length > 0) {
      const points = jobs.map(j => j.points);
      const low = Math.min(...points);
      const high = Math.max(...points);
      const range = high - low;
      const cvRange = Math.round(range * 0.1);

      setLowestPoints(low);
      setHighestPoints(high);
      setPointRange(range);
      setComparableValueRange(cvRange);
    }

    if (worksheetData?.benefits_data) {
      setBenefitsByClass(worksheetData.benefits_data);
      setTriggerDetected(worksheetData.trigger_detected);
      setTriggerExplanation(worksheetData.trigger_explanation || '');
    }
  }, [jobs, worksheetData]);

  useEffect(() => {
    checkForTrigger();
  }, [benefitsByClass, comparableValueRange]);

  const updateBenefit = (jobId: string, contribution: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setBenefitsByClass({
      ...benefitsByClass,
      [jobId]: {
        jobTitle: job.title,
        points: job.points,
        males: job.males,
        females: job.females,
        employerContribution: contribution,
      },
    });
  };

  const checkForTrigger = () => {
    const femaleClasses = jobs.filter(j => j.females > 0 && j.males === 0);
    const maleClasses = jobs.filter(j => j.males > 0 && j.females === 0);

    let hasDisadvantage = false;
    let explanation = '';

    for (const femaleJob of femaleClasses) {
      const femaleContribution = benefitsByClass[femaleJob.id]?.employerContribution || 0;

      for (const maleJob of maleClasses) {
        const maleContribution = benefitsByClass[maleJob.id]?.employerContribution || 0;

        const pointDiff = Math.abs(femaleJob.points - maleJob.points);

        if (pointDiff <= comparableValueRange && femaleContribution < maleContribution) {
          hasDisadvantage = true;
          explanation += `${femaleJob.title} (${femaleJob.points} points, $${femaleContribution}/mo) receives less than ${maleJob.title} (${maleJob.points} points, $${maleContribution}/mo). `;
        }
      }
    }

    setTriggerDetected(hasDisadvantage);
    setTriggerExplanation(explanation);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        lowest_points: lowestPoints,
        highest_points: highestPoints,
        point_range: pointRange,
        comparable_value_range: comparableValueRange,
        trigger_detected: triggerDetected,
        trigger_explanation: triggerExplanation,
        benefits_data: benefitsByClass,
      });
      alert('Benefits worksheet saved successfully');
    } catch (error) {
      console.error('Error saving benefits worksheet:', error);
      alert('Error saving benefits worksheet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Health Insurance Benefits Worksheet
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter the employer's monthly contribution for health insurance for each job class</li>
                <li>For part-time employees, calculate the contribution per hour and multiply by 173.3</li>
                <li>The system will automatically detect if any female class is at a disadvantage</li>
                <li>If a trigger is detected, benefits must be added to all maximum salaries</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lowest Points
            </label>
            <div className="text-2xl font-bold text-gray-900">{lowestPoints}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Highest Points
            </label>
            <div className="text-2xl font-bold text-gray-900">{highestPoints}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Point Range
            </label>
            <div className="text-2xl font-bold text-gray-900">{pointRange}</div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-yellow-700" />
            <span className="font-semibold text-yellow-900">Comparable Value Range (10%):</span>
            <span className="text-xl font-bold text-yellow-900">±{comparableValueRange} points</span>
          </div>
          <p className="text-sm text-yellow-800">
            Female classes are comparable to male classes if within {comparableValueRange} points above or below
          </p>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Job Title</th>
                <th className="text-center py-3 px-3 font-semibold text-gray-700">Points</th>
                <th className="text-center py-3 px-3 font-semibold text-gray-700">Males</th>
                <th className="text-center py-3 px-3 font-semibold text-gray-700">Females</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Employer Contribution (Monthly)</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{job.title}</td>
                  <td className="text-center py-3 px-3">{job.points}</td>
                  <td className="text-center py-3 px-3">{job.males}</td>
                  <td className="text-center py-3 px-3">{job.females}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-gray-600">$</span>
                      <input
                        type="number"
                        value={benefitsByClass[job.id]?.employerContribution || 0}
                        onChange={(e) => updateBenefit(job.id, parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-right"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {triggerDetected ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Benefits Disadvantage Detected</h4>
                <p className="text-sm text-red-800 mb-2">
                  One or more female classes receive less health insurance contribution than male classes of comparable value.
                </p>
                <p className="text-sm text-red-800 font-medium mb-2">
                  You must add the employer's health insurance contribution to the maximum monthly salary for ALL job classes.
                </p>
                <div className="text-sm text-red-800 bg-white rounded p-3 mt-3">
                  <p className="font-semibold mb-1">Explanation:</p>
                  <p>{triggerExplanation}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">No Benefits Disadvantage Detected</h4>
                <p className="text-sm text-green-800">
                  All female classes of comparable value receive equal or greater health insurance contributions than male classes.
                  No adjustments to maximum salaries are required.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Worksheet'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Calculation Help</h4>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-medium">For hourly employees:</p>
            <p className="text-gray-600 ml-4">Annual contribution ÷ 2080 hours = hourly rate</p>
            <p className="text-gray-600 ml-4">Hourly rate × 173.3 = monthly contribution</p>
          </div>
          <div>
            <p className="font-medium">For annual salary employees:</p>
            <p className="text-gray-600 ml-4">Annual contribution ÷ 12 months = monthly contribution</p>
          </div>
          <div>
            <p className="font-medium">For part-time employees:</p>
            <p className="text-gray-600 ml-4">Calculate based on hours worked</p>
            <p className="text-gray-600 ml-4">Then convert to full-time equivalent (× 173.3)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
