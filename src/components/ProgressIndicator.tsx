import { CheckCircle, Circle } from 'lucide-react';

type Step = {
  id: string;
  label: string;
  description: string;
};

type ProgressIndicatorProps = {
  currentStep: number;
  steps: Step[];
  onStepClick?: (stepIndex: number) => void;
};

export function ProgressIndicator({ currentStep, steps, onStepClick }: ProgressIndicatorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
        Report Progress
      </h3>
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = onStepClick && index <= currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all mb-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-[#003865] border-[#003865] text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" fill="currentColor" />
                  )}
                </button>
                <div className="text-center">
                  <div
                    className={`text-xs font-medium mb-1 ${
                      isCurrent ? 'text-[#003865]' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-gray-600 max-w-[120px]">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
