import { useState } from 'react';
import { Book, ExternalLink, FileText, Video, Mail, Phone, Download, CheckCircle, ArrowRight } from 'lucide-react';

type ComprehensiveHelpGuideProps = {
  onClose: () => void;
};

type HelpSection = {
  id: string;
  title: string;
  icon: any;
  content: string;
  subsections?: {
    title: string;
    content: string;
    links?: { text: string; url: string }[];
  }[];
  links?: { text: string; url: string }[];
};

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Pay Equity Reporting',
    icon: Book,
    content: 'Welcome to the Minnesota Local Government Pay Equity Reporting System. This guide will help you understand your obligations and successfully complete your annual pay equity report.',
    subsections: [
      {
        title: 'What is the Pay Equity Act?',
        content: 'The Minnesota Local Government Pay Equity Act (Minnesota Statutes 471.991-471.999) requires local governments to ensure that female-dominated and male-dominated job classes of comparable work value receive equitable compensation. All political subdivisions with more than one female job class must comply.',
        links: [
          { text: 'Minnesota Pay Equity Law Overview', url: 'https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/local-government/' }
        ]
      },
      {
        title: 'Who Must Report?',
        content: 'All Minnesota counties, cities, towns, school districts, and other political subdivisions with more than one female-dominated job class must submit annual pay equity reports by January 31st each year.',
      },
      {
        title: 'Key Deadlines',
        content: 'Annual reports are due by January 31st for data as of December 31st of the previous year. We recommend starting data collection in November to ensure adequate time for job evaluation, analysis, and any necessary corrections.'
      }
    ]
  },
  {
    id: 'official-documents',
    title: 'Official Minnesota MMB Documents',
    icon: FileText,
    content: 'Minnesota Management & Budget (MMB) provides comprehensive official guidance documents. These should be your primary reference for all pay equity reporting questions.',
    subsections: [
      {
        title: 'Instructions for Submitting a Local Government Pay Equity Report',
        content: 'This is your primary reference document. It contains complete step-by-step instructions for preparing and submitting your annual report, including all required forms and documentation.',
        links: [
          { text: 'Download Submission Instructions PDF', url: 'https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf' }
        ]
      },
      {
        title: 'State Job Match Evaluation System (2023)',
        content: 'The official guide for evaluating job classifications and assigning point values based on skill, effort, responsibility, and working conditions. This system ensures objective, consistent job evaluation.',
        links: [
          { text: 'Download State Job Match Guide PDF', url: 'https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf' }
        ]
      },
      {
        title: 'Guide to Understanding Pay Equity Compliance',
        content: 'Essential reading for understanding what compliance means, how the statistical tests work, and what actions to take based on your results. Everyone involved in pay equity reporting should review this guide.',
        links: [
          { text: 'Download Compliance Guide PDF', url: 'https://mn.gov/mmb-stat/pay-equity/guide-understand-compl.pdf' }
        ]
      },
      {
        title: 'How to Interpret Your Pay Equity Results',
        content: 'Detailed technical guide for understanding compliance test results, identifying problematic job classifications, and calculating required salary adjustments.',
        links: [
          { text: 'Download Results Interpretation Guide PDF', url: 'https://mn.gov/mmb-stat/pay-equity/interpret-results-pay%20equity.pdf' }
        ]
      }
    ]
  },
  {
    id: 'data-gathering',
    title: 'Step 1: Data Gathering',
    icon: CheckCircle,
    content: 'Proper data collection is the foundation of accurate pay equity reporting. Start this process in November to ensure adequate time.',
    subsections: [
      {
        title: 'Which Employees to Include',
        content: 'Include all employees who work:\n• Regular employees: 67+ days per year AND 14+ hours per week on average\n• Student employees: 100+ days per year AND 14+ hours per week on average\n\nExclude temporary, seasonal, or casual employees who don\'t meet these minimums.'
      },
      {
        title: 'Required Information for Each Employee',
        content: '• Job classification/title\n• Gender (for classification purposes only)\n• Current salary or hourly rate\n• Hours worked per week\n• Days worked per year\n• Years of service\n• Any exceptional service pay received'
      },
      {
        title: 'Organizing by Job Classification',
        content: 'Group employees into distinct job classes based on similar duties, responsibilities, and qualifications. Each job class should represent a distinct type of work, not just similar titles.'
      },
      {
        title: 'Salary Information',
        content: 'For each job class, document:\n• Minimum monthly salary\n• Maximum monthly salary\n• Number of years to reach maximum\n• Any longevity or exceptional service pay\n\nConvert hourly wages to monthly: (Hourly Rate × Hours/Week × 52 weeks) ÷ 12 months'
      }
    ]
  },
  {
    id: 'job-evaluation',
    title: 'Step 2: Job Evaluation',
    icon: CheckCircle,
    content: 'Every job must be evaluated using an approved system. The State Job Match system is recommended and built into this application.',
    subsections: [
      {
        title: 'The Four Evaluation Factors',
        content: 'Jobs are evaluated on:\n\n1. Skill: Education, training, experience required\n2. Effort: Physical and mental demands\n3. Responsibility: Accountability for decisions, resources, outcomes\n4. Working Conditions: Physical environment and hazards\n\nEach factor is assigned points based on level (1-4). Use the Job Match Wizard in this system to guide you through the evaluation.'
      },
      {
        title: 'Consistency is Critical',
        content: 'Apply the same evaluation standards to all jobs. Inconsistent evaluation is the most common cause of compliance issues. Document your rationale for point assignments.'
      },
      {
        title: 'Common Evaluation Mistakes',
        content: '• Assigning points based on the person, not the position\n• Undervaluing skills in female-dominated jobs\n• Overemphasizing physical demands vs. mental demands\n• Inconsistent application of working conditions criteria\n• Letting current pay influence point assignments'
      }
    ],
    links: [
      { text: 'State Job Match Evaluation System Guide', url: 'https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf' }
    ]
  },
  {
    id: 'data-entry',
    title: 'Step 3: Data Entry',
    icon: CheckCircle,
    content: 'Enter your data carefully into this system. Double-check all entries before running compliance tests.',
    subsections: [
      {
        title: 'Jurisdiction Information',
        content: 'Verify your jurisdiction name, ID, address, and contact information are current. Designate at least one primary contact with complete contact details.'
      },
      {
        title: 'Creating Your Report',
        content: 'Create a new report for the current year. Give it a clear case description (e.g., "Annual Report 2024" or "Corrected Report 2024").'
      },
      {
        title: 'Entering Job Classifications',
        content: 'For each job class, enter:\n• Job title\n• Point value (from your evaluation)\n• Number of male employees\n• Number of female employees\n• Number of non-binary employees\n• Minimum monthly salary\n• Maximum monthly salary\n• Years to reach maximum\n• Years of service pay\n• Exceptional service category (if applicable)'
      },
      {
        title: 'Data Entry Tips',
        content: '• You can copy jobs from previous years and update the data\n• You can import jobs from a CSV file\n• Use the manual entry wizard for a guided experience\n• Save frequently as you work\n• Use the data validation tools to catch errors'
      }
    ]
  },
  {
    id: 'compliance-testing',
    title: 'Step 4: Compliance Testing',
    icon: CheckCircle,
    content: 'After entering all data, run the compliance evaluation to test whether your jurisdiction meets pay equity requirements.',
    subsections: [
      {
        title: 'The Three Compliance Tests',
        content: '1. Statistical Analysis Test: Compares percentage of male vs. female jobs below predicted pay. Underpayment ratio must be 80% or less.\n\n2. Salary Range Test: Compares average years to maximum salary. Ratio must be between 80% and 140%.\n\n3. Exceptional Service Pay Test: Compares percentage receiving exceptional service pay. Ratio must be 80% or more (if >20% of male classes receive ESP).'
      },
      {
        title: 'Understanding Your Results',
        content: 'The system will show you:\n• Overall compliance status\n• Detailed results for each test\n• General information about your job classes\n• Statistical analysis with predicted pay calculations\n\nUse the Gap Analysis tool to identify which specific jobs are causing compliance issues.',
        links: [
          { text: 'How to Interpret Your Results Guide', url: 'https://mn.gov/mmb-stat/pay-equity/interpret-results-pay%20equity.pdf' }
        ]
      },
      {
        title: 'What If You\'re Out of Compliance?',
        content: 'Don\'t panic - many jurisdictions fail initially. You have options:\n\n• Review data for errors (most common cause)\n• Use the What-If Calculator to test salary adjustments\n• Use the Gap Analysis to prioritize which jobs to address\n• Develop a multi-year implementation plan\n• Budget for equity adjustments in next fiscal year\n• Consult with MMB Pay Equity Unit for guidance'
      }
    ]
  },
  {
    id: 'implementation',
    title: 'Step 5: Implementation Planning (If Out of Compliance)',
    icon: CheckCircle,
    content: 'If your jurisdiction is out of compliance, you must submit an implementation plan detailing how and when you will achieve compliance.',
    subsections: [
      {
        title: 'What to Include in Your Plan',
        content: '• Specific job classes that need adjustment\n• Proposed salary changes for each affected class\n• Timeline for implementation (may span multiple years)\n• Budget impact and funding sources\n• Approval status from governing body\n• Milestones and progress tracking methods'
      },
      {
        title: 'Multi-Year Plans',
        content: 'You can phase in compliance over multiple years if immediate compliance isn\'t feasible. However, you must show good faith progress each year and justify any delays.'
      },
      {
        title: 'Getting It Approved',
        content: 'Your implementation plan typically needs approval from your city council, county board, school board, or other governing body. Budget for equity adjustments in your next fiscal cycle.'
      }
    ],
    links: [
      { text: 'Understanding Compliance Guide', url: 'https://mn.gov/mmb-stat/pay-equity/guide-understand-compl.pdf' }
    ]
  },
  {
    id: 'submission',
    title: 'Step 6: Final Submission',
    icon: CheckCircle,
    content: 'Before submitting, use the Pre-Submission Checker to ensure all requirements are met.',
    subsections: [
      {
        title: 'Required Documents',
        content: '• Completed pay equity report (export from this system)\n• Compliance test results (export from this system)\n• Implementation plan (if out of compliance)\n• Any supporting documentation or notes\n• Authorized signatures as required'
      },
      {
        title: 'How to Submit',
        content: 'Email all documents to the MMB Pay Equity Unit at:\npayequity.mmb@state.mn.us\n\nInclude your jurisdiction name and report year in the subject line.'
      },
      {
        title: 'After Submission',
        content: '• MMB will review your submission\n• They may contact you with questions\n• You\'ll receive confirmation of acceptance\n• Keep copies of everything for your records\n• Note any follow-up actions required'
      },
      {
        title: 'Deadline Reminder',
        content: 'Reports must be submitted by January 31st each year. Late submissions may result in non-compliance penalties.'
      }
    ],
    links: [
      { text: 'Official Submission Instructions', url: 'https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf' }
    ]
  },
  {
    id: 'tools',
    title: 'Using System Tools',
    icon: CheckCircle,
    content: 'This system includes powerful tools to help you understand and achieve pay equity compliance.',
    subsections: [
      {
        title: 'Job Match Wizard',
        content: 'Interactive tool that guides you through evaluating a job using the State Job Match system. Answer questions about skill, effort, responsibility, and working conditions to calculate point values.'
      },
      {
        title: 'What-If Calculator',
        content: 'Test different salary adjustment scenarios to see their impact on compliance before implementing changes. Calculate annual costs and see which adjustments move you toward compliance.'
      },
      {
        title: 'Gap Analysis Tool',
        content: 'Identifies specific jobs that are underpaid relative to their value. Prioritizes issues by severity and calculates the cost to close all gaps. Export analysis for budget presentations.'
      },
      {
        title: 'Pre-Submission Checker',
        content: 'Comprehensive validation of all submission requirements. Ensures you have complete data, proper evaluations, and all required documentation before final submission.'
      },
      {
        title: 'Submission Checklist',
        content: 'Track your progress through the entire reporting process from data gathering to final submission. Ensures you don\'t miss any critical steps.'
      }
    ]
  },
  {
    id: 'common-issues',
    title: 'Common Issues & Troubleshooting',
    icon: CheckCircle,
    content: 'Solutions to frequently encountered problems in pay equity reporting.',
    subsections: [
      {
        title: 'My jurisdiction fails the Statistical Analysis Test',
        content: 'This usually means female-dominated job classes are systematically underpaid compared to male-dominated classes of similar value. Use the Gap Analysis tool to identify which specific jobs are causing the issue. Focus on raising salaries for underpaid female-dominated classes.'
      },
      {
        title: 'My jurisdiction fails the Salary Range Test',
        content: 'This means it takes significantly longer for one gender to reach maximum salary. Review your step progression systems. Ensure female and male-dominated classes have similar advancement timelines.'
      },
      {
        title: 'My jurisdiction fails the Exceptional Service Pay Test',
        content: 'This indicates opportunities for extra pay (longevity, certifications, etc.) aren\'t distributed equitably. Either expand ESP opportunities to female-dominated classes or reduce them for male-dominated classes to achieve balance.'
      },
      {
        title: 'I don\'t have enough male-dominated classes',
        content: 'If you have 3 or fewer male-dominated classes, you cannot use the standard statistical tests. Contact MMB for guidance on alternative analysis methods.'
      },
      {
        title: 'I found errors after submitting',
        content: 'Contact MMB immediately at payequity.mmb@state.mn.us to discuss submitting a corrected report. Don\'t wait until next year to fix significant errors.'
      },
      {
        title: 'I can\'t afford to fix all issues immediately',
        content: 'Submit an implementation plan showing how you\'ll achieve compliance over multiple years. Be realistic but show good faith effort. Budget for equity adjustments in your next fiscal cycle.'
      }
    ]
  },
  {
    id: 'contact',
    title: 'Getting Help & Contact Information',
    icon: Phone,
    content: 'MMB Pay Equity Unit staff are available to assist with questions and provide technical guidance.',
    subsections: [
      {
        title: 'Contact the MMB Pay Equity Unit',
        content: 'For questions about pay equity reporting, compliance issues, or technical guidance:\n\nEmail: payequity.mmb@state.mn.us\nPhone: 651-259-3824\n\nOffice Hours: Monday-Friday, 8:00 AM - 4:30 PM Central Time'
      },
      {
        title: 'What MMB Can Help With',
        content: '• Interpretation of compliance test results\n• Guidance on implementation plans\n• Questions about job evaluation\n• Technical issues with reporting\n• Deadline extensions (in rare cases)\n• General pay equity law questions'
      },
      {
        title: 'What to Prepare Before Calling',
        content: '• Your jurisdiction name and ID\n• Report year in question\n• Specific question or issue\n• Any error messages or test results\n• Relevant job classification details'
      }
    ],
    links: [
      { text: 'MMB Pay Equity Website', url: 'https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/' },
      { text: 'Email MMB Pay Equity Unit', url: 'mailto:payequity.mmb@state.mn.us' }
    ]
  }
];

export function ComprehensiveHelpGuide({ onClose }: ComprehensiveHelpGuideProps) {
  const [selectedSection, setSelectedSection] = useState<string>(helpSections[0].id);

  const currentSection = helpSections.find(s => s.id === selectedSection);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8 max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#003865] to-[#004d7a] rounded-lg flex items-center justify-center">
                <Book className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Comprehensive Help Guide</h2>
                <p className="text-sm text-gray-600">Complete guide to Minnesota pay equity reporting</p>
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

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <nav className="p-4 space-y-1">
              {helpSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedSection === section.id
                        ? 'bg-[#003865] text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {currentSection && (
              <div className="max-w-3xl">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{currentSection.title}</h2>
                  <p className="text-gray-700 leading-relaxed">{currentSection.content}</p>
                </div>

                {currentSection.subsections && (
                  <div className="space-y-6">
                    {currentSection.subsections.map((subsection, idx) => (
                      <div key={idx} className="border-l-4 border-[#78BE21] pl-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{subsection.title}</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{subsection.content}</p>
                        {subsection.links && subsection.links.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {subsection.links.map((link, linkIdx) => (
                              <a
                                key={linkIdx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#003865] hover:text-[#004d7a] font-medium text-sm"
                              >
                                <ExternalLink className="w-4 h-4" />
                                {link.text}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentSection.links && currentSection.links.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Related Resources
                    </h4>
                    <div className="space-y-2">
                      {currentSection.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-700 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
                        >
                          <ArrowRight className="w-4 h-4" />
                          {link.text}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSection === 'getting-started' && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-[#003865] to-[#004d7a] text-white rounded-lg">
                    <h3 className="text-xl font-bold mb-3">Quick Start</h3>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        <span>Review official documents (especially submission instructions)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>Start gathering employee data in November</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>Evaluate all jobs using State Job Match system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">4.</span>
                        <span>Enter data into this system carefully</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">5.</span>
                        <span>Run compliance tests and analyze results</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">6.</span>
                        <span>Address any compliance issues (or create implementation plan)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">7.</span>
                        <span>Run pre-submission checker</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">8.</span>
                        <span>Submit by January 31st</span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <a
                href="mailto:payequity.mmb@state.mn.us"
                className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] font-medium"
              >
                <Mail className="w-4 h-4" />
                payequity.mmb@state.mn.us
              </a>
              <a
                href="tel:651-259-3824"
                className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] font-medium"
              >
                <Phone className="w-4 h-4" />
                651-259-3824
              </a>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
