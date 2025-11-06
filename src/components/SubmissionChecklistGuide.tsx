import { useState } from 'react';
import { CheckSquare, Square, ExternalLink, Calendar, FileText, AlertCircle } from 'lucide-react';

type SubmissionChecklistGuideProps = {
  onClose: () => void;
};

type ChecklistItem = {
  id: string;
  phase: string;
  task: string;
  description: string;
  deadline?: string;
  required: boolean;
};

const checklistItems: ChecklistItem[] = [
  {
    id: 'gather-1',
    phase: 'Data Gathering (November-December)',
    task: 'Compile employee roster',
    description: 'List all employees who work 67+ days/year AND 14+ hours/week (100 days for students)',
    required: true
  },
  {
    id: 'gather-2',
    phase: 'Data Gathering (November-December)',
    task: 'Organize by job classification',
    description: 'Group employees into distinct job classes based on duties and responsibilities',
    required: true
  },
  {
    id: 'gather-3',
    phase: 'Data Gathering (November-December)',
    task: 'Collect salary information',
    description: 'Gather minimum and maximum monthly salary for each job class',
    required: true
  },
  {
    id: 'gather-4',
    phase: 'Data Gathering (November-December)',
    task: 'Calculate years to maximum',
    description: 'Determine how many years it takes to reach max salary in each job class',
    required: true
  },
  {
    id: 'gather-5',
    phase: 'Data Gathering (November-December)',
    task: 'Document exceptional service pay',
    description: 'Identify job classes with longevity pay, certification pay, or other exceptional service compensation',
    required: true
  },
  {
    id: 'eval-1',
    phase: 'Job Evaluation',
    task: 'Select evaluation system',
    description: 'Choose an approved job evaluation system (recommend State Job Match system)',
    required: true
  },
  {
    id: 'eval-2',
    phase: 'Job Evaluation',
    task: 'Evaluate each job class',
    description: 'Assign points based on skill, effort, responsibility, and working conditions',
    required: true
  },
  {
    id: 'eval-3',
    phase: 'Job Evaluation',
    task: 'Document evaluation rationale',
    description: 'Keep records of how points were assigned for each factor',
    required: true
  },
  {
    id: 'entry-1',
    phase: 'Data Entry',
    task: 'Enter jurisdiction information',
    description: 'Verify jurisdiction name, ID, address, and contact information are current',
    required: true
  },
  {
    id: 'entry-2',
    phase: 'Data Entry',
    task: 'Create report for current year',
    description: 'Set up new pay equity report case with proper year and description',
    required: true
  },
  {
    id: 'entry-3',
    phase: 'Data Entry',
    task: 'Enter all job classifications',
    description: 'Input all job data including title, points, salaries, employee counts, etc.',
    required: true
  },
  {
    id: 'entry-4',
    phase: 'Data Entry',
    task: 'Verify data accuracy',
    description: 'Double-check all entered information for errors or omissions',
    required: true
  },
  {
    id: 'test-1',
    phase: 'Compliance Testing',
    task: 'Run compliance evaluation',
    description: 'Execute the statistical analysis test using this system',
    required: true
  },
  {
    id: 'test-2',
    phase: 'Compliance Testing',
    task: 'Review test results',
    description: 'Understand what each test result means and identify any issues',
    required: true
  },
  {
    id: 'test-3',
    phase: 'Compliance Testing',
    task: 'If out of compliance: Create implementation plan',
    description: 'Develop detailed plan for corrective actions including timelines and costs',
    required: false
  },
  {
    id: 'test-4',
    phase: 'Compliance Testing',
    task: 'If out of compliance: Get budget approval',
    description: 'Secure funding authorization for salary adjustments needed',
    required: false
  },
  {
    id: 'prep-1',
    phase: 'Submission Preparation',
    task: 'Run pre-submission validation',
    description: 'Use the Pre-Submission Checker to verify all requirements are met',
    required: true
  },
  {
    id: 'prep-2',
    phase: 'Submission Preparation',
    task: 'Export compliance report PDF',
    description: 'Generate and review the official compliance report document',
    required: true
  },
  {
    id: 'prep-3',
    phase: 'Submission Preparation',
    task: 'Prepare implementation report (if needed)',
    description: 'Complete and export implementation plan if out of compliance',
    required: false
  },
  {
    id: 'prep-4',
    phase: 'Submission Preparation',
    task: 'Obtain authorized signatures',
    description: 'Get required signatures from jurisdiction officials',
    required: true
  },
  {
    id: 'submit-1',
    phase: 'Final Submission (By January 31)',
    task: 'Submit to MMB Pay Equity Unit',
    description: 'Send all required documents to payequity.mmb@state.mn.us',
    deadline: 'January 31',
    required: true
  },
  {
    id: 'submit-2',
    phase: 'Final Submission (By January 31)',
    task: 'Confirm receipt',
    description: 'Verify MMB received your submission and it is complete',
    deadline: 'Early February',
    required: true
  },
  {
    id: 'submit-3',
    phase: 'Final Submission (By January 31)',
    task: 'Archive submission materials',
    description: 'Save copies of all submitted documents for your records',
    required: true
  }
];

export function SubmissionChecklistGuide({ onClose }: SubmissionChecklistGuideProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const phases = Array.from(new Set(checklistItems.map(item => item.phase)));
  const totalItems = checklistItems.filter(item => item.required).length;
  const completedItems = checklistItems.filter(item => item.required && checkedItems.has(item.id)).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003865] rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Complete Submission Checklist</h2>
                <p className="text-sm text-gray-600">Track your progress through the entire reporting process</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Overall Progress</span>
              <span className="text-gray-600">{completedItems} of {totalItems} required tasks</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#78BE21] h-3 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <p className="font-medium mb-1">Annual Deadline: January 31st</p>
                <p>
                  Plan to start gathering data in November to ensure you have adequate time for evaluation,
                  testing, and any necessary corrections before the January 31st deadline.
                </p>
              </div>
            </div>
          </div>

          {phases.map(phase => {
            const phaseItems = checklistItems.filter(item => item.phase === phase);
            const phaseRequired = phaseItems.filter(item => item.required).length;
            const phaseCompleted = phaseItems.filter(item => item.required && checkedItems.has(item.id)).length;

            return (
              <div key={phase} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#003865] to-[#004d7a] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{phase}</h3>
                    <span className="text-xs text-white bg-white bg-opacity-20 px-2 py-1 rounded-full">
                      {phaseCompleted} / {phaseRequired}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {phaseItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        checkedItems.has(item.id) ? 'bg-green-50' : ''
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(item.id);
                          }}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {checkedItems.has(item.id) ? (
                            <CheckSquare className="w-6 h-6 text-green-600" />
                          ) : (
                            <Square className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium ${
                              checkedItems.has(item.id) ? 'text-gray-500 line-through' : 'text-gray-900'
                            }`}>
                              {item.task}
                              {!item.required && (
                                <span className="ml-2 text-xs text-gray-500 font-normal">(if applicable)</span>
                              )}
                            </h4>
                            {item.deadline && (
                              <span className="flex-shrink-0 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                {item.deadline}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            checkedItems.has(item.id) ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">Official Submission Instructions</p>
                <p className="mb-2">
                  For complete detailed instructions and requirements, download and review:
                </p>
                <a
                  href="https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 underline font-medium"
                >
                  Instructions for Submitting a Local Government Pay Equity Report
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Need Assistance?</p>
                <p className="mb-2">Contact the MMB Pay Equity Unit:</p>
                <div className="space-y-1">
                  <p>Email: <a href="mailto:payequity.mmb@state.mn.us" className="text-[#003865] hover:underline">payequity.mmb@state.mn.us</a></p>
                  <p>Phone: <a href="tel:651-259-3824" className="text-[#003865] hover:underline">651-259-3824</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="text-gray-600">
                Track your progress and ensure nothing is missed
              </p>
              <p className="text-gray-500 mt-1">
                {progress === 100 ? '🎉 All required tasks completed!' : 'Keep going - you\'re making progress!'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
            >
              Close Checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
