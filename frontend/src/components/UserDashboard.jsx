import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';

export default function UserDashboard() {
  const { user, logout } = useAuth();

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
              <h1 className="text-xl font-semibold">User Dashboard</h1>
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
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center space-x-4">
                    {user.profile_picture && (
                      <img
                        src={formatImageUrl(user.profile_picture)}
                        alt="Profile"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.gmail}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">IC Number</p>
                      <p className="mt-1 text-sm text-gray-900">{user.ic_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="mt-1 text-sm text-gray-900">{user.phone_number}</p>
                    </div>
                    {user.wallet_address && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Wallet Address</p>
                        <p className="mt-1 text-sm text-gray-900">{user.wallet_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">IC Pictures</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Front</p>
                    {user.front_ic_picture && (
                      <img
                        src={formatImageUrl(user.front_ic_picture)}
                        alt="Front IC"
                        className="mt-2 h-48 w-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Back</p>
                    {user.back_ic_picture && (
                      <img
                        src={formatImageUrl(user.back_ic_picture)}
                        alt="Back IC"
                        className="mt-2 h-48 w-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 