import React, { useState } from 'react';
import { FaChartBar, FaMapMarkerAlt, FaUsers, FaHandHoldingHeart, FaChartLine } from 'react-icons/fa';
import { useLocalization } from '../context/LocalizationContext';

// SDG colors
const SDG_COLORS = {
  1: '#e5243b', // No Poverty
  2: '#dda63a', // Zero Hunger
  3: '#4c9f38', // Good Health and Well-being
  4: '#c5192d', // Quality Education
  5: '#ff3a21', // Gender Equality
  6: '#26bde2', // Clean Water and Sanitation
  7: '#fcc30b', // Affordable and Clean Energy
  8: '#a21942', // Decent Work and Economic Growth
  9: '#fd6925', // Industry, Innovation and Infrastructure
  10: '#dd1367', // Reduced Inequalities
  11: '#fd9d24', // Sustainable Cities and Communities
  12: '#bf8b2e', // Responsible Consumption and Production
  13: '#3f7e44', // Climate Action
  14: '#0a97d9', // Life Below Water
  15: '#56c02b', // Life on Land
  16: '#00689d', // Peace, Justice and Strong Institutions
  17: '#19486a', // Partnerships for the Goals
};

const MalaysianSDGImpact = ({ 
  charityData = {}, 
  donationData = [], 
  sdgGoals = [10], // Default to SDG 10 (Reduced Inequalities) as per case study
  regionData = {}
}) => {
  const { formatCurrency } = useLocalization();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate total impact metrics
  const totalDonations = donationData.reduce((sum, donation) => sum + donation.amount, 0);
  const totalBeneficiaries = charityData.beneficiaries || 1250;
  const completedProjects = charityData.completedProjects || 8;
  const ongoingProjects = charityData.ongoingProjects || 5;
  
  // Malaysian states
  const malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 
    'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 
    'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 
    'Labuan', 'Putrajaya'
  ];
  
  // Generate mock data for states if not provided
  const stateDistribution = regionData.stateDistribution || malaysianStates.reduce((acc, state) => {
    acc[state] = Math.floor(Math.random() * 20) + 1;
    return acc;
  }, {});
  
  // SDG targets for SDG 10 (Reduced Inequalities)
  const sdg10Targets = [
    {
      id: '10.1',
      description: 'Achieve income growth for the bottom 40% of the population',
      progress: 65,
      contribution: 'High'
    },
    {
      id: '10.2',
      description: 'Empower and promote social, economic and political inclusion for all',
      progress: 78,
      contribution: 'Very High'
    },
    {
      id: '10.3',
      description: 'Ensure equal opportunity and reduce inequalities of outcome',
      progress: 52,
      contribution: 'Medium'
    },
    {
      id: '10.4',
      description: 'Adopt fiscal, wage and social protection policies for greater equality',
      progress: 45,
      contribution: 'Medium'
    },
    {
      id: '10.5',
      description: 'Improve regulation and monitoring of global financial markets',
      progress: 30,
      contribution: 'Low'
    }
  ];
  
  // Calculate the maximum value for state distribution to normalize the chart
  const maxStateValue = Math.max(...Object.values(stateDistribution));
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <FaChartBar className="mr-2 text-indigo-600" />
          Malaysian SDG Impact Dashboard
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Tracking our contribution to Malaysia's Sustainable Development Goals
        </p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:px-6`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sdg10')}
            className={`${
              activeTab === 'sdg10'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:px-6`}
          >
            SDG 10: Reduced Inequalities
          </button>
          <button
            onClick={() => setActiveTab('regional')}
            className={`${
              activeTab === 'regional'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:px-6`}
          >
            Regional Impact
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`${
              activeTab === 'trends'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:px-6`}
          >
            Impact Trends
          </button>
        </nav>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Donations */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <FaHandHoldingHeart className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Donations
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {formatCurrency(totalDonations)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Beneficiaries */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FaUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Beneficiaries
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {totalBeneficiaries.toLocaleString()}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Completed Projects */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <FaChartBar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed Projects
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {completedProjects}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ongoing Projects */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <FaChartLine className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ongoing Projects
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {ongoingProjects}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* SDG Goals */}
          <div className="mt-8">
            <h4 className="text-base font-medium text-gray-900">Contribution to Malaysian SDGs</h4>
            <p className="mt-1 text-sm text-gray-500">
              Our projects contribute to the following Sustainable Development Goals in Malaysia
            </p>
            
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {sdgGoals.map(goalNumber => (
                <div key={goalNumber} className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <div className="flex-shrink-0">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: SDG_COLORS[goalNumber] }}
                    >
                      {goalNumber}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href="#" className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        {goalNumber === 10 ? 'Reduced Inequalities' : `SDG ${goalNumber}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {goalNumber === 10 ? 'Primary focus' : 'Secondary focus'}
                      </p>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Malaysian National Context */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900">Malaysian National Context</h4>
            <p className="mt-1 text-sm text-gray-600">
              Our work aligns with Malaysia's commitment to the 2030 Agenda for Sustainable Development and the Shared Prosperity Vision 2030 (SPV 2030).
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border border-blue-200 rounded bg-white p-3">
                <h5 className="text-sm font-medium text-gray-900">12th Malaysia Plan (2021-2025)</h5>
                <p className="mt-1 text-xs text-gray-600">
                  Our initiatives support the 12th Malaysia Plan's focus on addressing income inequality and improving social welfare for all Malaysians.
                </p>
              </div>
              <div className="border border-blue-200 rounded bg-white p-3">
                <h5 className="text-sm font-medium text-gray-900">National SDG Roadmap</h5>
                <p className="mt-1 text-xs text-gray-600">
                  We contribute to Malaysia's National SDG Roadmap by focusing on inclusive development and reducing socioeconomic disparities.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* SDG 10 Tab */}
      {activeTab === 'sdg10' && (
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <div 
              className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4"
              style={{ backgroundColor: SDG_COLORS[10] }}
            >
              10
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">SDG 10: Reduced Inequalities</h4>
              <p className="text-sm text-gray-500">
                Reducing inequality within Malaysia through inclusive economic growth and social protection
              </p>
            </div>
          </div>
          
          {/* SDG 10 Targets */}
          <div className="mt-6">
            <h5 className="text-base font-medium text-gray-900 mb-4">Progress on SDG 10 Targets</h5>
            
            <div className="space-y-4">
              {sdg10Targets.map(target => (
                <div key={target.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-2">
                        {target.id}
                      </span>
                      <h6 className="text-sm font-medium text-gray-900">{target.description}</h6>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      target.contribution === 'Very High' ? 'bg-green-100 text-green-800' :
                      target.contribution === 'High' ? 'bg-blue-100 text-blue-800' :
                      target.contribution === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {target.contribution} Contribution
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${target.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">0%</span>
                    <span className="text-xs font-medium text-indigo-600">{target.progress}%</span>
                    <span className="text-xs text-gray-500">100%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Malaysian Context for SDG 10 */}
          <div className="mt-8 bg-indigo-50 rounded-lg p-4">
            <h5 className="text-base font-medium text-gray-900">Malaysian Context for SDG 10</h5>
            <p className="mt-1 text-sm text-gray-600">
              Malaysia has made significant progress in reducing poverty, but income inequality remains a challenge. 
              The Gini coefficient for Malaysia was 0.407 in 2019, indicating moderate inequality.
            </p>
            
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-white p-3 rounded border border-indigo-100">
                <h6 className="text-sm font-medium text-gray-900">Key Challenges</h6>
                <ul className="mt-2 list-disc pl-5 text-xs text-gray-600 space-y-1">
                  <li>Rural-urban divide in income and development</li>
                  <li>Disparities between East and West Malaysia</li>
                  <li>Ethnic-based economic disparities</li>
                  <li>Limited social protection for informal workers</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border border-indigo-100">
                <h6 className="text-sm font-medium text-gray-900">Our Approach</h6>
                <ul className="mt-2 list-disc pl-5 text-xs text-gray-600 space-y-1">
                  <li>Targeted support for B40 (bottom 40%) households</li>
                  <li>Skills development for marginalized communities</li>
                  <li>Microfinance and entrepreneurship programs</li>
                  <li>Advocacy for inclusive policies and social protection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Regional Impact Tab */}
      {activeTab === 'regional' && (
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <FaMapMarkerAlt className="h-6 w-6 text-indigo-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Regional Impact Across Malaysia</h4>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Our projects and beneficiaries are distributed across Malaysia, with a focus on underserved regions
          </p>
          
          {/* State Distribution Chart */}
          <div className="mt-4">
            <h5 className="text-base font-medium text-gray-900 mb-4">Project Distribution by State</h5>
            
            <div className="space-y-2">
              {malaysianStates.map(state => (
                <div key={state} className="flex items-center">
                  <div className="w-32 text-sm text-gray-500">{state}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${(stateDistribution[state] / maxStateValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm font-medium text-gray-900">
                    {stateDistribution[state]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Regional Focus Areas */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h5 className="text-sm font-medium text-gray-900">East Malaysia Focus</h5>
              <p className="mt-2 text-xs text-gray-600">
                Special initiatives for rural communities in Sabah and Sarawak, addressing unique challenges of infrastructure, education, and healthcare access.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h5 className="text-sm font-medium text-gray-900">Urban Poor</h5>
              <p className="mt-2 text-xs text-gray-600">
                Programs targeting urban poverty in major cities like Kuala Lumpur, Johor Bahru, and Penang, focusing on affordable housing and skills development.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h5 className="text-sm font-medium text-gray-900">Rural Development</h5>
              <p className="mt-2 text-xs text-gray-600">
                Initiatives in rural areas of Peninsular Malaysia, particularly in states like Kelantan, Terengganu, and Pahang with higher poverty rates.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Impact Trends Tab */}
      {activeTab === 'trends' && (
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <FaChartLine className="h-6 w-6 text-indigo-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Impact Trends</h4>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Tracking our progress and impact over time across key metrics
          </p>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Beneficiaries by Year</h5>
              <div className="h-48 bg-gray-50 rounded flex items-end justify-between p-2">
                {[2019, 2020, 2021, 2022, 2023].map((year, index) => {
                  // Mock data with increasing trend
                  const height = 20 + (index * 15);
                  return (
                    <div key={year} className="flex flex-col items-center">
                      <div 
                        className="w-12 bg-indigo-600 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-gray-500">{year}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Donations by Quarter (MYR)</h5>
              <div className="h-48 bg-gray-50 rounded flex items-end justify-between p-2">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => {
                  // Mock data with seasonal variation
                  const heights = [45, 30, 60, 75];
                  return (
                    <div key={quarter} className="flex flex-col items-center">
                      <div 
                        className="w-12 bg-green-600 rounded-t"
                        style={{ height: `${heights[index]}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-gray-500">{quarter}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Impact Stories */}
          <div className="mt-8">
            <h5 className="text-base font-medium text-gray-900 mb-4">Impact Stories from Malaysia</h5>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h6 className="text-sm font-medium text-gray-900">Empowering Women in Kelantan</h6>
                <p className="mt-2 text-xs text-gray-600">
                  Our microfinance program has helped 120 women in rural Kelantan start small businesses, 
                  increasing their average household income by 45% over two years.
                </p>
                <div className="mt-3 flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    SDG 5
                  </span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    SDG 10
                  </span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h6 className="text-sm font-medium text-gray-900">Digital Skills for B40 Youth</h6>
                <p className="mt-2 text-xs text-gray-600">
                  Our coding bootcamp in Kuala Lumpur has trained 250 youth from B40 families, 
                  with 78% securing employment in the tech sector within six months of graduation.
                </p>
                <div className="mt-3 flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    SDG 4
                  </span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    SDG 10
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Alignment with Malaysian Policies */}
          <div className="mt-8 bg-indigo-50 p-4 rounded-lg">
            <h5 className="text-base font-medium text-gray-900">Alignment with Malaysian Policies</h5>
            <p className="mt-2 text-sm text-gray-600">
              Our impact metrics are aligned with Malaysia's national development policies and SDG reporting framework.
            </p>
            <div className="mt-3 text-xs text-gray-600">
              <p>• Shared Prosperity Vision 2030 (SPV 2030)</p>
              <p>• 12th Malaysia Plan (2021-2025)</p>
              <p>• Malaysia's Voluntary National Review (VNR) of the SDGs</p>
              <p>• National Strategy for Financial Inclusion (2019-2023)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MalaysianSDGImpact; 