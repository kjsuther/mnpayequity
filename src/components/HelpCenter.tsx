import { useState } from 'react';
import { Search, Book, FileQuestion, Mail, ExternalLink, ChevronRight } from 'lucide-react';

type HelpCenterProps = {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
};

type HelpArticle = {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
};

const helpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'What is the Minnesota Local Government Pay Equity Act?',
    category: 'Getting Started',
    content: 'The Minnesota Local Government Pay Equity Act (Minnesota Statutes 471.991-471.999) requires local governments to ensure equitable compensation between female-dominated and male-dominated job classes of comparable work value. All political subdivisions with more than one female job class must submit annual pay equity reports.',
    keywords: ['law', 'act', 'requirements', 'basics', 'overview'],
  },
  {
    id: '2',
    title: 'Which employees must be included in the report?',
    category: 'Employee Eligibility',
    content: 'Include all employees who meet these criteria: Regular employees who work at least 67 days per year AND at least 14 hours per week on average. Student employees who work at least 100 days per year AND at least 14 hours per week on average. Exclude temporary, seasonal, or casual employees who don\'t meet these minimums.',
    keywords: ['eligibility', 'employees', 'requirements', '67 days', '14 hours', 'students'],
  },
  {
    id: '3',
    title: 'How are job classes categorized by gender?',
    category: 'Job Classifications',
    content: 'Job classes are categorized as: Male-dominated: 70% or more employees are male. Female-dominated: 70% or more employees are female. Balanced: Neither gender represents 70% or more. This categorization is based on the actual employee count in each job class, not the nature of the work itself.',
    keywords: ['gender', 'male', 'female', 'balanced', '70%', 'dominated'],
  },
  {
    id: '4',
    title: 'What are job evaluation points?',
    category: 'Job Evaluation',
    content: 'Job evaluation points represent the relative value of each job class based on four factors: Skill (education, training, experience required), Effort (physical and mental demands), Responsibility (accountability and decision-making), and Working Conditions (physical environment and hazards). Your jurisdiction should use a consistent, approved job evaluation system to assign points.',
    keywords: ['points', 'evaluation', 'skill', 'effort', 'responsibility', 'working conditions'],
  },
  {
    id: '5',
    title: 'How should I enter salary information?',
    category: 'Salary Data',
    content: 'Enter all salaries as monthly amounts. For hourly employees, convert using: (Hourly Rate × Hours per Week × 52 weeks) ÷ 12 months. Enter both minimum and maximum salary for each job class. If there\'s no salary range (only one pay rate), enter the same amount for both minimum and maximum.',
    keywords: ['salary', 'wage', 'monthly', 'hourly', 'conversion', 'pay'],
  },
  {
    id: '6',
    title: 'What is the Statistical Analysis Test?',
    category: 'Compliance Tests',
    content: 'The Statistical Analysis Test compares the percentage of male-dominated and female-dominated job classes that fall below their predicted pay (based on job value). The underpayment ratio must be 80% or less to pass. This test ensures that female-dominated classes aren\'t systematically underpaid compared to male-dominated classes of similar value.',
    keywords: ['statistical', 'test', 'underpayment', 'ratio', '80%', 'predicted pay'],
  },
  {
    id: '7',
    title: 'What is the Salary Range Test?',
    category: 'Compliance Tests',
    content: 'The Salary Range Test compares the average number of years it takes to reach maximum salary in male-dominated versus female-dominated job classes. The ratio must be between 110% and 140% to pass. This ensures that neither gender faces unreasonably long advancement periods.',
    keywords: ['salary range', 'test', 'years to max', '110%', '140%', 'advancement'],
  },
  {
    id: '8',
    title: 'What is Exceptional Service Pay (ESP)?',
    category: 'Compensation',
    content: 'Exceptional Service Pay is additional compensation beyond regular salary for longevity, special skills, certifications, or exceptional performance. Common types include: longevity pay, certification pay, shift differential, bilingual pay, and education pay. The ESP test ensures these opportunities are distributed equitably between male and female-dominated classes.',
    keywords: ['ESP', 'exceptional service', 'longevity', 'certification', 'differential'],
  },
  {
    id: '9',
    title: 'What if my jurisdiction fails a compliance test?',
    category: 'Troubleshooting',
    content: 'Failing a test means pay disparities exist between male and female-dominated classes. You should: 1) Identify the specific classes contributing to the failure, 2) Review and adjust compensation structures, 3) Budget for equity adjustments, 4) Consider multi-year implementation plans if immediate changes aren\'t feasible, 5) Consult with MMB Pay Equity Unit for guidance, 6) Document all corrective actions taken.',
    keywords: ['fail', 'failed', 'out of compliance', 'fix', 'correct', 'adjust'],
  },
  {
    id: '10',
    title: 'When is the report due?',
    category: 'Deadlines',
    content: 'Pay equity reports are due by January 31st each year. The report should reflect data as of December 31st of the previous year. Late submissions may result in non-compliance penalties. Plan to start gathering data in November or December to ensure timely submission.',
    keywords: ['deadline', 'due date', 'january 31', 'when', 'submit'],
  },
  {
    id: '11',
    title: 'How do I handle benefits in the report?',
    category: 'Benefits',
    content: 'You can optionally include the cash value of benefits in your salary calculations. If you include benefits, you must: 1) Use the same methodology for all job classes, 2) Calculate the monthly employer cost for each benefit, 3) Add these values to the "Benefits Included in Salary" field, 4) Be consistent year-over-year. Common benefits include health insurance, dental, life insurance, and retirement contributions.',
    keywords: ['benefits', 'insurance', 'health', 'dental', 'retirement', 'value'],
  },
  {
    id: '12',
    title: 'Can I copy job data from a previous year?',
    category: 'Data Entry',
    content: 'Yes! The system allows you to copy job classifications from a previous year\'s report. This is helpful if your job structure hasn\'t changed significantly. After copying, you must review and update: employee counts (males, females, non-binary), salary amounts (if there were raises), and any other changed information. Always verify that copied data is current and accurate.',
    keywords: ['copy', 'previous year', 'import', 'reuse', 'duplicate'],
  },
];

export function HelpCenter({ isOpen, onClose, context }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  if (!isOpen) return null;

  const categories = Array.from(new Set(helpArticles.map((a) => a.category)));

  const filteredArticles = helpArticles.filter((article) => {
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const contextualArticles = context
    ? helpArticles.filter((article) =>
        article.keywords.some((k) => context.toLowerCase().includes(k))
      ).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003865] rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-4 h-full">
            <div className="border-r border-gray-200 p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedArticle(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === null
                      ? 'bg-[#003865] text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Articles
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedArticle(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#003865] text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 p-6">
              {selectedArticle ? (
                <div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="text-[#003865] hover:text-[#004d7a] mb-4 text-sm"
                  >
                    ← Back to articles
                  </button>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mb-3">
                    {selectedArticle.category}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedArticle.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedArticle.content}
                  </p>
                </div>
              ) : (
                <div>
                  {contextualArticles.length > 0 && !searchQuery && !selectedCategory && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3">
                        Related to what you're working on:
                      </h3>
                      <div className="space-y-2">
                        {contextualArticles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-900 font-medium">
                                {article.title}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedCategory
                      ? `${selectedCategory} Articles`
                      : searchQuery
                      ? `Search Results (${filteredArticles.length})`
                      : 'All Help Articles'}
                  </h3>

                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-12">
                      <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No articles found</p>
                      <p className="text-sm text-gray-500">
                        Try a different search term or browse by category
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium mb-2">
                                {article.category}
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-[#003865]">
                                {article.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {article.content}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-3 mt-1 group-hover:text-[#003865]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg">
              <Mail className="w-6 h-6 text-[#003865] flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Still need help?</p>
                <p className="text-xs text-gray-600">Contact: payequity.mmb@state.mn.us</p>
              </div>
            </div>
            <a
              href="https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#003865] transition-colors"
            >
              <ExternalLink className="w-6 h-6 text-[#003865] flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Official Resources</p>
                <p className="text-xs text-gray-600">Visit MMB Pay Equity website</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
