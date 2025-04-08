import React from 'react';
import { 
  FaGraduationCap, 
  FaHeartbeat, 
  FaUtensils, 
  FaBriefcase, 
  FaTree, 
  FaCheckCircle,
  FaClock,
  FaExclamationCircle
} from 'react-icons/fa';

const ImpactMetrics = ({ impactMetrics }) => {
  if (!impactMetrics) return null;

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" /> Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaExclamationCircle className="mr-1" /> Not Verified
          </span>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
      {/* Verification Status */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Impact Verification</h3>
          {getVerificationBadge(impactMetrics.verification_status)}
        </div>
        {impactMetrics.verification_date && (
          <p className="mt-1 text-sm text-gray-500">
            Last verified: {new Date(impactMetrics.verification_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Education Impact */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center mb-4">
          <FaGraduationCap className="h-5 w-5 text-indigo-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Education Impact</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Students Benefited</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.students_benefited || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">School Supplies</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.school_supplies_provided || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Scholarships</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.scholarships_awarded || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Teachers Trained</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.teachers_trained || 0}</p>
          </div>
        </div>
      </div>

      {/* Health Impact */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center mb-4">
          <FaHeartbeat className="h-5 w-5 text-red-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Health Impact</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Medical Treatments</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.medical_treatments || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Vaccines Administered</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.vaccines_administered || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Health Workers Trained</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.health_workers_trained || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Medical Equipment</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.medical_equipment_provided || 0}</p>
          </div>
        </div>
      </div>

      {/* Food & Shelter Impact */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center mb-4">
          <FaUtensils className="h-5 w-5 text-yellow-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Food & Shelter Impact</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Meals Provided</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.meals_provided || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Shelter Nights</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.shelter_nights || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Clean Water Access</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.clean_water_access || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Sanitation Facilities</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.sanitation_facilities || 0}</p>
          </div>
        </div>
      </div>

      {/* Economic Impact */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center mb-4">
          <FaBriefcase className="h-5 w-5 text-green-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Economic Impact</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Jobs Created</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.jobs_created || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Training Hours</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.training_hours || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Small Businesses</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.small_businesses_supported || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Micro Loans</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.micro_loans_given || 0}</p>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center mb-4">
          <FaTree className="h-5 w-5 text-emerald-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Environmental Impact</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Trees Planted</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.trees_planted || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Carbon Offset (tons)</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.carbon_offset_tons || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Renewable Projects</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.renewable_energy_projects || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Waste Recycled (tons)</p>
            <p className="text-2xl font-semibold text-gray-900">{impactMetrics.waste_recycled_tons || 0}</p>
          </div>
        </div>
      </div>

      {/* Impact Stories */}
      {impactMetrics.beneficiary_stories && impactMetrics.beneficiary_stories.length > 0 && (
        <div className="px-4 py-5 sm:px-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Beneficiary Stories</h4>
          <div className="space-y-4">
            {impactMetrics.beneficiary_stories.map((story, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 font-medium">{story.title}</p>
                <p className="text-gray-600 mt-2">{story.content}</p>
                {story.media && (
                  <div className="mt-4">
                    <img 
                      src={story.media} 
                      alt={story.title} 
                      className="rounded-lg max-w-full h-auto"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact Timeline */}
      {impactMetrics.milestones && impactMetrics.milestones.length > 0 && (
        <div className="px-4 py-5 sm:px-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Impact Timeline</h4>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-4">
              {impactMetrics.milestones.map((milestone, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-indigo-600"></div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 font-medium">{milestone.title}</p>
                    <p className="text-gray-600 mt-1">{milestone.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactMetrics; 