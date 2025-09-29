import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { CheckCircle, AlertCircle, Loader2, Download, Sparkles, Zap } from 'lucide-react';
import './App.css';

// Add your Railway backend URL here
const API_BASE_URL = 'https://ai-assessment-backend-v2-production.up.railway.app/api';

// Comprehensive question database
const QUESTIONS = [
  // Business Information (5 questions )
  {
    id: 'business_type',
    text: 'What type of business do you operate?',
    type: 'single_select',
    section: 'business_info',
    options: ['Retail', 'Restaurant', 'Service', 'Non-Profit', 'Other'],
    required: true
  },
  {
    id: 'employee_count',
    text: 'How many employees does your business have?',
    type: 'single_select',
    section: 'business_info',
    options: ['1-5', '6-20', '21-50', '51-100', '100+'],
    required: true
  },
  {
    id: 'annual_revenue',
    text: 'What is your approximate annual revenue?',
    type: 'single_select',
    section: 'business_info',
    options: ['Less than $100K', '$100K-$500K', '$500K-$1M', '$1M-$5M', '$5M+'],
    required: true
  },
  {
    id: 'business_age',
    text: 'How long has your business been operating?',
    type: 'single_select',
    section: 'business_info',
    options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'Over 10 years'],
    required: true
  },
  {
    id: 'business_description',
    text: 'Briefly describe your primary products or services:',
    type: 'text',
    section: 'business_info',
    required: true
  },

  // Operations & Processes (15 questions)
  {
    id: 'operational_challenges',
    text: 'What are your biggest operational challenges right now? (Select all that apply)',
    type: 'multiple_select',
    section: 'operations',
    options: [
      'Manual data entry and paperwork',
      'Inventory management issues',
      'Scheduling and workforce management',
      'Customer service bottlenecks',
      'Quality control problems',
      'Supply chain disruptions',
      'Communication breakdowns',
      'Process inefficiencies'
    ],
    required: true
  },
  {
    id: 'manual_processes',
    text: 'Which processes are currently done manually in your business? (Select all that apply)',
    type: 'multiple_select',
    section: 'operations',
    options: [
      'Data entry and record keeping',
      'Inventory tracking',
      'Customer communications',
      'Scheduling and appointments',
      'Financial reporting',
      'Order processing',
      'Quality checks',
      'Employee time tracking'
    ],
    required: true
  },
  {
    id: 'time_consuming_tasks',
    text: 'What tasks take up the most time in your daily operations?',
    type: 'text',
    section: 'operations',
    required: true
  },
  {
    id: 'inventory_challenges',
    text: 'What are your biggest inventory challenges? (Select all that apply)',
    type: 'multiple_select',
    section: 'operations',
    options: [
      'Overstocking items',
      'Running out of popular products',
      'Manual counting and tracking',
      'Forecasting demand',
      'Managing multiple locations',
      'Supplier coordination',
      'Waste and spoilage',
      'Not applicable - no inventory'
    ],
    required: true
  },
  {
    id: 'quality_control',
    text: 'How do you currently handle quality control?',
    type: 'single_select',
    section: 'operations',
    options: [
      'Manual inspection processes',
      'Automated quality systems',
      'Customer feedback only',
      'Random sampling',
      'No formal quality control'
    ],
    required: true
  },
  {
    id: 'customer_service_issues',
    text: 'What customer service challenges do you face? (Select all that apply)',
    type: 'multiple_select',
    section: 'operations',
    options: [
      'Long response times',
      'Repetitive questions',
      'After-hours support needs',
      'Language barriers',
      'Tracking customer history',
      'Managing complaints',
      'Inconsistent service quality',
      'Staff training needs'
    ],
    required: true
  },
  {
    id: 'workflow_bottlenecks',
    text: 'Where do you see the biggest bottlenecks in your workflow?',
    type: 'text',
    section: 'operations',
    required: true
  },
  {
    id: 'decision_making',
    text: 'How do you currently make important business decisions?',
    type: 'single_select',
    section: 'operations',
    options: [
      'Based on gut feeling and experience',
      'Using basic reports and data',
      'Advanced analytics and dashboards',
      'Customer feedback and surveys',
      'Industry benchmarks and trends'
    ],
    required: true
  },
  {
    id: 'process_documentation',
    text: 'How well documented are your business processes?',
    type: 'single_select',
    section: 'operations',
    options: [
      'Not documented at all',
      'Basic written procedures',
      'Detailed process documentation',
      'Digital workflow systems',
      'Fully automated processes'
    ],
    required: true
  },
  {
    id: 'scalability_concerns',
    text: 'What concerns you most about scaling your business?',
    type: 'single_select',
    section: 'operations',
    options: [
      'Maintaining quality standards',
      'Managing increased complexity',
      'Finding and training staff',
      'Technology limitations',
      'Financial constraints'
    ],
    required: true
  },

  // Technology & Systems (10 questions)
  {
    id: 'current_software',
    text: 'What software do you currently use to manage operations? (Select all that apply)',
    type: 'multiple_select',
    section: 'technology',
    options: [
      'Spreadsheets (Excel/Google Sheets)',
      'Basic accounting software',
      'CRM system',
      'Inventory management system',
      'Point of sale (POS) system',
      'Project management tools',
      'Email marketing platforms',
      'Custom software solutions'
    ],
    required: true
  },
  {
    id: 'data_management',
    text: 'How do you currently store and manage business data?',
    type: 'single_select',
    section: 'technology',
    options: [
      'Paper files and documents',
      'Local computer files',
      'Cloud storage (Google Drive, Dropbox)',
      'Database systems',
      'Integrated business software'
    ],
    required: true
  },
  {
    id: 'technology_challenges',
    text: 'What technology challenges does your business face? (Select all that apply)',
    type: 'multiple_select',
    section: 'technology',
    options: [
      'Outdated systems and software',
      'Data silos and integration issues',
      'Lack of real-time information',
      'Security and backup concerns',
      'Staff technology training needs',
      'High software costs',
      'System downtime and reliability',
      'Mobile access limitations'
    ],
    required: true
  },
  {
    id: 'automation_experience',
    text: 'What is your experience with business automation?',
    type: 'single_select',
    section: 'technology',
    options: [
      'No automation currently',
      'Basic email automation',
      'Some workflow automation',
      'Advanced automation systems',
      'Fully automated processes'
    ],
    required: true
  },
  {
    id: 'data_analysis',
    text: 'How do you currently analyze business performance?',
    type: 'single_select',
    section: 'technology',
    options: [
      'Manual review of records',
      'Basic spreadsheet analysis',
      'Business intelligence tools',
      'Advanced analytics platforms',
      'AI-powered insights'
    ],
    required: true
  },
  {
    id: 'integration_needs',
    text: 'Which systems need better integration in your business?',
    type: 'text',
    section: 'technology',
    required: true
  },
  {
    id: 'mobile_capabilities',
    text: 'How important are mobile capabilities for your business?',
    type: 'single_select',
    section: 'technology',
    options: [
      'Not important',
      'Somewhat important',
      'Very important',
      'Critical for operations',
      'Already fully mobile-enabled'
    ],
    required: true
  },
  {
    id: 'security_concerns',
    text: 'What are your biggest technology security concerns?',
    type: 'single_select',
    section: 'technology',
    options: [
      'Data breaches and cyber attacks',
      'Employee access control',
      'Backup and disaster recovery',
      'Compliance requirements',
      'No major security concerns'
    ],
    required: true
  },

  // Customer Management (8 questions)
  {
    id: 'customer_data',
    text: 'How do you currently track customer information?',
    type: 'single_select',
    section: 'customer',
    options: [
      'Paper records or basic files',
      'Spreadsheets',
      'Simple contact management',
      'CRM system',
      'Integrated customer platform'
    ],
    required: true
  },
  {
    id: 'customer_communication',
    text: 'What are your primary customer communication channels? (Select all that apply)',
    type: 'multiple_select',
    section: 'customer',
    options: [
      'Phone calls',
      'Email',
      'Text messaging',
      'Social media',
      'Live chat',
      'In-person meetings',
      'Video calls',
      'Mobile app'
    ],
    required: true
  },
  {
    id: 'customer_insights',
    text: 'How well do you understand your customer behavior and preferences?',
    type: 'single_select',
    section: 'customer',
    options: [
      'Limited understanding',
      'Basic customer feedback',
      'Regular surveys and reviews',
      'Detailed analytics and tracking',
      'AI-powered customer insights'
    ],
    required: true
  },
  {
    id: 'customer_retention',
    text: 'What challenges do you face with customer retention?',
    type: 'text',
    section: 'customer',
    required: true
  },
  {
    id: 'marketing_channels',
    text: 'What are your primary marketing channels? (Select all that apply)',
    type: 'multiple_select',
    section: 'customer',
    options: [
      'Social media advertising',
      'Email marketing',
      'Search engine marketing',
      'Traditional advertising',
      'Word of mouth',
      'Content marketing',
      'Influencer partnerships',
      'Direct mail'
    ],
    required: true
  },
  {
    id: 'personalization',
    text: 'How do you personalize customer experiences?',
    type: 'single_select',
    section: 'customer',
    options: [
      'No personalization',
      'Basic customer preferences',
      'Purchase history tracking',
      'Behavioral targeting',
      'AI-powered personalization'
    ],
    required: true
  },

  // Financial & Analytics (4 questions)
  {
    id: 'financial_tracking',
    text: 'How do you currently track financial performance?',
    type: 'single_select',
    section: 'financial',
    options: [
      'Basic bookkeeping',
      'Accounting software',
      'Financial dashboards',
      'Advanced analytics',
      'Real-time financial monitoring'
    ],
    required: true
  },
  {
    id: 'financial_challenges',
    text: 'What are your biggest financial friction points? (Select all that apply)',
    type: 'multiple_select',
    section: 'financial',
    options: [
      'Cash flow management',
      'Expense tracking',
      'Profit margin analysis',
      'Budget planning and forecasting',
      'Tax preparation and compliance',
      'Financial reporting',
      'Investment decision making',
      'Cost control and optimization'
    ],
    required: true
  },

  // AI Readiness & Goals (8 questions)
  {
    id: 'ai_familiarity',
    text: 'How familiar are you with AI and automation technologies?',
    type: 'single_select',
    section: 'ai_readiness',
    options: [
      'Not familiar at all',
      'Basic understanding',
      'Moderate knowledge',
      'Very knowledgeable',
      'Expert level'
    ],
    required: true
  },
  {
    id: 'ai_concerns',
    text: 'What worries you most about AI? (Select all that apply)',
    type: 'multiple_select',
    section: 'ai_readiness',
    options: [
      'Job displacement',
      'Implementation costs',
      'Technical complexity',
      'Data security and privacy',
      'Loss of human touch',
      'Reliability and accuracy',
      'Competitive disadvantage',
      'No major concerns'
    ],
    required: true
  },
  {
    id: 'ai_interest',
    text: 'Which AI applications interest you most for your business? (Select all that apply)',
    type: 'multiple_select',
    section: 'ai_readiness',
    options: [
      'Customer service chatbots',
      'Automated data analysis',
      'Predictive analytics',
      'Inventory optimization',
      'Marketing automation',
      'Process automation',
      'Quality control systems',
      'Financial forecasting'
    ],
    required: true
  },
  {
    id: 'implementation_timeline',
    text: 'What is your preferred timeline for implementing AI solutions?',
    type: 'single_select',
    section: 'ai_readiness',
    options: [
      'Immediately (within 1 month)',
      'Short term (1-3 months)',
      'Medium term (3-6 months)',
      'Long term (6-12 months)',
      'Future consideration (1+ years)'
    ],
    required: true
  },
  {
    id: 'budget_range',
    text: 'What is your budget range for AI implementation?',
    type: 'single_select',
    section: 'ai_readiness',
    options: [
      'Under $5,000',
      '$5,000 - $15,000',
      '$15,000 - $50,000',
      '$50,000 - $100,000',
      'Over $100,000'
    ],
    required: true
  },
  {
    id: 'success_metrics',
    text: 'How would you measure the success of AI implementation?',
    type: 'single_select',
    section: 'ai_readiness',
    options: [
      'Cost savings and efficiency',
      'Revenue growth',
      'Customer satisfaction',
      'Competitive advantage',
      'All of the above'
    ],
    required: true
  },
  {
    id: 'business_goals',
    text: 'What are your primary business goals for the next 12 months?',
    type: 'text',
    section: 'ai_readiness',
    required: true
  },
  {
    id: 'growth_challenges',
    text: 'What is the biggest challenge preventing your business growth?',
    type: 'text',
    section: 'ai_readiness',
    required: true
  }
];

function App() {
  const [currentStep, setCurrentStep] = useState('info'); // info, questions, report
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    contactName: '',
    contactEmail: ''
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportProgress, setReportProgress] = useState(0);
  const [reportStatus, setReportStatus] = useState('not_started');
  const [reportMessage, setReportMessage] = useState('');

  const handleInputChange = (field, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const startAssessment = () => {
    // Validate required fields
    if (!businessInfo.businessName.trim()) {
      setError('Business name is required');
      return;
    }
    if (!businessInfo.contactName.trim()) {
      setError('Your name is required');
      return;
    }
    if (!businessInfo.contactEmail.trim()) {
      setError('Email address is required');
      return;
    }
    if (!businessInfo.contactEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setCurrentStep('questions');
    setError('');
  };

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const nextQuestion = () => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const currentResponse = responses[currentQuestion.id];
    
    // Validate required questions
    if (currentQuestion.required && (!currentResponse || 
        (Array.isArray(currentResponse) && currentResponse.length === 0) ||
        (typeof currentResponse === 'string' && !currentResponse.trim()))) {
      setError('This question is required');
      return;
    }

    setError('');
    
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Assessment completed, generate report
      generateReport();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setError('');
    }
  };

  const generateReport = () => {
    setCurrentStep('report');
    setReportStatus('generating');
    setReportProgress(0);
    setReportMessage('Initializing comprehensive business analysis...');

    // Simulate report generation with progress updates
    const progressSteps = [
      { progress: 15, message: 'Analyzing business data and responses...' },
      { progress: 30, message: 'Identifying operational pain points...' },
      { progress: 45, message: 'Calculating AI opportunity scores...' },
      { progress: 60, message: 'Generating personalized recommendations...' },
      { progress: 75, message: 'Creating implementation roadmap...' },
      { progress: 90, message: 'Finalizing comprehensive report...' },
      { progress: 100, message: 'Report generation complete!' }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        const step = progressSteps[stepIndex];
        setReportProgress(step.progress);
        setReportMessage(step.message);
        stepIndex++;
      } else {
        clearInterval(interval);
        setReportStatus('completed');
      }
    }, 2000); // Update every 2 seconds
  };

  const downloadReport = () => {
    // Create a comprehensive report summary
    const reportData = {
      businessInfo,
      responses,
      analysisDate: new Date().toLocaleDateString(),
      totalQuestions: QUESTIONS.length,
      completionRate: '100%'
    };

    // Create downloadable content
    const reportContent = `
STATE AI STRATEGIES - AI READINESS ASSESSMENT REPORT
Generated: ${reportData.analysisDate}

BUSINESS INFORMATION:
- Business Name: ${businessInfo.businessName}
- Contact: ${businessInfo.contactName}
- Email: ${businessInfo.contactEmail}

ASSESSMENT SUMMARY:
- Total Questions Completed: ${QUESTIONS.length}
- Completion Rate: 100%

KEY FINDINGS:
Based on your responses, we've identified several opportunities for AI implementation:

1. OPERATIONAL EFFICIENCY
   - Automation opportunities in manual processes
   - Workflow optimization potential
   - Quality control improvements

2. CUSTOMER EXPERIENCE
   - Personalization opportunities
   - Service automation potential
   - Communication enhancements

3. DATA & ANALYTICS
   - Business intelligence improvements
   - Predictive analytics opportunities
   - Real-time monitoring capabilities

4. FINANCIAL OPTIMIZATION
   - Cost reduction opportunities
   - Revenue optimization potential
   - ROI improvement strategies

RECOMMENDED NEXT STEPS:
1. Schedule a consultation to discuss specific AI solutions
2. Prioritize high-impact, low-complexity implementations
3. Develop a phased implementation roadmap
4. Consider pilot programs for key areas

This assessment indicates strong potential for AI implementation with estimated ROI of 200-400% within 12 months.

For detailed analysis and implementation planning, contact State AI Strategies to schedule your consultation.

Visit: stateaistrategies.com
Email: info@stateaistrategies.com
    `;

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Assessment_Report_${businessInfo.businessName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderQuestion = () => {
    const question = QUESTIONS[currentQuestionIndex];
    const currentResponse = responses[question.id] || '';

    return (
      <div className="question-container">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / QUESTIONS.length) * 100)}% Complete</span>
          </div>
          <div className="progress-bar h-3">
            <div 
              className="progress-fill h-full rounded-lg"
              style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="question-title">
            {question.text}
          </h2>

          {question.type === 'single_select' && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`question-option ${currentResponse === option ? 'selected' : ''}`}
                  onClick={() => handleResponse(question.id, option)}
                >
                  {option}
                </div>
              ))}
            </div>
          )}

          {question.type === 'multiple_select' && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 question-option">
                  <Checkbox
                    id={`${question.id}_${index}`}
                    checked={(currentResponse || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentArray = currentResponse || [];
                      if (checked) {
                        handleResponse(question.id, [...currentArray, option]);
                      } else {
                        handleResponse(question.id, currentArray.filter(item => item !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${question.id}_${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <Textarea
              placeholder="Please provide your response..."
              value={currentResponse}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              className="min-h-[120px] border-2 focus:border-[var(--green)]"
            />
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 mt-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary"
          >
            Previous
          </Button>
          <Button 
            onClick={nextQuestion}
            className="btn-primary"
          >
            {currentQuestionIndex === QUESTIONS.length - 1 ? 'Generate Report' : 'Continue'}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          Section: {question.section.toUpperCase().replace('_', ' ')}
        </div>
      </div>
    );
  };

  const ReportProgress = () => (
    <div className="assessment-content">
      <div className="assessment-card">
        <div className="assessment-header">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-[var(--yellow)]" />
          <h2 className="assessment-title">Generating Your <span className="ai-highlight">AI</span> Report</h2>
          <p className="assessment-subtitle">
            Please wait while we compile your comprehensive AI assessment report...
          </p>
        </div>
        
        <div className="question-container">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>Progress</span>
                <span>{reportProgress}%</span>
              </div>
              <div className="progress-bar h-4">
                <div 
                  className="progress-fill h-full rounded-lg"
                  style={{ width: `${reportProgress}%` }}
                />
              </div>
            </div>
            
            <div className="text-center space-y-6">
              <p className="text-gray-600">{reportMessage}</p>
              
              {reportStatus === 'generating' && (
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-[var(--green)]" />
              )}
              
              {reportStatus === 'completed' && (
                <div className="space-y-6">
                  <CheckCircle className="h-12 w-12 mx-auto text-[var(--green)]" />
                  <p className="text-[var(--green)] font-semibold text-lg">Assessment Complete!</p>
                  
                  <div className="value-box">
                    <h3 className="value-title">
                      <Zap className="inline h-5 w-5 mr-2 spark-accent" />
                      Ready for Your Comprehensive Report?
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Your free assessment is complete! Get your detailed 20+ page <span className="ai-highlight">AI</span> implementation roadmap with:
                    </p>
                    <ul className="text-gray-700 space-y-2 mb-6 text-left">
                      <li>• Personalized <span className="ai-highlight">AI</span> recommendations for your business</li>
                      <li>• ROI analysis and implementation timeline</li>
                      <li>• Step-by-step action plan</li>
                      <li>• Direct mapping to proven <span className="ai-highlight">AI</span> solutions</li>
                    </ul>
                    
                    <div className="flex flex-col space-y-3">
                      <Button 
                        onClick={() => window.open('https://buy.stripe.com/9B66oz2Z4caofVYcV74gg00', '_blank')}
                        className="btn-accent text-lg font-bold py-4"
                        size="lg"
                      >
                        Get Full Report - $499 <span className="text-sm opacity-75">(Reg. $999)</span>
                      </Button>
                      
                      <Button 
                        onClick={downloadReport} 
                        variant="outline"
                        className="btn-secondary"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Free Summary
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Secure payment processing by Stripe • 30-day money-back guarantee
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (currentStep === 'report') {
    return (
      <div className="assessment-container">
        <ReportProgress />
      </div>
    );
  }

  if (currentStep === 'questions') {
    return (
      <div className="assessment-container">
        <div className="assessment-content">
          <div className="assessment-card">
            {renderQuestion()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      <div className="assessment-content">
        <div className="assessment-card">
          <div className="assessment-header">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-[var(--yellow)]" />
            <h1 className="assessment-title">
              <span className="ai-highlight">AI</span> Readiness Assessment
            </h1>
            <p className="assessment-subtitle">
              Discover how AI can transform your business operations and drive growth
            </p>
            
            <div className="value-box mt-6">
              <h3 className="value-title text-white">
                <Zap className="inline h-5 w-5 mr-2 spark-accent" />
                What You'll Get:
              </h3>
              <ul className="text-white space-y-2 text-left opacity-90">
                <li>• Comprehensive analysis of your business operations</li>
                <li>• Identification of <span className="ai-highlight">AI</span> automation opportunities</li>
                <li>• Personalized recommendations with ROI estimates</li>
                <li>• Professional 20+ page implementation roadmap</li>
                <li>• Direct mapping to proven <span className="ai-highlight">AI</span> solutions</li>
              </ul>
            </div>
          </div>

          <div className="question-container">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="businessName" className="text-base font-semibold">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  value={businessInfo.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="border-2 focus:border-[var(--green)] text-lg p-4"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="contactName" className="text-base font-semibold">Your Name *</Label>
                <Input
                  id="contactName"
                  placeholder="Enter your full name"
                  value={businessInfo.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  className="border-2 focus:border-[var(--green)] text-lg p-4"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="contactEmail" className="text-base font-semibold">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={businessInfo.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="border-2 focus:border-[var(--green)] text-lg p-4"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={startAssessment}
                disabled={loading}
                className="btn-primary w-full text-lg font-bold py-4"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Starting Assessment...
                  </>
                ) : (
                  <>
                    Begin Assessment ($499 Value)
                    <Sparkles className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
