import { useAuth } from '../context/AuthContext';

export default function OrganizationDashboard() {
  const { organization, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Organization Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Organization Information</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`/storage/${organization.logo}`}
                      alt="Organization Logo"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{organization.name}</p>
                      <p className="text-sm text-gray-500">{organization.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.description}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Objectives</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.objectives}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact Information</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.phone_number}</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.gmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration Address</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.register_address}</p>
                    </div>
                    {organization.wallet_address && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Wallet Address</p>
                        <p className="mt-1 text-sm text-gray-900">{organization.wallet_address}</p>
                      </div>
                    )}
                  </div>

                  {(organization.website || organization.facebook || organization.instagram) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Social Media</h3>
                      <div className="mt-2 space-y-2">
                        {organization.website && (
                          <a
                            href={organization.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-500 block"
                          >
                            Website
                          </a>
                        )}
                        {organization.facebook && (
                          <a
                            href={organization.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-500 block"
                          >
                            Facebook
                          </a>
                        )}
                        {organization.instagram && (
                          <a
                            href={organization.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-500 block"
                          >
                            Instagram
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Documents</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statutory Declaration</p>
                    <a
                      href={`/storage/${organization.statutory_declaration}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Document
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Verified Document</p>
                    <a
                      href={`/storage/${organization.verified_document}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              </div>

              {!organization.is_verified && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Verification Pending
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your organization is currently pending verification. We will review your
                          documents and update your status soon.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 