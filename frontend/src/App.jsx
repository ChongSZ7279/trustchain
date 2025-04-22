import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import { LocalizationProvider } from './context/LocalizationContext';
import { CarbonMarketProvider } from './context/CarbonMarketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import router from './router.jsx';

function App() {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <BlockchainProvider>
          <CarbonMarketProvider>
            <RouterProvider router={router} />
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
          </CarbonMarketProvider>
        </BlockchainProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;
