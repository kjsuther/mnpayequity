import { CheckCircle } from 'lucide-react';

type SuccessModalProps = {
  isOpen: boolean;
  message: string;
  onClose: () => void;
};

export function SuccessModal({ isOpen, message, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <p className="text-lg text-gray-900 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#D4A574] text-white rounded-lg hover:bg-[#c49563] transition-colors font-medium"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
