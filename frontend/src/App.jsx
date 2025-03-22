import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import { LocalizationProvider } from './context/LocalizationContext';
import router from './router';

function App() {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <BlockchainProvider>
          <RouterProvider router={router} />
        </BlockchainProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;
