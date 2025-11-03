import { AlertCircle, CheckCircle, TrendingUp, Users, Clock, Award, ExternalLink } from 'lucide-react';
import { ComplianceResult } from '../lib/complianceAnalysis';

type ComplianceTroubleshootingProps = {
  complianceResult: ComplianceResult;
  onClose: () => void;
};

export function ComplianceTroubleshooting({ complianceResult, onClose }: ComplianceTroubleshootingProps) {
  const failedTests = [];

  if (complianceResult.statisticalTest && complianceResult.statisticalTest.underpaymentRatio > 80) {
    failedTests.push('statistical');
  }
  if (complianceResult.salaryRangeTest && !complianceResult.salaryRangeTest.passed) {
    failedTests.push('salaryRange');
  }
  if (complianceResult.exceptionalServiceTest && !complianceResult.exceptionalServiceTest.passed) {
    failedTests.push('exceptionalService');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">Compliance Troubleshooting Guide</h2>
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
          {complianceResult.isCompliant ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Congratulations! You're In Compliance</h3>
                  <p className="text-green-800 text-sm">
                    Your jurisdiction has passed all required pay equity tests. Continue to monitor your pay practices annually to maintain compliance.
                  </p>
                </div>
              </div>
            </div>
          ) : complianceResult.requiresManualReview ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Manual Review Required</h3>
                  <p className="text-amber-800 text-sm mb-3">
                    Your jurisdiction requires manual review, typically because there are fewer than 4 male-dominated or female-dominated job classes. This doesn't necessarily mean you're out of compliance.
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="font-medium text-amber-900 text-sm">Next Steps:</p>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Complete and submit your implementation form</li>
                      <li>Contact Minnesota Management & Budget for manual review guidance</li>
                      <li>Document your pay practices and job evaluation methodology</li>
                      <li>Be prepared to provide additional information if requested</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Compliance Issues Detected</h3>
                  <p className="text-red-800 text-sm">
                    Your jurisdiction failed {failedTests.length} compliance test{failedTests.length > 1 ? 's' : ''}. Review the specific issues and recommendations below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {failedTests.includes('statistical') && complianceResult.statisticalTest && (
            <div className="border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistical Analysis Test Failed</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Underpayment Ratio: {complianceResult.statisticalTest.underpaymentRatio.toFixed(2)}% (Must be ≤80%)
                  </p>
                  <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
                    <p className="font-medium text-gray-900">What This Means:</p>
                    <p className="text-gray-700">
                      Female-dominated job classes are being underpaid at a rate more than 1.25 times that of male-dominated classes when compared to predicted pay based on job value.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="font-medium text-blue-900 mb-3">Recommended Actions:</p>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Identify underpaid female-dominated classes:</strong> Focus on classes with actual pay significantly below predicted pay
                  </li>
                  <li>
                    <strong>Review salary structures:</strong> Compare maximum salaries of female-dominated classes to male-dominated classes with similar point values
                  </li>
                  <li>
                    <strong>Adjust compensation:</strong> Increase salaries for underpaid female-dominated classes to bring them closer to predicted pay
                  </li>
                  <li>
                    <strong>Budget for equity adjustments:</strong> Plan multi-year salary increases if immediate full adjustment isn't feasible
                  </li>
                  <li>
                    <strong>Re-evaluate job classifications:</strong> Ensure point values accurately reflect skill, effort, responsibility, and working conditions
                  </li>
                  <li>
                    <strong>Test scenarios:</strong> Use the "what if" calculator to see how proposed changes affect compliance
                  </li>
                </ol>
              </div>

              <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded">
                <p className="font-medium text-amber-900 mb-2 text-sm">Common Causes:</p>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Historical pay practices that undervalued traditionally female occupations</li>
                  <li>Market-based pay that reflects societal gender bias</li>
                  <li>Inconsistent application of job evaluation systems</li>
                  <li>Failure to update salaries for female-dominated classes over time</li>
                </ul>
              </div>
            </div>
          )}

          {failedTests.includes('salaryRange') && complianceResult.salaryRangeTest && (
            <div className="border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Salary Range Test Failed</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Ratio: {(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}% (Must be between 110% and 140%)
                  </p>
                  <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
                    <p className="font-medium text-gray-900">What This Means:</p>
                    <p className="text-gray-700">
                      {complianceResult.salaryRangeTest.ratio * 100 < 110
                        ? 'Female-dominated classes take significantly longer to reach maximum salary than male-dominated classes.'
                        : 'Male-dominated classes take significantly longer to reach maximum salary than female-dominated classes.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="font-medium text-blue-900 mb-3">Recommended Actions:</p>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Review step structures:</strong> Compare the number of steps and time between steps for male vs. female-dominated classes
                  </li>
                  <li>
                    <strong>Standardize advancement timelines:</strong> Align years-to-maximum across similar job levels
                  </li>
                  <li>
                    <strong>Reduce excessive steps:</strong> If {complianceResult.salaryRangeTest.ratio * 100 < 110 ? 'female' : 'male'}-dominated classes have too many steps, consolidate them
                  </li>
                  <li>
                    <strong>Accelerate advancement:</strong> Consider annual instead of biennial increases where appropriate
                  </li>
                  <li>
                    <strong>Implement pay compression adjustments:</strong> Bring employees closer to maximum salary faster
                  </li>
                </ol>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="font-medium text-gray-900 mb-2 text-sm">Current Data:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Male-dominated classes average: <strong>{complianceResult.salaryRangeTest.maleAverage.toFixed(2)} years to max</strong></p>
                  <p>Female-dominated classes average: <strong>{complianceResult.salaryRangeTest.femaleAverage.toFixed(2)} years to max</strong></p>
                </div>
              </div>
            </div>
          )}

          {failedTests.includes('exceptionalService') && complianceResult.exceptionalServiceTest && (
            <div className="border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Exceptional Service Pay Test Failed</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Ratio: {(complianceResult.exceptionalServiceTest.ratio * 100).toFixed(2)}% (Must be between 80% and 120%)
                  </p>
                  <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
                    <p className="font-medium text-gray-900">What This Means:</p>
                    <p className="text-gray-700">
                      Exceptional service pay opportunities are not distributed equitably between male-dominated and female-dominated job classes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="font-medium text-blue-900 mb-3">Recommended Actions:</p>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Review ESP eligibility criteria:</strong> Ensure criteria don't inadvertently favor one gender
                  </li>
                  <li>
                    <strong>Expand ESP opportunities:</strong> Identify appropriate ESP categories for {complianceResult.exceptionalServiceTest.femalePercentage < complianceResult.exceptionalServiceTest.malePercentage ? 'female' : 'male'}-dominated classes
                  </li>
                  <li>
                    <strong>Create equity-conscious ESP programs:</strong> Design new ESP categories that apply broadly
                  </li>
                  <li>
                    <strong>Evaluate existing ESP:</strong> Remove or modify ESP types that disproportionately benefit one gender
                  </li>
                  <li>
                    <strong>Document ESP rationale:</strong> Ensure all ESP is job-related and consistently applied
                  </li>
                </ol>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="font-medium text-gray-900 mb-2 text-sm">Current Data:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Male-dominated classes receiving ESP: <strong>{complianceResult.exceptionalServiceTest.malePercentage.toFixed(2)}%</strong></p>
                  <p>Female-dominated classes receiving ESP: <strong>{complianceResult.exceptionalServiceTest.femalePercentage.toFixed(2)}%</strong></p>
                </div>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Recommendations for Achieving Compliance</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#003865] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-1">Engage Stakeholders</p>
                  <p className="text-gray-700 text-sm">
                    Work with HR, finance, unions, and department heads to develop a comprehensive plan for achieving pay equity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-[#003865] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-1">Develop a Multi-Year Plan</p>
                  <p className="text-gray-700 text-sm">
                    If immediate compliance isn't feasible, create a phased approach with measurable annual progress toward full equity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#003865] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-1">Document Everything</p>
                  <p className="text-gray-700 text-sm">
                    Keep detailed records of all decisions, adjustments, and justifications for your pay equity efforts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#003865] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-1">Monitor Regularly</p>
                  <p className="text-gray-700 text-sm">
                    Don't wait until reporting time. Review pay equity data quarterly and make adjustments as needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Additional Resources</h3>
            <div className="space-y-2">
              <a
                href="https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Minnesota Management & Budget Pay Equity Resources
              </a>
              <a
                href="https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/local-government/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Local Government Pay Equity Compliance Guide
              </a>
              <p className="text-sm text-gray-600 mt-4">
                For specific guidance on your situation, contact the Pay Equity Unit at Minnesota Management & Budget:
                <br />
                <strong>Phone:</strong> 651-259-3824
                <br />
                <strong>Email:</strong> payequity.mmb@state.mn.us
              </p>
            </div>
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
