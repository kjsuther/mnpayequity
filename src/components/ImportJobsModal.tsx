import { useState, useRef } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

type ImportJobsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jobs: any[]) => Promise<void>;
};

export function ImportJobsModal({ isOpen, onClose, onImport }: ImportJobsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setFile(selectedFile);
        setErrors([]);
      } else {
        setErrors(['Please select a valid Excel file (.xls or .xlsx)']);
        setFile(null);
      }
    }
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });

          const fileName = file.name.replace(/\.(xlsx|xls)$/i, '');
          const sheetNames = workbook.SheetNames;

          const matchingSheet = sheetNames.find(name => name === fileName);
          if (!matchingSheet) {
            reject(new Error(`Tab name must match filename. Expected tab named "${fileName}", but found: ${sheetNames.join(', ')}`));
            return;
          }

          const worksheet = workbook.Sheets[matchingSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          if (jsonData.length < 2) {
            reject(new Error('File appears to be empty'));
            return;
          }

          const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
          const requiredHeaders = ['jobid', 'title', 'males', 'females', 'nonbinary', 'points', 'mins', 'maxs', 'yrmax', 'yrsrv', 'exsrv'];

          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }

          const jobs: any[] = [];
          const errorMessages: string[] = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            try {
              const job = {
                job_number: parseInt(String(row[headers.indexOf('jobid')] || i)) || i,
                title: String(row[headers.indexOf('title')] || '').trim(),
                males: parseInt(String(row[headers.indexOf('males')] || 0)) || 0,
                females: parseInt(String(row[headers.indexOf('females')] || 0)) || 0,
                nonbinary: parseInt(String(row[headers.indexOf('nonbinary')] || 0)) || 0,
                points: parseInt(String(row[headers.indexOf('points')] || 0)) || 0,
                min_salary: parseFloat(String(row[headers.indexOf('mins')] || 0)) || 0,
                max_salary: parseFloat(String(row[headers.indexOf('maxs')] || 0)) || 0,
                years_to_max: parseFloat(String(row[headers.indexOf('yrmax')] || 0)) || 0,
                years_service_pay: parseFloat(String(row[headers.indexOf('yrsrv')] || 0)) || 0,
                exceptional_service_category: String(row[headers.indexOf('exsrv')] || '').trim(),
              };

              if (!job.title) {
                errorMessages.push(`Row ${i + 1}: Title is required`);
                continue;
              }

              jobs.push(job);
            } catch (err) {
              errorMessages.push(`Row ${i + 1}: Error parsing data - ${err}`);
            }
          }

          if (errorMessages.length > 0) {
            reject(new Error(errorMessages.join('\n')));
            return;
          }

          if (jobs.length === 0) {
            reject(new Error('No valid job records found in file'));
            return;
          }

          resolve(jobs);
        } catch (err: any) {
          reject(new Error(`Error parsing Excel file: ${err.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (!file) {
      setErrors(['Please select a file to import']);
      return;
    }

    setIsImporting(true);
    setErrors([]);

    try {
      const jobs = await parseExcelFile(file);
      await onImport(jobs);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Error importing jobs';
      setErrors(errorMessage.split('\n'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Import Jobs from Excel</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Excel File Requirements:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>File must be in Excel format (.xls or .xlsx)</li>
              <li>Tab name must match the filename</li>
              <li>Must include exact column headers: jobid, title, males, females, nonbinary, points, mins, maxs, yrmax, yrsrv, exsrv</li>
              <li>Title column is required for each row</li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="text-[#003865] hover:text-[#004d7a] font-medium">
                  Choose a file
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
              {file && (
                <p className="mt-4 text-sm font-medium text-gray-700">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">Import Errors:</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isImporting}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="flex-1 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isImporting || !file}
            >
              {isImporting ? 'Importing...' : 'Import Jobs'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
