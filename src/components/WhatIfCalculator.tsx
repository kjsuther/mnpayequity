import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { JobClassification } from '../lib/supabase';
import { analyzeCompliance, ComplianceResult } from '../lib/complianceAnalysis';

type WhatIfCalculatorProps = {
  jobs: JobClassification[];
  currentResult: ComplianceResult;
  onClose: () => void;
};

type JobAdjustment = {
  jobId: string;
  originalMaxSalary: number;
  adjustedMaxSalary: number;
  adjustment: number;
  adjustmentPercent: number;
};

export function WhatIfCalculator({ jobs, currentResult, onClose }: WhatIfCalculatorProps) {
  const [adjustments, setAdjustments] = useState<Map<string, JobAdjustment>>(new Map());
  const [scenarioResult, setScenarioResult] = useState<ComplianceResult | null>(null);
  const [totalCost, setTotalCost] = useState(0);

  const femaleJobs = jobs.filter(job => job.females > 0 && job.males === 0);
  const maleJobs = jobs.filter(job => job.males > 0 && job.females === 0);

  useEffect(() => {
    calculateScenario();
  }, [adjustments]);

  const calculateScenario = () => {
    const adjustedJobs = jobs.map(job => {
      const adjustment = adjustments.get(job.id);
      if (adjustment) {
        return {
          ...job,
          max_salary: adjustment.adjustedMaxSalary
        };
      }
      return job;
    });

    const result = analyzeCompliance(adjustedJobs);
    setScenarioResult(result);

    const cost = Array.from(adjustments.values()).reduce((sum, adj) => {
      const job = jobs.find(j => j.id === adj.jobId);
      if (job) {
        const employeeCount = job.males + job.females;
        return sum + (adj.adjustment * employeeCount * 12);
      }
      return sum;
    }, 0);
    setTotalCost(cost);
  };

  const handleAdjustSalary = (jobId: string, newMaxSalary: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const adjustment = newMaxSalary - job.max_salary;
    const adjustmentPercent = (adjustment / job.max_salary) * 100;

    const newAdjustment: JobAdjustment = {
      jobId,
      originalMaxSalary: job.max_salary,
      adjustedMaxSalary: newMaxSalary,
      adjustment,
      adjustmentPercent
    };

    const newAdjustments = new Map(adjustments);
    if (adjustment === 0) {
      newAdjustments.delete(jobId);
    } else {
      newAdjustments.set(jobId, newAdjustment);
    }
    setAdjustments(newAdjustments);
  };

  const handlePercentageAdjustment = (jobId: string, percent: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const newMaxSalary = job.max_salary * (1 + percent / 100);
    handleAdjustSalary(jobId, newMaxSalary);
  };

  const handleApplyToAll = (jobIds: string[], percent: number) => {
    jobIds.forEach(jobId => {
      handlePercentageAdjustment(jobId, percent);
    });
  };

  const handleReset = () => {
    setAdjustments(new Map());
  };

  const complianceImproved = scenarioResult && currentResult && (
    (scenarioResult.isCompliant && !currentResult.isCompliant) ||
    (scenarioResult.salaryRangeTest?.passed && !currentResult.salaryRangeTest?.passed) ||
    (scenarioResult.exceptionalServiceTest?.passed && !currentResult.exceptionalServiceTest?.passed)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003865] rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">What-If Scenario Calculator</h2>
                <p className="text-sm text-gray-600">Test compensation adjustments to see their impact on compliance</p>
              </div>
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
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Current Status</h3>
                {currentResult.isCompliant ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className={`text-lg font-bold ${
                currentResult.isCompliant ? 'text-green-700' : 'text-red-700'
              }`}>
                {currentResult.isCompliant ? 'In Compliance' : 'Out of Compliance'}
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Scenario Result</h3>
                {scenarioResult?.isCompliant ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className={`text-lg font-bold ${
                scenarioResult?.isCompliant ? 'text-green-700' : 'text-red-700'
              }`}>
                {scenarioResult?.isCompliant ? 'Would Be Compliant' : 'Still Out of Compliance'}
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Annual Cost Impact</h3>
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {complianceImproved && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Compliance Improvement Detected</p>
                  <p className="text-sm text-green-800 mt-1">
                    These adjustments would improve your compliance status. Review the changes below.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Quick Adjustments</h3>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-3">Female-Dominated Classes ({femaleJobs.length})</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 2)}
                    className="px-3 py-1.5 bg-white border border-pink-300 text-pink-900 rounded-md hover:bg-pink-100 transition-colors text-sm"
                  >
                    +2% All
                  </button>
                  <button
                    onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 5)}
                    className="px-3 py-1.5 bg-white border border-pink-300 text-pink-900 rounded-md hover:bg-pink-100 transition-colors text-sm"
                  >
                    +5% All
                  </button>
                  <button
                    onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 10)}
                    className="px-3 py-1.5 bg-white border border-pink-300 text-pink-900 rounded-md hover:bg-pink-100 transition-colors text-sm"
                  >
                    +10% All
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Male-Dominated Classes ({maleJobs.length})</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 2)}
                    className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 rounded-md hover:bg-blue-100 transition-colors text-sm"
                  >
                    +2% All
                  </button>
                  <button
                    onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 5)}
                    className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 rounded-md hover:bg-blue-100 transition-colors text-sm"
                  >
                    +5% All
                  </button>
                  <button
                    onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 10)}
                    className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 rounded-md hover:bg-blue-100 transition-colors text-sm"
                  >
                    +10% All
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Job Adjustments</h3>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Job Title</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Gender</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Current Max</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Adjusted Max</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobs.map(job => {
                    const adjustment = adjustments.get(job.id);
                    const isFemale = job.females > 0 && job.males === 0;
                    const isMale = job.males > 0 && job.females === 0;
                    const genderLabel = isFemale ? 'Female' : isMale ? 'Male' : 'Balanced';

                    return (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{job.title}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isFemale ? 'bg-pink-100 text-pink-800' :
                            isMale ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {genderLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          ${job.max_salary.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={adjustment?.adjustedMaxSalary.toFixed(2) || job.max_salary.toFixed(2)}
                            onChange={(e) => handleAdjustSalary(job.id, parseFloat(e.target.value) || job.max_salary)}
                            className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {adjustment ? (
                            <span className={`font-medium ${
                              adjustment.adjustment > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {adjustment.adjustment > 0 ? '+' : ''}{adjustment.adjustmentPercent.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {scenarioResult && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Scenario Test Results</h3>
              <div className="space-y-2 text-sm">
                {scenarioResult.salaryRangeTest && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Salary Range Test:</span>
                    <span className={`font-medium ${
                      scenarioResult.salaryRangeTest.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {scenarioResult.salaryRangeTest.passed ? 'Pass' : 'Fail'} ({(scenarioResult.salaryRangeTest.ratio * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
                {scenarioResult.exceptionalServiceTest && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Exceptional Service Test:</span>
                    <span className={`font-medium ${
                      scenarioResult.exceptionalServiceTest.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {scenarioResult.exceptionalServiceTest.passed ? 'Pass' : 'Fail'} ({(scenarioResult.exceptionalServiceTest.ratio * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Changes are not saved. This is for planning purposes only.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
            >
              Close Calculator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
