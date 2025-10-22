import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

interface JobApplication {
  id: string;
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
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applicationNumber: string;
}

export function AdminJobsPanel() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load applications from localStorage
  useEffect(() => {
    const savedApplications = JSON.parse(localStorage.getItem('mr-happy-job-applications') || '[]');
    setApplications(savedApplications);
  }, []);

  // Save applications to localStorage
  const saveApplications = (updatedApplications: JobApplication[]) => {
    setApplications(updatedApplications);
    localStorage.setItem('mr-happy-job-applications', JSON.stringify(updatedApplications));
  };

  const updateApplicationStatus = (id: string, status: JobApplication['status']) => {
    const updatedApplications = applications.map(app => 
      app.id === id ? { ...app, status } : app
    );
    saveApplications(updatedApplications);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      reviewed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const exportApplications = () => {
    const csvContent = [
      ['Application #', 'Name', 'Email', 'Phone', 'Position', 'Experience', 'Status', 'Submitted'],
      ...filteredApplications.map(app => [
        app.applicationNumber,
        `${app.firstName} ${app.lastName}`,
        app.email,
        app.phone,
        app.position,
        app.experience,
        app.status,
        new Date(app.submittedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-applications.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Briefcase className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-white">Job Applications</h2>
            <p className="text-gray-400">Manage incoming job applications</p>
          </div>
        </div>
        <button
          onClick={exportApplications}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Applications</p>
              <p className="text-2xl font-bold text-white">{applications.length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-400">
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Accepted</p>
              <p className="text-2xl font-bold text-green-400">
                {applications.filter(app => app.status === 'accepted').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">This Month</p>
              <p className="text-2xl font-bold text-white">
                {applications.filter(app => 
                  new Date(app.submittedAt).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, position, or application #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No job applications found</p>
            <p className="text-sm text-gray-500 mt-2">
              {applications.length === 0 
                ? "Applications will appear here when candidates apply for positions"
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Application #</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Candidate</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Position</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Experience</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Submitted</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                    <td className="p-4">
                      <span className="font-mono text-sm text-blue-400">
                        {application.applicationNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {application.firstName} {application.lastName}
                          </p>
                          <p className="text-gray-400 text-sm">{application.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{application.position}</td>
                    <td className="p-4 text-gray-300">{application.experience}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        {getStatusBadge(application.status)}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {new Date(application.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetails(true);
                          }}
                          className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'accepted')}
                              className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                              title="Accept"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Application Details
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {selectedApplication.applicationNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <p className="text-white">
                    {selectedApplication.firstName} {selectedApplication.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Position</label>
                  <p className="text-white">{selectedApplication.position}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white">{selectedApplication.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <p className="text-white">{selectedApplication.phone}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Experience</label>
                  <p className="text-white">{selectedApplication.experience}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Expected Salary</label>
                  <p className="text-white">{selectedApplication.expectedSalary}</p>
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Availability</label>
                <p className="text-white">{selectedApplication.availability}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Previous Experience</label>
                <p className="text-white whitespace-pre-wrap">{selectedApplication.previousExperience}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Motivation</label>
                <p className="text-white whitespace-pre-wrap">{selectedApplication.motivation}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedApplication.status)}
                  {getStatusBadge(selectedApplication.status)}
                </div>
                
                {selectedApplication.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'accepted');
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'rejected');
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
