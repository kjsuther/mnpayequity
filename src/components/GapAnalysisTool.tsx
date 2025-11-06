import { useState } from 'react';
import { Target, TrendingDown, AlertTriangle, Download, Filter } from 'lucide-react';
import { JobClassification } from '../lib/supabase';
import { ComplianceResult } from '../lib/complianceAnalysis';

type GapAnalysisToolProps = {
  jobs: JobClassification[];
  complianceResult: ComplianceResult;
  onClose: () => void;
};

type JobGap = {
  job: JobClassification;
  predictedPay: number;
  actualPay: number;
  gap: number;
  gapPercent: number;
  priority: 'high' | 'medium' | 'low';
};

export function GapAnalysisTool({ jobs, complianceResult, onClose }: GapAnalysisToolProps) {
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'gap' | 'percent' | 'title'>('gap');

  const calculatePredictedPay = (points: number, allJobs: JobClassification[]): number => {
    if (allJobs.length < 2) return 0;

    const sumX = allJobs.reduce((sum, job) => sum + job.points, 0);
    const sumY = allJobs.reduce((sum, job) => sum + job.max_salary, 0);
    const sumXY = allJobs.reduce((sum, job) => sum + (job.points * job.max_salary), 0);
    const sumX2 = allJobs.reduce((sum, job) => sum + (job.points * job.points), 0);
    const n = allJobs.length;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * points + intercept;
  };

  const analyzeGaps = (): JobGap[] => {
    return jobs
      .map(job => {
        const predictedPay = calculatePredictedPay(job.points, jobs);
        const actualPay = job.max_salary;
        const gap = actualPay - predictedPay;
        const gapPercent = predictedPay > 0 ? (gap / predictedPay) * 100 : 0;

        let priority: 'high' | 'medium' | 'low';
        if (gap < 0 && Math.abs(gapPercent) > 10) {
          priority = 'high';
        } else if (gap < 0 && Math.abs(gapPercent) > 5) {
          priority = 'medium';
        } else {
          priority = 'low';
        }

        return {
          job,
          predictedPay,
          actualPay,
          gap,
          gapPercent,
          priority
        };
      })
      .filter(gap => {
        if (filterGender !== 'all') {
          const isFemale = gap.job.females > 0 && gap.job.males === 0;
          const isMale = gap.job.males > 0 && gap.job.females === 0;
          if (filterGender === 'female' && !isFemale) return false;
          if (filterGender === 'male' && !isMale) return false;
        }
        if (filterPriority !== 'all' && gap.priority !== filterPriority) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'gap') return a.gap - b.gap;
        if (sortBy === 'percent') return a.gapPercent - b.gapPercent;
        return a.job.title.localeCompare(b.job.title);
      });
  };

  const gaps = analyzeGaps();
  const underpaidJobs = gaps.filter(g => g.gap < 0);
  const highPriorityGaps = underpaidJobs.filter(g => g.priority === 'high');
  const totalGapAmount = underpaidJobs.reduce((sum, g) => sum + Math.abs(g.gap), 0);

  const femaleUnderpaid = underpaidJobs.filter(g => g.job.females > 0 && g.job.males === 0).length;
  const maleUnderpaid = underpaidJobs.filter(g => g.job.males > 0 && g.job.females === 0).length;

  const handleExport = () => {
    const csv = [
      ['Job Title', 'Gender', 'Points', 'Actual Max Pay', 'Predicted Pay', 'Gap Amount', 'Gap %', 'Priority', 'Employees Affected'],
      ...gaps.map(gap => {
        const isFemale = gap.job.females > 0 && gap.job.males === 0;
        const isMale = gap.job.males > 0 && gap.job.females === 0;
        const gender = isFemale ? 'Female' : isMale ? 'Male' : 'Balanced';
        const employeeCount = gap.job.males + gap.job.females;

        return [
          gap.job.title,
          gender,
          gap.job.points,
          gap.actualPay.toFixed(2),
          gap.predictedPay.toFixed(2),
          gap.gap.toFixed(2),
          gap.gapPercent.toFixed(2) + '%',
          gap.priority,
          employeeCount
        ];
      })
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pay_equity_gap_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full my-8">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003865] rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pay Equity Gap Analysis</h2>
                <p className="text-sm text-gray-600">Identify specific jobs contributing to compliance issues</p>
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
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Underpaid</h3>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{underpaidJobs.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {femaleUnderpaid} female, {maleUnderpaid} male
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">High Priority</h3>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{highPriorityGaps.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                &gt;10% below predicted
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Gap</h3>
                <TrendingDown className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${totalGapAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Monthly shortfall
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Annual Cost</h3>
                <TrendingDown className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${(totalGapAmount * 12).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                To close all gaps
              </p>
            </div>
          </div>

          {!complianceResult.isCompliant && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Compliance Issues Detected</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    The jobs marked as "High Priority" below are significantly underpaid relative to their job value.
                    Focus on these positions to improve compliance.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value as any)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                >
                  <option value="all">All Gender Classes</option>
                  <option value="female">Female-Dominated</option>
                  <option value="male">Male-Dominated</option>
                </select>
              </div>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority Only</option>
                <option value="medium">Medium Priority Only</option>
                <option value="low">Low Priority Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              >
                <option value="gap">Sort by Gap Amount</option>
                <option value="percent">Sort by Gap Percent</option>
                <option value="title">Sort by Job Title</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export Analysis
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Job Title</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Gender</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Points</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actual Pay</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Predicted Pay</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Gap</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Employees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {gaps.map((gap, idx) => {
                    const isFemale = gap.job.females > 0 && gap.job.males === 0;
                    const isMale = gap.job.males > 0 && gap.job.females === 0;
                    const genderLabel = isFemale ? 'Female' : isMale ? 'Male' : 'Balanced';
                    const employeeCount = gap.job.males + gap.job.females;

                    return (
                      <tr key={idx} className={`hover:bg-gray-50 ${
                        gap.gap < 0 && gap.priority === 'high' ? 'bg-red-50' : ''
                      }`}>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            gap.priority === 'high' ? 'bg-red-100 text-red-800' :
                            gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {gap.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{gap.job.title}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isFemale ? 'bg-pink-100 text-pink-800' :
                            isMale ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {genderLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">{gap.job.points}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          ${gap.actualPay.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          ${gap.predictedPay.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className={`font-medium ${
                            gap.gap < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            ${gap.gap.toFixed(2)}
                            <div className="text-xs">
                              ({gap.gap < 0 ? '' : '+'}{gap.gapPercent.toFixed(1)}%)
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">
                          {employeeCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Understanding the Analysis</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li><strong>Predicted Pay:</strong> What the job should pay based on its point value compared to all other jobs</li>
              <li><strong>Gap:</strong> Difference between actual and predicted pay (negative means underpaid)</li>
              <li><strong>High Priority:</strong> Jobs more than 10% below predicted pay</li>
              <li><strong>Medium Priority:</strong> Jobs 5-10% below predicted pay</li>
              <li><strong>Low Priority:</strong> Jobs less than 5% from predicted pay</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
            >
              Close Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
