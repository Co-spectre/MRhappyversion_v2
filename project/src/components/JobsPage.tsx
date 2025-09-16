import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Send, 
  ChefHat, 
  ShoppingCart, 
  Star,
  Phone,
  Mail,
  User,
  FileText,
  Calendar,
  CheckCircle,
  Euro
} from 'lucide-react';

interface JobApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  availability: string;
  motivation: string;
  previousExperience: string;
  expectedSalary: string;
}

interface JobPosition {
  id: string;
  title: string;
  department: string;
  type: 'full-time' | 'part-time' | 'student';
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  icon: React.ReactNode;
}

const JobsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [showApplication, setShowApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<JobApplication>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    availability: '',
    motivation: '',
    previousExperience: '',
    expectedSalary: ''
  });

  const jobPositions: JobPosition[] = [
    {
      id: 'chef',
      title: t('jobs.positions.chef.title'),
      department: t('jobs.positions.chef.department'),
      type: 'full-time',
      location: 'Bremen City Center',
      salary: '€2,800 - €3,500',
      description: t('jobs.positions.chef.description'),
      requirements: [
        t('jobs.positions.chef.req1'),
        t('jobs.positions.chef.req2'),
        t('jobs.positions.chef.req3'),
        t('jobs.positions.chef.req4')
      ],
      benefits: [
        t('jobs.benefits.insurance'),
        t('jobs.benefits.vacation'),
        t('jobs.benefits.meals'),
        t('jobs.benefits.training')
      ],
      icon: <ChefHat className="w-6 h-6" />
    },
    {
      id: 'server',
      title: t('jobs.positions.server.title'),
      department: t('jobs.positions.server.department'),
      type: 'part-time',
      location: 'All Locations',
      salary: '€12 - €15 /hour',
      description: t('jobs.positions.server.description'),
      requirements: [
        t('jobs.positions.server.req1'),
        t('jobs.positions.server.req2'),
        t('jobs.positions.server.req3'),
        t('jobs.positions.server.req4')
      ],
      benefits: [
        t('jobs.benefits.flexible'),
        t('jobs.benefits.tips'),
        t('jobs.benefits.meals'),
        t('jobs.benefits.growth')
      ],
      icon: <Users className="w-6 h-6" />
    },
    {
      id: 'delivery',
      title: t('jobs.positions.delivery.title'),
      department: t('jobs.positions.delivery.department'),
      type: 'part-time',
      location: 'Bremen Area',
      salary: '€10 - €13 /hour',
      description: t('jobs.positions.delivery.description'),
      requirements: [
        t('jobs.positions.delivery.req1'),
        t('jobs.positions.delivery.req2'),
        t('jobs.positions.delivery.req3'),
        t('jobs.positions.delivery.req4')
      ],
      benefits: [
        t('jobs.benefits.flexible'),
        t('jobs.benefits.tips'),
        t('jobs.benefits.fuel'),
        t('jobs.benefits.bonus')
      ],
      icon: <ShoppingCart className="w-6 h-6" />
    },
    {
      id: 'manager',
      title: t('jobs.positions.manager.title'),
      department: t('jobs.positions.manager.department'),
      type: 'full-time',
      location: 'Bremen Locations',
      salary: '€3,200 - €4,000',
      description: t('jobs.positions.manager.description'),
      requirements: [
        t('jobs.positions.manager.req1'),
        t('jobs.positions.manager.req2'),
        t('jobs.positions.manager.req3'),
        t('jobs.positions.manager.req4')
      ],
      benefits: [
        t('jobs.benefits.insurance'),
        t('jobs.benefits.vacation'),
        t('jobs.benefits.bonus'),
        t('jobs.benefits.leadership')
      ],
      icon: <Star className="w-6 h-6" />
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJobSelect = (job: JobPosition) => {
    setSelectedJob(job);
    setFormData(prev => ({
      ...prev,
      position: job.title
    }));
    setShowApplication(true);
    // Scroll to application form
    setTimeout(() => {
      document.getElementById('application-form')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'position', 'experience', 'availability', 'motivation'];
    const emptyFields = requiredFields.filter(field => !formData[field as keyof JobApplication]);
    
    if (emptyFields.length > 0) {
      showToast(t('jobs.application.validation.required'), 'error');
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast(t('jobs.application.validation.email'), 'error');
      setIsSubmitting(false);
      return;
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      showToast(t('jobs.application.validation.phone'), 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call to submit application
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save application to localStorage for persistence
      const applications = JSON.parse(localStorage.getItem('mr-happy-job-applications') || '[]');
      const newApplication = {
        ...formData,
        id: `app-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        applicationNumber: `MH-${Date.now().toString().slice(-6)}`
      };
      
      applications.unshift(newApplication);
      localStorage.setItem('mr-happy-job-applications', JSON.stringify(applications));

      // Mock email sending (in real implementation, this would be handled by backend)
      console.log('Job Application Submitted:', newApplication);

      showToast(
        `${t('jobs.application.success')} Application #${newApplication.applicationNumber}`, 
        'success'
      );
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        availability: '',
        motivation: '',
        previousExperience: '',
        expectedSalary: ''
      });
      setShowApplication(false);
      setSelectedJob(null);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      showToast(t('jobs.application.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getJobTypeColor = (type: JobPosition['type']) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'part-time':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'student':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc2626' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full border border-red-500/30 mb-6">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">{t('jobs.hero.badge')}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
            {t('jobs.hero.title')} <span className="text-red-500 font-normal">Mr.Happy</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('jobs.hero.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span>{t('jobs.hero.location')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-red-500" />
              <span>{t('jobs.hero.team')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-red-500" />
              <span>{t('jobs.hero.rating')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Positions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-white mb-4">
            {t('jobs.positions.title')}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('jobs.positions.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {jobPositions.map((job) => (
            <div
              key={job.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 group"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                      {job.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-1">{job.title}</h3>
                      <p className="text-gray-400 text-sm">{job.department}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getJobTypeColor(job.type)}`}>
                    {t(`jobs.type.${job.type}`)}
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {job.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Euro className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{job.salary}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-white font-semibold mb-3">{t('jobs.requirements')}</h4>
                  <ul className="space-y-2">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                    {job.requirements.length > 3 && (
                      <li className="text-gray-500 text-sm">
                        +{job.requirements.length - 3} {t('jobs.moreRequirements')}
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => handleJobSelect(job)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 group-hover:shadow-lg group-hover:shadow-red-500/25"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('jobs.apply')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      {showApplication && selectedJob && (
        <div id="application-form" className="bg-gray-900 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-light text-white mb-4">
                {t('jobs.application.title')}
              </h3>
              <p className="text-gray-400">
                {t('jobs.application.subtitle')} <span className="text-red-400 font-semibold">{selectedJob?.title}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-black/50 rounded-2xl p-8 border border-gray-800">
                <h4 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <User className="w-5 h-5 text-red-500" />
                  <span>{t('jobs.application.personal')}</span>
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.firstName')} *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                      placeholder={t('jobs.application.firstNamePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.lastName')} *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                      placeholder={t('jobs.application.lastNamePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.email')} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                        placeholder={t('jobs.application.emailPlaceholder')}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.phone')} *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                        placeholder={t('jobs.application.phonePlaceholder')}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="bg-black/50 rounded-2xl p-8 border border-gray-800">
                <h4 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-red-500" />
                  <span>{t('jobs.application.jobInfo')}</span>
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.position')} *
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.experience')} *
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-red-500 focus:outline-none transition-colors"
                      required
                    >
                      <option value="">{t('jobs.application.selectExperience')}</option>
                      <option value="no-experience">{t('jobs.application.noExperience')}</option>
                      <option value="0-1-years">{t('jobs.application.experience01')}</option>
                      <option value="1-3-years">{t('jobs.application.experience13')}</option>
                      <option value="3-5-years">{t('jobs.application.experience35')}</option>
                      <option value="5-plus-years">{t('jobs.application.experience5plus')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.availability')} *
                    </label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-red-500 focus:outline-none transition-colors"
                      required
                    >
                      <option value="">{t('jobs.application.selectAvailability')}</option>
                      <option value="immediately">{t('jobs.application.immediately')}</option>
                      <option value="within-week">{t('jobs.application.withinWeek')}</option>
                      <option value="within-month">{t('jobs.application.withinMonth')}</option>
                      <option value="flexible">{t('jobs.application.flexible')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.expectedSalary')}
                    </label>
                    <input
                      type="text"
                      name="expectedSalary"
                      value={formData.expectedSalary}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                      placeholder={t('jobs.application.salaryPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-black/50 rounded-2xl p-8 border border-gray-800">
                <h4 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  <span>{t('jobs.application.additional')}</span>
                </h4>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.motivation')} *
                    </label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors resize-vertical"
                      placeholder={t('jobs.application.motivationPlaceholder')}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('jobs.application.previousExperience')}
                    </label>
                    <textarea
                      name="previousExperience"
                      value={formData.previousExperience}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors resize-vertical"
                      placeholder={t('jobs.application.previousExperiencePlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplication(false);
                      setSelectedJob(null);
                      setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        position: '',
                        experience: '',
                        availability: '',
                        motivation: '',
                        previousExperience: '',
                        expectedSalary: ''
                      });
                    }}
                    className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors duration-200"
                  >
                    {t('common.cancel')}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 min-w-[160px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>{t('jobs.application.submitting')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t('jobs.application.submit')}</span>
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-gray-500 text-sm mt-4">
                  {t('jobs.application.privacy')}
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Why Work With Us */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              {t('jobs.why.title')}
            </h2>
            <p className="text-xl text-gray-400">
              {t('jobs.why.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{t('jobs.why.team.title')}</h3>
              <p className="text-gray-400">{t('jobs.why.team.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{t('jobs.why.balance.title')}</h3>
              <p className="text-gray-400">{t('jobs.why.balance.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{t('jobs.why.growth.title')}</h3>
              <p className="text-gray-400">{t('jobs.why.growth.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
