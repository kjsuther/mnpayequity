import { useState } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';
import { ResourceLibrary } from './ResourceLibrary';

type ContextualHelpProps = {
  context: string;
  children?: React.ReactNode;
};

type HelpContent = {
  title: string;
  content: string;
  tips?: string[];
  commonMistakes?: string[];
  relatedResources?: Array<{
    title: string;
    url: string;
  }>;
};

const helpContentMap: Record<string, HelpContent> = {
  'job-data-entry': {
    title: 'Entering Job Classification Data',
    content: 'You are entering the core data about your job classifications. This information will be used to analyze pay equity across gender-dominated job classes.',
    tips: [
      'Enter salaries as monthly amounts, not annual',
      'Include only employees who work 67+ days/year and 14+ hours/week',
      'Be consistent with your job evaluation point system',
      'Double-check employee gender counts for accuracy',
    ],
    commonMistakes: [
      'Entering annual salary instead of monthly',
      'Including temporary or seasonal employees who don\'t meet minimums',
      'Inconsistent point values across similar positions',
      'Forgetting to include all eligible employees',
    ],
    relatedResources: [
      {
        title: 'State Job Match Evaluation System',
        url: 'https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf',
      },
      {
        title: 'Submission Instructions',
        url: 'https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf',
      },
    ],
  },
  'compliance-testing': {
    title: 'Understanding Compliance Tests',
    content: 'The system runs three statistical tests to determine if your jurisdiction has pay equity between male-dominated and female-dominated job classes of comparable worth.',
    tips: [
      'Review each failed test carefully to understand the specific issue',
      'Focus on the test with the largest disparity first',
      'Document all decisions and adjustments you make',
      'Consider multi-year implementation if immediate fixes aren\'t feasible',
    ],
    commonMistakes: [
      'Assuming all tests measure the same thing',
      'Making changes without understanding the root cause',
      'Adjusting only one job class when systemic changes are needed',
      'Not documenting the rationale for pay adjustments',
    ],
    relatedResources: [
      {
        title: 'Guide to Understanding Compliance',
        url: 'https://mn.gov/mmb-stat/pay-equity/guide-understand-compl.pdf',
      },
      {
        title: 'How to Interpret Results',
        url: 'https://mn.gov/mmb-stat/pay-equity/interpret-results-pay%20equity.pdf',
      },
    ],
  },
  'implementation-form': {
    title: 'Completing the Implementation Form',
    content: 'The implementation form documents your job evaluation system, benefits analysis, and official approval. This information becomes part of your official submission.',
    tips: [
      'Have your job evaluation documentation ready before starting',
      'Confirm governing body approval before checking the certification box',
      'Verify the notice posting location is accessible to all employees',
      'Save your work frequently - use the "Save Changes" button',
    ],
    commonMistakes: [
      'Submitting before governing body has officially approved',
      'Choosing a posting location that isn\'t accessible to all employees',
      'Not saving changes before navigating away',
      'Incomplete description of job evaluation system',
    ],
    relatedResources: [
      {
        title: 'Submission Instructions',
        url: 'https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf',
      },
    ],
  },
  'data-gathering': {
    title: 'Gathering Required Data',
    content: 'Before starting your report, gather all necessary information about your job classifications, employees, salaries, and benefits. Complete preparation makes the reporting process much smoother.',
    tips: [
      'Start gathering data 4-6 weeks before the January 31 deadline',
      'Work with HR and payroll to ensure accurate employee counts',
      'Verify your job evaluation system is current and approved',
      'Collect previous year\'s report for reference',
    ],
    commonMistakes: [
      'Waiting until January to start gathering data',
      'Not verifying employee eligibility criteria',
      'Using outdated salary information',
      'Forgetting to include all benefit types',
    ],
    relatedResources: [
      {
        title: 'Submission Instructions',
        url: 'https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf',
      },
      {
        title: 'State Job Match Evaluation System',
        url: 'https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf',
      },
    ],
  },
  'report-submission': {
    title: 'Submitting Your Report',
    content: 'You\'re in the final stages of submitting your pay equity report. Review the submission checklist carefully to ensure all required information is complete and accurate.',
    tips: [
      'Complete the submission checklist before proceeding',
      'Ensure governing body approval is documented',
      'Verify all salary and employee data is current',
      'Plan to post the compliance certificate for 90 days',
    ],
    commonMistakes: [
      'Submitting without completing all required fields',
      'Not having official governing body approval',
      'Submitting after the January 31 deadline',
      'Forgetting to download and post the compliance certificate',
    ],
    relatedResources: [
      {
        title: 'Submission Instructions',
        url: 'https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf',
      },
    ],
  },
};

export function ContextualHelp({ context, children }: ContextualHelpProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const helpContent = helpContentMap[context];

  if (!helpContent) {
    return null;
  }

  return (
    <div className="mb-6">
      {isExpanded ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{helpContent.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{helpContent.content}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {children}

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {helpContent.tips && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-green-900 mb-2 text-sm flex items-center gap-2">
                  <span className="text-green-600">✓</span> Best Practices
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {helpContent.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {helpContent.commonMistakes && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-amber-900 mb-2 text-sm flex items-center gap-2">
                  <span className="text-amber-600">⚠</span> Common Mistakes to Avoid
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {helpContent.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {helpContent.relatedResources && helpContent.relatedResources.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Related Official Resources</h4>
              <div className="space-y-2">
                {helpContent.relatedResources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#003865] hover:text-[#004d7a] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {resource.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Show contextual help for this page</span>
          </div>
          <span className="text-sm text-gray-600">Click to expand</span>
        </button>
      )}
    </div>
  );
}
