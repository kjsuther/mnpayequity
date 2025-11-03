import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, HelpCircle, ExternalLink } from 'lucide-react';

type JobMatchWizardProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (points: number, breakdown: PointsBreakdown) => void;
  initialJobTitle?: string;
};

type PointsBreakdown = {
  skill: number;
  effort: number;
  responsibility: number;
  workingConditions: number;
  total: number;
};

type EvaluationFactor = {
  name: string;
  description: string;
  levels: {
    level: number;
    points: number;
    description: string;
    examples: string[];
  }[];
};

const evaluationFactors: EvaluationFactor[] = [
  {
    name: 'Skill',
    description: 'Knowledge, education, training, and experience required for the job',
    levels: [
      {
        level: 1,
        points: 50,
        description: 'Basic Skills',
        examples: ['High school education or equivalent', 'Minimal specialized training', 'Basic communication skills']
      },
      {
        level: 2,
        points: 100,
        description: 'Moderate Skills',
        examples: ['Some college or technical training', '1-2 years experience', 'Intermediate technical skills']
      },
      {
        level: 3,
        points: 150,
        description: 'Advanced Skills',
        examples: ['College degree', '3-5 years experience', 'Specialized certifications', 'Advanced technical knowledge']
      },
      {
        level: 4,
        points: 200,
        description: 'Expert Skills',
        examples: ['Advanced degree', '5+ years experience', 'Professional license', 'Expert-level knowledge']
      }
    ]
  },
  {
    name: 'Effort',
    description: 'Physical and mental demands required to perform the job',
    levels: [
      {
        level: 1,
        points: 25,
        description: 'Light Effort',
        examples: ['Sedentary work', 'Occasional concentration', 'Routine tasks', 'Light physical demands']
      },
      {
        level: 2,
        points: 50,
        description: 'Moderate Effort',
        examples: ['Regular standing/walking', 'Sustained attention needed', 'Some physical demands', 'Multi-tasking required']
      },
      {
        level: 3,
        points: 75,
        description: 'Considerable Effort',
        examples: ['Heavy lifting required', 'Intense concentration', 'Stressful conditions', 'Complex problem-solving']
      },
      {
        level: 4,
        points: 100,
        description: 'Exceptional Effort',
        examples: ['Extreme physical demands', 'Constant mental strain', 'High-stress environment', 'Life-safety decisions']
      }
    ]
  },
  {
    name: 'Responsibility',
    description: 'Accountability for decisions, resources, and outcomes',
    levels: [
      {
        level: 1,
        points: 40,
        description: 'Limited Responsibility',
        examples: ['Follows detailed instructions', 'Minimal supervision of others', 'Low-cost equipment', 'Limited decision-making']
      },
      {
        level: 2,
        points: 80,
        description: 'Moderate Responsibility',
        examples: ['Some independent judgment', 'May lead small team', 'Moderate budget authority', 'Makes operational decisions']
      },
      {
        level: 3,
        points: 120,
        description: 'Substantial Responsibility',
        examples: ['Supervises multiple staff', 'Significant budget control', 'Makes policy recommendations', 'High accountability']
      },
      {
        level: 4,
        points: 160,
        description: 'Executive Responsibility',
        examples: ['Department leadership', 'Major budget responsibility', 'Strategic planning', 'Organizational impact']
      }
    ]
  },
  {
    name: 'Working Conditions',
    description: 'Physical environment and hazards present in the workplace',
    levels: [
      {
        level: 1,
        points: 10,
        description: 'Favorable Conditions',
        examples: ['Climate-controlled office', 'Clean environment', 'Minimal hazards', 'Regular hours']
      },
      {
        level: 2,
        points: 20,
        description: 'Some Discomfort',
        examples: ['Occasional outdoor work', 'Some noise or odors', 'Minor safety concerns', 'Variable schedule']
      },
      {
        level: 3,
        points: 30,
        description: 'Difficult Conditions',
        examples: ['Frequent outdoor exposure', 'Hazardous materials', 'Significant safety risks', 'Irregular hours']
      },
      {
        level: 4,
        points: 40,
        description: 'Severe Conditions',
        examples: ['Extreme weather exposure', 'High-risk environment', 'Dangerous equipment', 'Emergency response']
      }
    ]
  }
];

export function JobMatchWizard({ isOpen, onClose, onComplete, initialJobTitle }: JobMatchWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState<{ [key: string]: number }>({
    skill: 0,
    effort: 0,
    responsibility: 0,
    workingConditions: 0
  });

  if (!isOpen) return null;

  const currentFactor = evaluationFactors[currentStep];
  const isLastStep = currentStep === evaluationFactors.length - 1;
  const totalPoints = Object.values(selectedPoints).reduce((sum, points) => sum + points, 0);

  const handleSelectLevel = (points: number) => {
    const factorKey = currentFactor.name.toLowerCase().replace(' ', '');
    setSelectedPoints(prev => ({
      ...prev,
      [factorKey]: points
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      const breakdown: PointsBreakdown = {
        skill: selectedPoints.skill,
        effort: selectedPoints.effort,
        responsibility: selectedPoints.responsibility,
        workingConditions: selectedPoints.workingconditions,
        total: totalPoints
      };
      onComplete(totalPoints, breakdown);
      handleReset();
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedPoints({
      skill: 0,
      effort: 0,
      responsibility: 0,
      workingConditions: 0
    });
  };

  const factorKey = currentFactor.name.toLowerCase().replace(' ', '');
  const selectedValue = selectedPoints[factorKey];
  const canProceed = selectedValue > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Job Evaluation Wizard</h2>
              {initialJobTitle && (
                <p className="text-sm text-gray-600 mt-1">Evaluating: {initialJobTitle}</p>
              )}
            </div>
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          <div className="flex items-center justify-between">
            {evaluationFactors.map((factor, index) => (
              <div key={factor.name} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : index === currentStep
                    ? 'bg-[#003865] border-[#003865] text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                {index < evaluationFactors.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Step {currentStep + 1} of {evaluationFactors.length}
            </span>
            <span className="text-gray-900 font-semibold">
              Current Total: {totalPoints} points
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentFactor.name}</h3>
            <p className="text-gray-600">{currentFactor.description}</p>
          </div>

          <div className="space-y-3">
            {currentFactor.levels.map((level) => (
              <button
                key={level.level}
                onClick={() => handleSelectLevel(level.points)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedValue === level.points
                    ? 'border-[#003865] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Level {level.level}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900">{level.description}</h4>
                  </div>
                  <span className="text-2xl font-bold text-[#003865]">{level.points}</span>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  {level.examples.map((example, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Need detailed guidance?</p>
                <a
                  href="https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 underline"
                >
                  Review the State Job Match Guide
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={currentStep === 0 ? () => { handleReset(); onClose(); } : handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                Reset All
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                  canProceed
                    ? 'bg-[#003865] text-white hover:bg-[#004d7a]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLastStep ? 'Complete Evaluation' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
