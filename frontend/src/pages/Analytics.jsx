import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Briefcase, 
  FileText, 
  Activity,
  BarChart2
} from 'lucide-react';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isCompany = user?.role === 'company' || user?.role === 'COMPANY';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const endpoint = isCompany ? '/analytics/company' : '/analytics/student';
        const response = await api.get(endpoint);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAnalytics();
  }, [user, isCompany]);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-blue-600" />
            {isCompany ? "Recruitment Analytics" : "My Career Insights"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isCompany 
              ? "Track your job performance and candidate pipeline." 
              : "Visualize your application progress and market trends."}
          </p>
        </div>

        {/* --- COMPANY DASHBOARD --- */}
        {isCompany ? (
          <>
            {/* 1. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Active Jobs" 
                value={data.total_active_jobs} 
                icon={<Briefcase className="w-6 h-6 text-blue-600" />} 
                color="bg-blue-100" 
              />
              <StatCard 
                title="Total Views" 
                value={data.total_views} 
                icon={<Eye className="w-6 h-6 text-purple-600" />} 
                color="bg-purple-100" 
              />
              <StatCard 
                title="Total Applications" 
                value={data.total_applications} 
                icon={<Users className="w-6 h-6 text-green-600" />} 
                color="bg-green-100" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 2. Hiring Funnel Chart */}
              <ChartCard title="Hiring Funnel">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.hiring_funnel} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="label" type="category" width={80} style={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                      {data.hiring_funnel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* 3. Applicant Skills Cloud */}
              <ChartCard title="Top Applicant Skills">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.applicant_skills}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" style={{ fontSize: '11px' }} interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-center text-gray-400 mt-2">Frequency of skills in applicant resumes</p>
              </ChartCard>
            </div>
          </>
        ) : (
          
        /* --- STUDENT DASHBOARD --- */
          <>
            {/* 1. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StatCard 
                title="Total Applications" 
                value={data.total_applications} 
                icon={<FileText className="w-6 h-6 text-blue-600" />} 
                color="bg-blue-100" 
              />
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-md flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold opacity-90">Market Insight</h3>
                  <p className="text-sm opacity-80 mt-1">
                    {data.market_trends[0]?.label || "Tech"} is currently the most demanded skill.
                  </p>
                </div>
                <Activity className="w-10 h-10 opacity-80" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 2. Application Status Pie Chart */}
              <ChartCard title="Application Status">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.application_status}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.application_status.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* 3. Market Trends Bar Chart */}
              <ChartCard title="Trending Skills (Market Demand)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.market_trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" style={{ fontSize: '11px' }} />
                    <YAxis />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-center text-gray-400 mt-2">Keywords found in active job descriptions</p>
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Sub-components for cleaner code ---

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
    <div>
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl ${color}`}>
      {icon}
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{title}</h3>
    {children}
  </div>
);

// Colors for Pie Chart
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default Analytics;