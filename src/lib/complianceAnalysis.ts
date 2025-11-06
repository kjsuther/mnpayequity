import { JobClassification } from './supabase';

export type ComplianceResult = {
  isCompliant: boolean;
  requiresManualReview: boolean;
  generalInfo: {
    maleClasses: number;
    femaleClasses: number;
    balancedClasses: number;
    totalClasses: number;
    maleEmployees: number;
    femaleEmployees: number;
    balancedEmployees: number;
    totalEmployees: number;
    avgMaxPayMale: number;
    avgMaxPayFemale: number;
    avgMaxPayBalanced: number;
    avgMaxPayAll: number;
  };
  statisticalTest: {
    underpaymentRatio: number;
    maleClassesBelowPredicted: number;
    femaleClassesBelowPredicted: number;
    maleTotalClasses: number;
    femaleTotalClasses: number;
    malePercentBelowPredicted: number;
    femalePercentBelowPredicted: number;
    tTestDF: number;
    tTestValue: number;
    avgDiffMale: number;
    avgDiffFemale: number;
  } | null;
  salaryRangeTest: {
    passed: boolean;
    maleAverage: number;
    femaleAverage: number;
    ratio: number;
    threshold: number;
  } | null;
  exceptionalServiceTest: {
    passed: boolean;
    malePercentage: number;
    femalePercentage: number;
    ratio: number;
    threshold: number;
  } | null;
  totalJobs: number;
  maleJobs: number;
  femaleJobs: number;
  message: string;
};

export function analyzeCompliance(jobs: JobClassification[]): ComplianceResult {
  if (jobs.length === 0) {
    return {
      isCompliant: false,
      requiresManualReview: false,
      generalInfo: {
        maleClasses: 0,
        femaleClasses: 0,
        balancedClasses: 0,
        totalClasses: 0,
        maleEmployees: 0,
        femaleEmployees: 0,
        balancedEmployees: 0,
        totalEmployees: 0,
        avgMaxPayMale: 0,
        avgMaxPayFemale: 0,
        avgMaxPayBalanced: 0,
        avgMaxPayAll: 0,
      },
      statisticalTest: null,
      salaryRangeTest: null,
      exceptionalServiceTest: null,
      totalJobs: 0,
      maleJobs: 0,
      femaleJobs: 0,
      message: 'No job classifications to analyze',
    };
  }

  const maleJobs = jobs.filter(job => job.males > 0 && job.females === 0);
  const femaleJobs = jobs.filter(job => job.females > 0 && job.males === 0);
  const balancedJobs = jobs.filter(job => job.males > 0 && job.females > 0);

  const generalInfo = calculateGeneralInfo(maleJobs, femaleJobs, balancedJobs, jobs);

  if (maleJobs.length <= 3) {
    return {
      isCompliant: false,
      requiresManualReview: true,
      generalInfo,
      statisticalTest: null,
      salaryRangeTest: null,
      exceptionalServiceTest: null,
      totalJobs: jobs.length,
      maleJobs: maleJobs.length,
      femaleJobs: femaleJobs.length,
      message: 'Your jurisdiction has three or fewer male classes. Alternative Analysis (manual review) is required.',
    };
  }

  const statisticalTest = performStatisticalTest(maleJobs, femaleJobs, jobs);
  const salaryRangeTest = performSalaryRangeTest(maleJobs, femaleJobs);
  const exceptionalServiceTest = performExceptionalServiceTest(maleJobs, femaleJobs);

  const isCompliant = salaryRangeTest.passed && exceptionalServiceTest.passed;

  return {
    isCompliant,
    requiresManualReview: false,
    generalInfo,
    statisticalTest,
    salaryRangeTest,
    exceptionalServiceTest,
    totalJobs: jobs.length,
    maleJobs: maleJobs.length,
    femaleJobs: femaleJobs.length,
    message: isCompliant
      ? 'Your jurisdiction is in compliance with pay equity requirements.'
      : 'Your jurisdiction is out of compliance. Please review the test results below.',
  };
}

function performSalaryRangeTest(
  maleJobs: JobClassification[],
  femaleJobs: JobClassification[]
) {
  const threshold = 0.80;

  if (maleJobs.length === 0 || femaleJobs.length === 0) {
    return {
      passed: true,
      maleAverage: 0,
      femaleAverage: 0,
      ratio: 0,
      threshold,
    };
  }

  const maleAvgYearsToMax = maleJobs.reduce((sum, job) => sum + job.years_to_max, 0) / maleJobs.length;
  const femaleAvgYearsToMax = femaleJobs.reduce((sum, job) => sum + job.years_to_max, 0) / femaleJobs.length;

  if (femaleAvgYearsToMax === 0) {
    return {
      passed: true,
      maleAverage: maleAvgYearsToMax,
      femaleAverage: femaleAvgYearsToMax,
      ratio: 0,
      threshold,
    };
  }

  const ratio = maleAvgYearsToMax / femaleAvgYearsToMax;
  const passed = ratio >= threshold;

  return {
    passed,
    maleAverage: maleAvgYearsToMax,
    femaleAverage: femaleAvgYearsToMax,
    ratio,
    threshold,
  };
}

function performExceptionalServiceTest(
  maleJobs: JobClassification[],
  femaleJobs: JobClassification[]
) {
  const threshold = 0.80;

  if (maleJobs.length === 0 || femaleJobs.length === 0) {
    return {
      passed: true,
      malePercentage: 0,
      femalePercentage: 0,
      ratio: 0,
      threshold,
    };
  }

  const maleWithExceptionalService = maleJobs.filter(
    job => job.exceptional_service_category && job.exceptional_service_category.trim() !== ''
  ).length;

  const femaleWithExceptionalService = femaleJobs.filter(
    job => job.exceptional_service_category && job.exceptional_service_category.trim() !== ''
  ).length;

  const malePercentage = (maleWithExceptionalService / maleJobs.length) * 100;
  const femalePercentage = (femaleWithExceptionalService / femaleJobs.length) * 100;

  if (malePercentage <= 20) {
    return {
      passed: true,
      malePercentage,
      femalePercentage,
      ratio: 0,
      threshold,
    };
  }

  if (femalePercentage === 0) {
    return {
      passed: false,
      malePercentage,
      femalePercentage,
      ratio: 0,
      threshold,
    };
  }

  const ratio = femalePercentage / malePercentage;
  const passed = ratio >= threshold;

  return {
    passed,
    malePercentage,
    femalePercentage,
    ratio,
    threshold,
  };
}

function calculateGeneralInfo(
  maleJobs: JobClassification[],
  femaleJobs: JobClassification[],
  balancedJobs: JobClassification[],
  allJobs: JobClassification[]
) {
  const maleEmployees = maleJobs.reduce((sum, job) => sum + job.males, 0);
  const femaleEmployees = femaleJobs.reduce((sum, job) => sum + job.females, 0);
  const balancedEmployees = balancedJobs.reduce((sum, job) => sum + job.males + job.females, 0);
  const totalEmployees = allJobs.reduce((sum, job) => sum + job.males + job.females, 0);

  const avgMaxPayMale = maleJobs.length > 0
    ? maleJobs.reduce((sum, job) => sum + job.max_salary, 0) / maleJobs.length
    : 0;

  const avgMaxPayFemale = femaleJobs.length > 0
    ? femaleJobs.reduce((sum, job) => sum + job.max_salary, 0) / femaleJobs.length
    : 0;

  const avgMaxPayBalanced = balancedJobs.length > 0
    ? balancedJobs.reduce((sum, job) => sum + job.max_salary, 0) / balancedJobs.length
    : 0;

  const avgMaxPayAll = allJobs.length > 0
    ? allJobs.reduce((sum, job) => sum + job.max_salary, 0) / allJobs.length
    : 0;

  return {
    maleClasses: maleJobs.length,
    femaleClasses: femaleJobs.length,
    balancedClasses: balancedJobs.length,
    totalClasses: allJobs.length,
    maleEmployees,
    femaleEmployees,
    balancedEmployees,
    totalEmployees,
    avgMaxPayMale,
    avgMaxPayFemale,
    avgMaxPayBalanced,
    avgMaxPayAll,
  };
}

function calculatePredictedPay(points: number, allJobs: JobClassification[]): number {
  if (allJobs.length < 2) return 0;

  const sumX = allJobs.reduce((sum, job) => sum + job.points, 0);
  const sumY = allJobs.reduce((sum, job) => sum + job.max_salary, 0);
  const sumXY = allJobs.reduce((sum, job) => sum + (job.points * job.max_salary), 0);
  const sumX2 = allJobs.reduce((sum, job) => sum + (job.points * job.points), 0);
  const n = allJobs.length;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return slope * points + intercept;
}

function performStatisticalTest(
  maleJobs: JobClassification[],
  femaleJobs: JobClassification[],
  allJobs: JobClassification[]
) {
  if (maleJobs.length === 0 || femaleJobs.length === 0) {
    return {
      underpaymentRatio: 0,
      maleClassesBelowPredicted: 0,
      femaleClassesBelowPredicted: 0,
      maleTotalClasses: maleJobs.length,
      femaleTotalClasses: femaleJobs.length,
      malePercentBelowPredicted: 0,
      femalePercentBelowPredicted: 0,
      tTestDF: 0,
      tTestValue: 0,
      avgDiffMale: 0,
      avgDiffFemale: 0,
    };
  }

  const maleDiffs: number[] = [];
  const femaleDiffs: number[] = [];

  maleJobs.forEach(job => {
    const predicted = calculatePredictedPay(job.points, allJobs);
    const diff = job.max_salary - predicted;
    maleDiffs.push(diff);
  });

  femaleJobs.forEach(job => {
    const predicted = calculatePredictedPay(job.points, allJobs);
    const diff = job.max_salary - predicted;
    femaleDiffs.push(diff);
  });

  const maleClassesBelowPredicted = maleDiffs.filter(d => d < 0).length;
  const femaleClassesBelowPredicted = femaleDiffs.filter(d => d < 0).length;

  const malePercentBelowPredicted = (maleClassesBelowPredicted / maleJobs.length) * 100;
  const femalePercentBelowPredicted = (femaleClassesBelowPredicted / femaleJobs.length) * 100;

  const underpaymentRatio = femalePercentBelowPredicted === 0
    ? 0
    : (malePercentBelowPredicted / femalePercentBelowPredicted) * 100;

  const avgDiffMale = maleDiffs.reduce((sum, d) => sum + d, 0) / maleDiffs.length;
  const avgDiffFemale = femaleDiffs.reduce((sum, d) => sum + d, 0) / femaleDiffs.length;

  const varMale = maleDiffs.reduce((sum, d) => sum + Math.pow(d - avgDiffMale, 2), 0) / (maleDiffs.length - 1);
  const varFemale = femaleDiffs.reduce((sum, d) => sum + Math.pow(d - avgDiffFemale, 2), 0) / (femaleDiffs.length - 1);

  const pooledSE = Math.sqrt(varMale / maleDiffs.length + varFemale / femaleDiffs.length);
  const tTestValue = pooledSE > 0 ? (avgDiffMale - avgDiffFemale) / pooledSE : 0;
  const tTestDF = maleDiffs.length + femaleDiffs.length - 2;

  return {
    underpaymentRatio,
    maleClassesBelowPredicted,
    femaleClassesBelowPredicted,
    maleTotalClasses: maleJobs.length,
    femaleTotalClasses: femaleJobs.length,
    malePercentBelowPredicted,
    femalePercentBelowPredicted,
    tTestDF,
    tTestValue,
    avgDiffMale,
    avgDiffFemale,
  };
}
