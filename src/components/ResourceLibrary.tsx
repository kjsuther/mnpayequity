import { FileText, ExternalLink, Download, BookOpen } from 'lucide-react';

type ResourceLibraryProps = {
  context?: string;
  compact?: boolean;
};

type Resource = {
  title: string;
  description: string;
  url: string;
  keywords: string[];
  category: string;
};

const resources: Resource[] = [
  {
    title: 'Local Government Pay Equity Act',
    description: 'Official Minnesota statute and regulations governing local government pay equity requirements.',
    url: 'https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/local-government/',
    keywords: ['law', 'statute', 'regulation', 'requirements', 'basics'],
    category: 'Legal Requirements',
  },
  {
    title: 'Instructions for Submitting a Report',
    description: 'Step-by-step guide for completing and submitting your local government pay equity report.',
    url: 'https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf',
    keywords: ['submit', 'submission', 'instructions', 'how to', 'report'],
    category: 'Reporting Instructions',
  },
  {
    title: 'State Job Match Evaluation System',
    description: 'Detailed guide to the State Job Match system for evaluating job classifications and assigning points.',
    url: 'https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf',
    keywords: ['points', 'evaluation', 'job match', 'classification', 'system'],
    category: 'Job Evaluation',
  },
  {
    title: 'Guide to Understanding Pay Equity Compliance',
    description: 'Comprehensive guide explaining how to understand and achieve pay equity compliance.',
    url: 'https://mn.gov/mmb-stat/pay-equity/guide-understand-compl.pdf',
    keywords: ['compliance', 'understanding', 'guide', 'requirements'],
    category: 'Compliance',
  },
  {
    title: 'How to Interpret Your Results',
    description: 'Detailed explanation of test results and what they mean for your jurisdiction.',
    url: 'https://mn.gov/mmb-stat/pay-equity/interpret-results-pay%20equity.pdf',
    keywords: ['results', 'interpret', 'tests', 'analysis', 'understand'],
    category: 'Compliance',
  },
  {
    title: 'Pay Equity Contact Information',
    description: 'Contact the MMB Pay Equity Unit for assistance with your report or compliance questions.',
    url: 'https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/',
    keywords: ['contact', 'help', 'support', 'questions', 'assistance'],
    category: 'Support',
  },
];

export function ResourceLibrary({ context, compact = false }: ResourceLibraryProps) {
  const relevantResources = context
    ? resources.filter((resource) =>
        resource.keywords.some((keyword) => context.toLowerCase().includes(keyword))
      )
    : resources;

  const displayResources = compact ? relevantResources.slice(0, 3) : relevantResources;

  if (compact && displayResources.length === 0) {
    return null;
  }

  return (
    <div className={`${compact ? '' : 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'}`}>
      {!compact && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#003865] rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Official Resources</h2>
            <p className="text-sm text-gray-600">Minnesota Management & Budget guidance documents</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {displayResources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-4 border border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all group ${
              compact ? 'bg-white' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#003865] transition-colors">
                    {resource.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#003865] transition-colors" />
                </div>
                <p className="text-sm text-gray-600">{resource.description}</p>
                {!compact && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {resource.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>

      {compact && relevantResources.length > 3 && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600">
            + {relevantResources.length - 3} more resources available
          </p>
        </div>
      )}

      {!compact && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">Need Direct Assistance?</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <p><strong>Pay Equity Unit</strong></p>
            <p>Minnesota Management and Budget</p>
            <p>Phone: <a href="tel:651-259-3824" className="underline hover:text-blue-900">651-259-3824</a></p>
            <p>Email: <a href="mailto:payequity.mmb@state.mn.us" className="underline hover:text-blue-900">payequity.mmb@state.mn.us</a></p>
          </div>
        </div>
      )}
    </div>
  );
}
