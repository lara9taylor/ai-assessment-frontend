import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import './App.css';

// Stripe Payment Link
const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/9B66oz2Z4caofVYcV74gg00';

// Railway backend URL
const API_BASE_URL = 'https://ai-assessment-backend-v2-production.up.railway.app/api';

// Comprehensive question database
const QUESTIONS = [
  // Business Information (5 questions)
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

  // Check for payment success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const storedBusinessInfo = localStorage.getItem('businessInfo');

    if (paymentSuccess === 'true' && storedBusinessInfo) {
      // Payment successful, restore business info and start questions
      setBusinessInfo(JSON.parse(storedBusinessInfo));
      setCurrentStep('questions');
      localStorage.removeItem('businessInfo');
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

    setLoading(true);
    setError('');

    // Store business info for after payment
    localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
    
    // Redirect to Stripe payment
    window.location.href = STRIPE_PAYMENT_URL;
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

  const generateReport = async () => {
    setCurrentStep('report');
    setReportStatus('generating');
    setReportProgress(0);
    setReportMessage('Initializing comprehensive business analysis...');

    try {
      // First, start the assessment session
      const startResponse = await fetch(`${API_BASE_URL}/start-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_name: businessInfo.businessName,
          contact_email: businessInfo.contactEmail,
          contact_name: businessInfo.contactName
        })
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start assessment');
      }

      const startData = await startResponse.json();
      const sessionId = startData.session_id;

      // Then submit responses
      const submitResponse = await fetch(`${API_BASE_URL}/submit-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          responses: responses
        })
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit responses');
      }

      // Simulate progress updates
      const progressSteps = [
        { progress: 15, message: 'Analyzing business data and responses...' },
        { progress: 30, message: 'Identifying operational pain points...' },
        { progress: 45, message: 'Calculating AI opportunity scores...' },
        { progress: 60, message: 'Generating personalized recommendations...' },
        { progress: 75, message: 'Creating implementation roadmap...' },
        { progress: 90, message: 'Finalizing comprehensive 20+ page report...' },
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
          // Store session ID for download
          localStorage.setItem('sessionId', sessionId);
          setTimeout(() => {
            downloadReport(sessionId);
          }, 1000);
        }
      }, 2000);
    } catch (error) {
      console.error('Error generating report:', error);
      setReportStatus('error');
      setReportMessage('Error generating report. Please try again or contact support.');
    }
  };

  const downloadReport = async (sessionId) => {
    try {
      // Get session ID from parameter or localStorage
      const sid = sessionId || localStorage.getItem('sessionId');
      
      if (!sid) {
        console.error('No session ID found');
        return;
      }

      // Download PDF report from backend
      const downloadUrl = `${API_BASE_URL}/download-report/${sid}`;
      
      // Open download in new window
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `AI_Assessment_Report_${businessInfo.businessName.replace(/\s+/g, '_')}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      localStorage.removeItem('sessionId');
    } catch (error) {
      console.error('Error downloading report:', error);
      setReportMessage('Error downloading report. Please contact support.');
    }
  };

  const renderQuestion = () => {
    const question = QUESTIONS[currentQuestionIndex];
    const currentResponse = responses[question.id] || '';

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / QUESTIONS.length) * 100)}% Complete</span>
          </div>
          <Progress value={((currentQuestionIndex + 1) / QUESTIONS.length) * 100} className="h-2" />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            {question.text}
          </h2>

          {question.type === 'single_select' && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={currentResponse === option ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => handleResponse(question.id, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {question.type === 'multiple_select' && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
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
              className="min-h-[100px]"
            />
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button onClick={nextQuestion}>
            {currentQuestionIndex === QUESTIONS.length - 1 ? 'Generate Report' : 'Continue'}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Section: {question.section.toUpperCase().replace('_', ' ')}
        </div>
      </div>
    );
  };

  const ReportProgress = () => (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Generating Your Report</h2>
        <p className="text-muted-foreground">
          Please wait while we compile your comprehensive AI assessment report...
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{reportProgress}%</span>
          </div>
          <Progress value={reportProgress} className="h-3" />
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">{reportMessage}</p>
          
          {reportStatus === 'generating' && (
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          )}
          
          {reportStatus === 'completed' && (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
              <p className="text-green-600 font-semibold">Report Generated Successfully!</p>
              <p className="text-sm text-muted-foreground">Your download should start automatically.</p>
              <Button onClick={downloadReport} className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (currentStep === 'report') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <ReportProgress />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'questions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            {renderQuestion()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      <div className="assessment-content">
        <div className="landing-page">
          <div className="landing-header">
            <div className="logo-container">
              <img 
                src="/state-ai-strategies-logo.jpg" 
                alt="State AI Strategies" 
                className="logo-image"
              />
            </div>
            <h1 className="landing-title">
              <span className="ai-highlight">AI</span> Readiness Assessment
            </h1>
            <p className="landing-subtitle">
              Discover how AI can transform your business operations and drive growth
            </p>
            
            <div className="value-highlight">
              <h3>
                <img 
                  src="/state-ai-strategies-logo.jpg" 
                  alt="State AI Strategies" 
                  className="inline h-6 w-6 mr-2 brightness-150"
                />
                What You'll Get:
              </h3>
              <ul>
                <li>Comprehensive AI readiness analysis</li>
                <li>Personalized implementation roadmap</li>
                <li>ROI projections and cost-benefit analysis</li>
                <li>Priority recommendations for your industry</li>
                <li>Professional 20+ page detailed report</li>
              </ul>
            </div>
          </div>
          
          <div className="landing-form">
            <div className="form-header">
              <h2 className="form-title">Get Started</h2>
              <p className="form-subtitle">
                Tell us about your business to receive your personalized AI assessment
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Business Name *</label>
                <input
                  type="text"
                  value={businessInfo.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input
                  type="text"
                  value={businessInfo.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={businessInfo.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="Enter your email address"
                  className="form-input"
                />
              </div>
            </div>

            <div className="cta-section">
              <h3 className="cta-title">Professional AI Assessment - $499</h3>
              <p className="cta-description">
                Get a comprehensive analysis of your business operations and discover exactly how AI can transform your company. Our expert assessment includes personalized recommendations, ROI projections, and a detailed implementation roadmap.
              </p>
              
              <button
                onClick={startAssessment}
                disabled={loading}
                className="cta-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Starting Assessment...
                  </>
                ) : (
                  <>
                    Begin Assessment - $499
                    <img 
                      src="/state-ai-strategies-logo.jpg" 
                      alt="State AI Strategies" 
                      className="h-5 w-5"
                    />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="trust-section">
              <p className="trust-text">Professional AI consulting trusted by businesses across industries</p>
              <div className="trust-badges">
                <div className="trust-badge">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Expert Analysis</span>
                </div>
                <div className="trust-badge">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Detailed Report</span>
                </div>
                <div className="trust-badge">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Implementation Roadmap</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

