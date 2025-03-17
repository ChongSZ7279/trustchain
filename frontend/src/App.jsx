import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import router from './router';

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <RouterProvider router={router} />
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;
