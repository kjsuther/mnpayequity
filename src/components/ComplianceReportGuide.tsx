import { ArrowLeft, BookOpen } from 'lucide-react';
import { Report, Jurisdiction } from '../lib/supabase';
import { ComplianceResult } from '../lib/complianceAnalysis';

type ComplianceReportGuideProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  complianceResult: ComplianceResult;
  onBack: () => void;
};

export function ComplianceReportGuide({ report, jurisdiction, complianceResult, onBack }: ComplianceReportGuideProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Report
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8 text-[#003865]" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compliance Report Guide</h1>
            <p className="text-gray-600 mt-1">{jurisdiction.name} - {report.report_year}</p>
          </div>
        </div>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Your Report</h2>
            <p className="text-gray-700 leading-relaxed">
              This guide will help you understand how your pay equity compliance report was generated and what each section means.
              The report analyzes your jurisdiction's job classifications to ensure compliance with pay equity requirements.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Compliance Status</h2>
            <div className={`p-5 rounded-lg mb-4 ${
              complianceResult.isCompliant
                ? 'bg-emerald-50 border border-emerald-200'
                : complianceResult.requiresManualReview
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-rose-50 border border-rose-200'
            }`}>
              <p className={`font-semibold ${
                complianceResult.isCompliant
                  ? 'text-emerald-800'
                  : complianceResult.requiresManualReview
                  ? 'text-amber-800'
                  : 'text-rose-800'
              }`}>
                {complianceResult.message}
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Your jurisdiction is {complianceResult.isCompliant ? 'in compliance' : complianceResult.requiresManualReview ? 'subject to manual review' : 'not in compliance'} with
              pay equity requirements. This determination is based on three statistical tests that analyze pay patterns across job classifications.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Section I: General Job Class Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Your Data:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Total Job Classes:</span> {complianceResult.generalInfo.totalClasses}
                </div>
                <div>
                  <span className="font-semibold">Total Employees:</span> {complianceResult.generalInfo.totalEmployees}
                </div>
                <div>
                  <span className="font-semibold">Male-Dominated Classes:</span> {complianceResult.generalInfo.maleClasses} ({complianceResult.generalInfo.maleEmployees} employees)
                </div>
                <div>
                  <span className="font-semibold">Female-Dominated Classes:</span> {complianceResult.generalInfo.femaleClasses} ({complianceResult.generalInfo.femaleEmployees} employees)
                </div>
                <div>
                  <span className="font-semibold">Balanced Classes:</span> {complianceResult.generalInfo.balancedClasses} ({complianceResult.generalInfo.balancedEmployees} employees)
                </div>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>Job Classification by Gender:</strong> Each job class is categorized based on the gender composition of its employees:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Male-Dominated:</strong> Classes where 70% or more of employees are male</li>
                <li><strong>Female-Dominated:</strong> Classes where 70% or more of employees are female</li>
                <li><strong>Balanced:</strong> Classes where neither gender represents 70% or more</li>
              </ul>
              <p>
                The average maximum monthly pay is calculated for each category to identify potential pay disparities. In your jurisdiction:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Male-dominated classes average: <strong>${complianceResult.generalInfo.avgMaxPayMale.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></li>
                <li>Female-dominated classes average: <strong>${complianceResult.generalInfo.avgMaxPayFemale.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></li>
                <li>Overall average: <strong>${complianceResult.generalInfo.avgMaxPayAll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></li>
              </ul>
            </div>
          </section>

          {!complianceResult.requiresManualReview && complianceResult.statisticalTest && (
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Section II: Statistical Analysis Test</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Your Results:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Underpayment Ratio:</span> {complianceResult.statisticalTest.underpaymentRatio.toFixed(2)}%
                    {complianceResult.statisticalTest.underpaymentRatio <= 80 ? (
                      <span className="ml-2 text-emerald-600 font-semibold">✓ Passed (≤80%)</span>
                    ) : (
                      <span className="ml-2 text-rose-600 font-semibold">✗ Failed (&gt;80%)</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="font-semibold mb-1">Male-Dominated Classes:</div>
                      <div className="ml-4 space-y-1">
                        <div>At/Above Predicted Pay: {complianceResult.statisticalTest.maleTotalClasses - complianceResult.statisticalTest.maleClassesBelowPredicted}</div>
                        <div>Below Predicted Pay: {complianceResult.statisticalTest.maleClassesBelowPredicted}</div>
                        <div>Percentage Below: {complianceResult.statisticalTest.malePercentBelowPredicted.toFixed(2)}%</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Female-Dominated Classes:</div>
                      <div className="ml-4 space-y-1">
                        <div>At/Above Predicted Pay: {complianceResult.statisticalTest.femaleTotalClasses - complianceResult.statisticalTest.femaleClassesBelowPredicted}</div>
                        <div>Below Predicted Pay: {complianceResult.statisticalTest.femaleClassesBelowPredicted}</div>
                        <div>Percentage Below: {complianceResult.statisticalTest.femalePercentBelowPredicted.toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="font-semibold">T-Test Results:</div>
                    <div className="ml-4 space-y-1">
                      <div>Degrees of Freedom: {complianceResult.statisticalTest.tTestDF}</div>
                      <div>T-Value: {complianceResult.statisticalTest.tTestValue.toFixed(3)}</div>
                      <div>Male Avg Difference: ${complianceResult.statisticalTest.avgDiffMale.toFixed(2)}</div>
                      <div>Female Avg Difference: ${complianceResult.statisticalTest.avgDiffFemale.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  <strong>What This Test Measures:</strong> The statistical analysis test examines whether female-dominated job classes are systematically underpaid compared to male-dominated classes of similar value.
                </p>
                <p>
                  <strong>How It Works:</strong>
                </p>
                <ol className="list-decimal ml-6 space-y-2">
                  <li>The system calculates a predicted pay for each job class based on its required skills, effort, responsibility, and working conditions.</li>
                  <li>It compares actual pay to predicted pay for both male-dominated and female-dominated classes.</li>
                  <li>The <strong>Underpayment Ratio</strong> is calculated by dividing the percentage of male classes below predicted pay by the percentage of female classes below predicted pay, then multiplying by 100.</li>
                  <li>A T-test is performed to determine if the difference in average pay is statistically significant.</li>
                </ol>
                <p>
                  <strong>Pass Requirement:</strong> The underpayment ratio must be 80% or less. This means that female-dominated classes should not be underpaid at a rate more than 1.25 times that of male-dominated classes.
                </p>
                <p className="font-semibold">
                  In your case: The male classes below predicted pay ({complianceResult.statisticalTest.malePercentBelowPredicted.toFixed(2)}%)
                  divided by female classes below predicted pay ({complianceResult.statisticalTest.femalePercentBelowPredicted.toFixed(2)}%)
                  equals {complianceResult.statisticalTest.underpaymentRatio.toFixed(2)}%, which is
                  {complianceResult.statisticalTest.underpaymentRatio <= 80 ? ' within' : ' outside'} the acceptable range.
                </p>
              </div>
            </section>
          )}

          {!complianceResult.requiresManualReview && complianceResult.salaryRangeTest && (
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Section III: Salary Range Test</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Your Results:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Test Result:</span> {(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}%
                    {complianceResult.salaryRangeTest.passed ? (
                      <span className="ml-2 text-emerald-600 font-semibold">✓ Passed (110-140%)</span>
                    ) : (
                      <span className="ml-2 text-rose-600 font-semibold">✗ Failed (outside 110-140%)</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <div>Male Classes Avg Years to Max: <strong>{complianceResult.salaryRangeTest.maleAverage.toFixed(2)} years</strong></div>
                    <div>Female Classes Avg Years to Max: <strong>{complianceResult.salaryRangeTest.femaleAverage.toFixed(2)} years</strong></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  <strong>What This Test Measures:</strong> The salary range test ensures that female-dominated job classes don't have unreasonably longer time periods to reach maximum salary compared to male-dominated classes.
                </p>
                <p>
                  <strong>How It Works:</strong>
                </p>
                <ol className="list-decimal ml-6 space-y-2">
                  <li>For each job class with a salary range, calculate the number of years it takes to reach maximum salary (based on step increments).</li>
                  <li>Calculate the average years to maximum for male-dominated and female-dominated classes separately.</li>
                  <li>Divide the male average by the female average and multiply by 100 to get a percentage.</li>
                </ol>
                <p>
                  <strong>Pass Requirement:</strong> The ratio must be between 110% and 140%. This allows for some variation while ensuring that neither gender is disadvantaged by unreasonably long advancement periods.
                </p>
                <p className="font-semibold">
                  In your case: Male average ({complianceResult.salaryRangeTest.maleAverage.toFixed(2)} years)
                  divided by female average ({complianceResult.salaryRangeTest.femaleAverage.toFixed(2)} years)
                  equals {(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}%, which is
                  {complianceResult.salaryRangeTest.passed ? ' within' : ' outside'} the acceptable range.
                </p>
              </div>
            </section>
          )}

          {!complianceResult.requiresManualReview && complianceResult.exceptionalServiceTest && (
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Section IV: Exceptional Service Pay Test</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Your Results:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Test Result:</span> {(complianceResult.exceptionalServiceTest.ratio * 100).toFixed(2)}%
                    {complianceResult.exceptionalServiceTest.passed ? (
                      <span className="ml-2 text-emerald-600 font-semibold">✓ Passed (80-120%)</span>
                    ) : (
                      <span className="ml-2 text-rose-600 font-semibold">✗ Failed (outside 80-120%)</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <div>Male Classes Receiving ESP: <strong>{complianceResult.exceptionalServiceTest.malePercentage.toFixed(2)}%</strong></div>
                    <div>Female Classes Receiving ESP: <strong>{complianceResult.exceptionalServiceTest.femalePercentage.toFixed(2)}%</strong></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  <strong>What This Test Measures:</strong> The exceptional service pay (ESP) test ensures that opportunities for exceptional service pay are distributed equitably across male-dominated and female-dominated job classes.
                </p>
                <p>
                  <strong>How It Works:</strong>
                </p>
                <ol className="list-decimal ml-6 space-y-2">
                  <li>Calculate the percentage of male-dominated classes that receive exceptional service pay.</li>
                  <li>Calculate the percentage of female-dominated classes that receive exceptional service pay.</li>
                  <li>Divide the female percentage by the male percentage and multiply by 100.</li>
                  <li>Special rule: If either percentage is 20% or less, the test result is set to 0.00 (automatic fail).</li>
                </ol>
                <p>
                  <strong>Pass Requirement:</strong> The ratio must be between 80% and 120%, meaning that opportunities for exceptional service pay should be relatively equal across gender-dominated classifications.
                </p>
                <p className="font-semibold">
                  In your case: Female ESP percentage ({complianceResult.exceptionalServiceTest.femalePercentage.toFixed(2)}%)
                  divided by male ESP percentage ({complianceResult.exceptionalServiceTest.malePercentage.toFixed(2)}%)
                  equals {(complianceResult.exceptionalServiceTest.ratio * 100).toFixed(2)}%, which is
                  {complianceResult.exceptionalServiceTest.passed ? ' within' : ' outside'} the acceptable range.
                </p>
              </div>
            </section>
          )}

          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              {complianceResult.isCompliant ? (
                <>
                  <p>
                    Congratulations! Your jurisdiction is in compliance with pay equity requirements. You should:
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Keep this report for your records</li>
                    <li>Submit the report according to your state's requirements</li>
                    <li>Continue monitoring pay equity annually</li>
                    <li>Review any job classifications that are close to failing thresholds</li>
                  </ul>
                </>
              ) : complianceResult.requiresManualReview ? (
                <>
                  <p>
                    Your report requires manual review. This typically occurs when:
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>There are fewer than 4 male-dominated or female-dominated job classes</li>
                    <li>The data doesn't support automated statistical testing</li>
                  </ul>
                  <p>
                    You should contact your state's pay equity compliance office for guidance on how to proceed with manual review.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Your jurisdiction is not currently in compliance. You should:
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Review which specific tests failed and by how much</li>
                    <li>Identify the job classes contributing to the disparity</li>
                    <li>Develop a corrective action plan to address pay inequities</li>
                    <li>Consider consulting with HR professionals or pay equity specialists</li>
                    <li>Re-run the analysis after making adjustments to verify compliance</li>
                    <li>Document all steps taken to achieve compliance</li>
                  </ul>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
