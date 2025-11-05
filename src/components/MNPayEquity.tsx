import { Book, ExternalLink, CheckCircle, FileText, GraduationCap, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

type MNPayEquityProps = {
  onBack: () => void;
};

type ReportingStep = {
  number: number;
  title: string;
  description: string;
  url: string;
};

const reportingSteps: ReportingStep[] = [
  {
    number: 1,
    title: 'Establish a job evaluation system',
    description: 'Develop or adopt a job evaluation system that measures the value of each job based on skill, effort, responsibility, and working conditions. The State Job Match Evaluation System is commonly used.',
    url: 'https://mn.gov/mmb/employee-relations/compensation/laws/local-gov/local-gov-pay-equity/#step1'
  },
  {
    number: 2,
    title: 'Gather the data you will need to report',
    description: 'Collect employee data including job classifications, gender composition, salary ranges, and evaluation points for each job class. This data will form the basis of your annual report.',
    url: 'https://mn.gov/mmb/employee-relations/compensation/laws/local-gov/local-gov-pay-equity/#step2'
  },
  {
    number: 3,
    title: 'Submit reports electronically',
    description: 'Complete and submit your pay equity report through the online reporting system by the annual deadline of January 31st.',
    url: 'https://mn.gov/mmb/employee-relations/compensation/laws/local-gov/local-gov-pay-equity/#step3'
  },
  {
    number: 4,
    title: 'Interpret your results',
    description: 'Review the compliance test results including the Statistical Analysis Test, Salary Range Test, and Exceptional Service Pay Test. Identify any areas of non-compliance that require attention.',
    url: 'https://mn.gov/mmb/employee-relations/compensation/laws/local-gov/local-gov-pay-equity/#step4'
  },
  {
    number: 5,
    title: 'Download and post the official notice',
    description: 'After submitting your report, download the official compliance notice and post it in a visible location at your workplace as required by law.',
    url: 'https://mn.gov/mmb/employee-relations/compensation/laws/local-gov/local-gov-pay-equity/#step5'
  }
];

export function MNPayEquity({ onBack }: MNPayEquityProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button
        onClick={onBack}
        className="mb-6 text-[#003865] hover:text-[#004d7a] font-medium flex items-center gap-2"
      >
        ← Back
      </button>

      <div className="bg-gradient-to-br from-[#003865] to-[#004d7a] text-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Local Government Pay Equity</h1>
            <p className="text-blue-100 text-lg mt-1">Minnesota Management & Budget</p>
          </div>
        </div>
        <p className="text-white/90 leading-relaxed max-w-4xl">
          State law requires all public jurisdictions such as cities, counties, and school districts to eliminate any gender-based wage inequities in compensation and submit reports to MMB. For information about reporting, refer to the resources below.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#003865] transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-[#003865]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Minnesota Statute</h3>
              <a
                href="https://www.revisor.mn.gov/statutes/cite/471.991"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#003865] hover:text-[#004d7a] hover:underline flex items-center gap-1"
              >
                471.991-999 Municipal Rights, Powers, Duties; Equitable Compensation Relationship
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#003865] transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Book className="w-6 h-6 text-[#003865]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Administrative Rules</h3>
              <a
                href="https://www.revisor.mn.gov/rules/3920/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#003865] hover:text-[#004d7a] hover:underline flex items-center gap-1"
              >
                Minnesota Rules Chapter 3920 Local Government Pay Equity
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#78BE21] to-[#6aac1d] text-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3">Local Government Pay Equity Training</h2>
            <p className="text-white/95 mb-4 leading-relaxed">
              This comprehensive course provides an understanding of Minnesota's pay equity law, the legal reporting requirements for local government entities, and detailed instructions to electronically submit a pay equity report to MMB.
            </p>
            <a
              href="https://lms.mnpals.net/iqs/ilsOnDemand/SSO/login.cfm?CFID=13597683&CFTOKEN=c4b84b50d9a82848-B31C65EB-0E15-09FE-16FCF09838E8A7CA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#78BE21] rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              <GraduationCap className="w-5 h-5" />
              Access Training Course
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What does pay equity mean?</h2>
          <div className="w-16 h-1 bg-[#78BE21] rounded"></div>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Pay equity ensures that employees in female-dominated job classes receive compensation comparable to employees in male-dominated job classes of similar work value. This is determined by analyzing job evaluation points, salary data, and gender composition across all job classifications.
          </p>
          <a
            href="https://mn.gov/mmb/employee-relations/compensation/laws/local-gov/local-gov-pay-equity/#about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#003865] hover:text-[#004d7a] font-medium"
          >
            Learn more about pay equity
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Local Government Pay Equity Reporting Process</h2>
          <div className="w-16 h-1 bg-[#78BE21] rounded"></div>
        </div>
        <div className="space-y-3">
          {reportingSteps.map((step) => (
            <div
              key={step.number}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#003865] transition-colors"
            >
              <button
                onClick={() => toggleStep(step.number)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-[#003865] text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                </div>
                {expandedStep === step.number ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedStep === step.number && (
                <div className="px-4 pb-4 pt-0 pl-[72px] border-t border-gray-100">
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">{step.description}</p>
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#003865] hover:text-[#004d7a] font-medium"
                  >
                    View detailed instructions
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Resources</h2>
          <div className="w-16 h-1 bg-[#78BE21] rounded"></div>
        </div>
        <div className="space-y-3">
          <a
            href="https://mn.gov/mmb/assets/PayEquityTheMinnesotaExperience_tcm36-453946.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#003865] transition-colors">
                    Pay Equity: The Minnesota Experience
                  </h3>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#003865] transition-colors" />
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive overview of Minnesota's pay equity initiative, implementation history, and impact on local government compensation practices.
                </p>
              </div>
            </div>
          </a>

          <a
            href="https://mn.gov/mmb-stat/pay-equity/guide-understand-compl.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#003865] transition-colors">
                    Guide to Understanding Pay Equity Compliance
                  </h3>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#003865] transition-colors" />
                </div>
                <p className="text-sm text-gray-600">
                  Essential guide explaining compliance requirements, statistical tests, and corrective action procedures for achieving pay equity.
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Legislative Reports</h2>
          <div className="w-16 h-1 bg-[#78BE21] rounded"></div>
        </div>
        <p className="text-gray-700 mb-4">
          Review annual legislative reports on local government pay equity compliance across Minnesota.
        </p>
        <a
          href="https://mn.gov/mmb/employee-relations/compensation/laws/local-gov/local-gov-pay-equity/#legislative-reports"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
        >
          <FileText className="w-5 h-5" />
          View Legislative Reports
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Need Direct Assistance?
        </h3>
        <div className="space-y-1 text-sm text-blue-800">
          <p><strong>Pay Equity Unit</strong></p>
          <p>Minnesota Management and Budget</p>
          <p>Phone: <a href="tel:651-259-3824" className="underline hover:text-blue-900 font-medium">651-259-3824</a></p>
          <p>Email: <a href="mailto:payequity.mmb@state.mn.us" className="underline hover:text-blue-900 font-medium">payequity.mmb@state.mn.us</a></p>
        </div>
      </div>
    </div>
  );
}
