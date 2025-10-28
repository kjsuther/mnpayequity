import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { ComplianceResult } from '../lib/complianceAnalysis';

type ComplianceResultsProps = {
  results: ComplianceResult;
  onBack: () => void;
  reportYear: number;
  showBackButton?: boolean;
  onProceedToImplementation?: () => void;
};

export function ComplianceResults({ results: result, onBack, reportYear, showBackButton = true, onProceedToImplementation }: ComplianceResultsProps) {
  return (
    <div className="space-y-6">
      {showBackButton && (
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>
            <p className="text-sm text-gray-600">Report Year: {reportYear}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Compliance Analysis Results</h3>
        {result.isCompliant ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">In Compliance</span>
          </div>
        ) : result.requiresManualReview ? (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-6 h-6" />
            <span className="font-semibold">Manual Review Required</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-rose-600">
            <XCircle className="w-6 h-6" />
            <span className="font-semibold">Out of Compliance</span>
          </div>
        )}
      </div>

      <div className={`p-5 rounded-xl ${
        result.isCompliant
          ? 'bg-emerald-50 border border-emerald-200'
          : result.requiresManualReview
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-rose-50 border border-rose-200'
      }`}>
        <p className={`text-sm leading-relaxed ${
          result.isCompliant
            ? 'text-emerald-800'
            : result.requiresManualReview
            ? 'text-amber-800'
            : 'text-rose-800'
        }`}>
          {result.message}
        </p>
      </div>

      <div className="border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">I. GENERAL JOB CLASS INFORMATION</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="text-left py-3 px-4"></th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">Male Classes</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">Female Classes</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">Balanced Classes</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">All Job Classes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700"># Job Classes</td>
                <td className="text-center py-3 px-4 text-gray-900">{result.generalInfo.maleClasses}</td>
                <td className="text-center py-3 px-4 text-gray-900">{result.generalInfo.femaleClasses}</td>
                <td className="text-center py-3 px-4 text-gray-900">{result.generalInfo.balancedClasses}</td>
                <td className="text-center py-3 px-4 font-bold text-gray-900">{result.generalInfo.totalClasses}</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700"># Employees</td>
                <td className="text-center py-3 px-4 text-gray-900">{result.generalInfo.maleEmployees}</td>
                <td className="text-center py-3 px-4 text-gray-900">{result.generalInfo.femaleEmployees}</td>
                <td className="text-center py-3 px-4 text-gray-900">{result.generalInfo.balancedEmployees}</td>
                <td className="text-center py-3 px-4 font-bold text-gray-900">{result.generalInfo.totalEmployees}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Avg.Max Monthly Pay Per Employee</td>
                <td className="text-center py-3 px-4 text-gray-900">${result.generalInfo.avgMaxPayMale.toFixed(2)}</td>
                <td className="text-center py-3 px-4 text-gray-900">${result.generalInfo.avgMaxPayFemale.toFixed(2)}</td>
                <td className="text-center py-3 px-4 text-gray-900">${result.generalInfo.avgMaxPayBalanced.toFixed(2)}</td>
                <td className="text-center py-3 px-4 font-bold text-gray-900">${result.generalInfo.avgMaxPayAll.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {!result.requiresManualReview && result.statisticalTest && (
        <>
          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-6">II. STATISTICAL ANALYSIS TEST</h4>

            <div className="mb-6">
              <h5 className="font-bold text-gray-800 mb-3">A. UNDERPAYMENT RATIO = {result.statisticalTest.underpaymentRatio.toFixed(2)}% *</h5>
              <div className="ml-6 space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-6">
                  <div></div>
                  <div className="font-bold text-center text-gray-800">Male Classes</div>
                  <div className="font-bold text-center text-gray-800">Female Classes</div>
                </div>
                <div className="grid grid-cols-3 gap-6 py-2">
                  <div className="text-gray-700">a. # at or above Predicted Pay</div>
                  <div className="text-center text-gray-900">{result.statisticalTest.maleTotalClasses - result.statisticalTest.maleClassesBelowPredicted}</div>
                  <div className="text-center text-gray-900">{result.statisticalTest.femaleTotalClasses - result.statisticalTest.femaleClassesBelowPredicted}</div>
                </div>
                <div className="grid grid-cols-3 gap-6 py-2">
                  <div className="text-gray-700">b. # Below Predicted Pay</div>
                  <div className="text-center text-gray-900">{result.statisticalTest.maleClassesBelowPredicted}</div>
                  <div className="text-center text-gray-900">{result.statisticalTest.femaleClassesBelowPredicted}</div>
                </div>
                <div className="grid grid-cols-3 gap-6 py-2">
                  <div className="text-gray-700">c. TOTAL</div>
                  <div className="text-center text-gray-900">{result.statisticalTest.maleTotalClasses}</div>
                  <div className="text-center text-gray-900">{result.statisticalTest.femaleTotalClasses}</div>
                </div>
                <div className="grid grid-cols-3 gap-6 py-2">
                  <div className="text-gray-700">d. % Below Predicted Pay (b divided by c = d)</div>
                  <div className="text-center font-semibold text-gray-900">{result.statisticalTest.malePercentBelowPredicted.toFixed(2)}%</div>
                  <div className="text-center font-semibold text-gray-900">{result.statisticalTest.femalePercentBelowPredicted.toFixed(2)}%</div>
                </div>
                <div className="text-xs text-gray-600 mt-3 italic">
                  *(Result is % of male classes below predicted pay divided by % of female classes below predicted pay.)
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-gray-800 mb-3">B. T-test Results</h5>
              <div className="ml-6 space-y-3 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-gray-900">
                    <div><span className="font-medium">Degrees of Freedom (DF)</span> = {result.statisticalTest.tTestDF}</div>
                    <div><span className="font-medium">Value of T</span> = {result.statisticalTest.tTestValue.toFixed(3)}</div>
                  </div>
                </div>
                <div className="text-gray-700">
                  a. Avg.diff.in pay from predicted pay for male jobs = <span className="font-medium text-gray-900">${result.statisticalTest.avgDiffMale.toFixed(2)}</span>
                </div>
                <div className="text-gray-700">
                  b. Avg.diff.in pay from predicted pay for female jobs = <span className="font-medium text-gray-900">${result.statisticalTest.avgDiffFemale.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {result.salaryRangeTest && (
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">III. SALARY RANGE TEST = {(result.salaryRangeTest.ratio * 100).toFixed(2)}% (Result is A divided by B)</h4>
                {result.salaryRangeTest.passed ? (
                  <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold px-3 py-1.5 bg-emerald-50 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    Passed
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-rose-600 text-sm font-bold px-3 py-1.5 bg-rose-50 rounded-lg">
                    <XCircle className="w-5 h-5" />
                    Failed
                  </span>
                )}
              </div>
              <div className="space-y-3 text-sm ml-6">
                <p className="text-gray-700">
                  A. Avg.# of years to max salary for male jobs = <span className="font-semibold text-gray-900">{result.salaryRangeTest.maleAverage.toFixed(2)}</span>
                </p>
                <p className="text-gray-700">
                  B. Avg.# of years to max salary for female jobs = <span className="font-semibold text-gray-900">{result.salaryRangeTest.femaleAverage.toFixed(2)}</span>
                </p>
              </div>
            </div>
          )}

          {result.exceptionalServiceTest && (
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">IV. EXCEPTIONAL SERVICE PAY TEST = {(result.exceptionalServiceTest.ratio * 100).toFixed(2)}% (Result is B divided by A)</h4>
                {result.exceptionalServiceTest.passed ? (
                  <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold px-3 py-1.5 bg-emerald-50 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    Passed
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-rose-600 text-sm font-bold px-3 py-1.5 bg-rose-50 rounded-lg">
                    <XCircle className="w-5 h-5" />
                    Failed
                  </span>
                )}
              </div>
              <div className="space-y-3 text-sm ml-6">
                <p className="text-gray-700">
                  A. % of male classes receiving ESP = <span className="font-semibold text-gray-900">{result.exceptionalServiceTest.malePercentage.toFixed(2)}%</span>
                </p>
                <p className="text-gray-700">
                  B. % of female classes receiving ESP = <span className="font-semibold text-gray-900">{result.exceptionalServiceTest.femalePercentage.toFixed(2)}%</span>
                </p>
                <p className="text-xs text-gray-600 mt-3 italic">
                  *(If 20% or less, test result will be 0.00)
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {onProceedToImplementation && (
        <div className="flex justify-end">
          <button
            onClick={onProceedToImplementation}
            className="px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
          >
            Proceed to Implementation
          </button>
        </div>
      )}

      </div>
    </div>
  );
}
