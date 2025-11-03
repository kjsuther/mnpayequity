import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

type WelcomeTutorialProps = {
  isOpen: boolean;
  onClose: () => void;
};

const steps = [
  {
    title: 'Welcome to Pay Equity Reporting',
    content: 'This system helps Minnesota local governments comply with the Local Government Pay Equity Act. We\'ll guide you through the entire reporting process in 5 simple steps.',
    icon: '👋',
  },
  {
    title: 'Step 1: Gather Your Data',
    content: 'Before you begin, collect employee data including job titles, gender composition, salary ranges, job evaluation points, and benefits information. We provide checklists and worksheets to help you gather everything you need.',
    icon: '📋',
  },
  {
    title: 'Step 2: Enter Job Classifications',
    content: 'Enter your job data by typing it manually, copying from a previous report, or importing from Excel. You can also indicate if your jurisdiction has no employees meeting the reporting requirements.',
    icon: '💼',
  },
  {
    title: 'Step 3: Run Compliance Tests',
    content: 'The system automatically analyzes your data using three statistical tests to determine if your jurisdiction is in compliance with pay equity requirements. We\'ll show you exactly what each test measures and help you understand your results.',
    icon: '📊',
  },
  {
    title: 'Step 4: Complete Implementation Form',
    content: 'Fill out the official implementation form with information about your job evaluation system, health benefits, and approval details. The form guides you through each required field.',
    icon: '📝',
  },
  {
    title: 'Step 5: Submit and Post Notice',
    content: 'Review your submission checklist, submit your report, and download the official compliance certificate to post in your building for 90 days. We\'ll provide detailed posting instructions.',
    icon: '✅',
  },
];

export function WelcomeTutorial({ isOpen, onClose }: WelcomeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('payEquityTutorialCompleted', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{steps[currentStep].icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {steps[currentStep].content}
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-[#003865] w-8'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
            >
              {isLastStep ? (
                <>
                  Get Started
                  <CheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {!isFirstStep && (
          <div className="px-8 pb-6">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tutorial (you can access help anytime from the menu)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
