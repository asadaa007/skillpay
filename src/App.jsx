import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import CategoriesNav from './components/CategoriesNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Gigs from './pages/Gigs';
import GigDetails from './pages/GigDetails';
import EditGig from './pages/EditGig';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Portfolio from './pages/Portfolio';
import Messages from './pages/Messages';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import EditJob from './pages/EditJob';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <CategoriesNav />
        <main className="flex-grow">
          <div className="w-full ">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:jobId" element={<JobDetails />} />
              <Route path="/jobs/:jobId/edit" element={<EditJob />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/:userId" 
                element={<PublicProfile />} 
              />
              <Route 
                path="/portfolio" 
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gigs" 
                element={
                  <ProtectedRoute>
                    <Gigs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gigs/:gigId" 
                element={
                  <ProtectedRoute>
                    <GigDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gigs/:gigId/edit" 
                element={
                  <ProtectedRoute>
                    <EditGig />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/:orderId" 
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
};

export default App;
