import React from "react";
import Home from "./pages/user/Home";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import Tasker from "./components/common/tasker";
// import Navbar from "./components/common/Navbar";
import JobListing from "./components/common/joblisting";
import ReviewForm from "./components/common/reviewform";
import Services from "./pages/user/services.jsx";
import ServiceDetails from "./pages/user/ServiceDetails";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import CreateListingWrapper from "./pages/provider/CreateListingWrapper";
import EditListingWrapper from "./pages/provider/EditListingWrapper";
// Using the ProviderProfile from the provider folder
import ProviderProfile from "./pages/provider/ProviderProfile";
import Appointments from "./components/common/appointments";
import BookingDetails from "./pages/user/BookingDetails";
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProviders from './pages/admin/Providers';
import AdminListings from './pages/admin/Listings';
import AdminBookings from './pages/admin/Bookings';
import AdminCategories from './pages/admin/Categories';
import CreateAdminUser from './pages/admin/CreateAdminUser';
// Provider components
import ProviderBookings from './pages/provider/ProviderBookings';
import ServiceManagement from './pages/provider/ServiceManagement';
import AddService from './pages/provider/AddService';
import EditService from './pages/provider/EditService';
import Commissions from './pages/admin/Commissions';
import Complaints from './pages/admin/Complaints';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import AdminProfile from './pages/admin/AdminProfile';
import UserProfile from './pages/user/UserProfile';
import About from './pages/user/About';
import Contact from './pages/user/Contact';
import MyBookings from './pages/user/MyBookings';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import TailwindTest from './components/common/TailwindTest';


// Add this import
import ProtectedAdminRoute from './components/common/ProtectedAdminRoute';
import Layout from './components/common/Layout';

// Toast notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/tasker" element={<Tasker />} />
        <Route path="/joblisting" element={<JobListing />} />
        <Route path="/reviewform" element={<ReviewForm />} />
        <Route path="/services" element={<Services />} />
        <Route path="/listing/:id" element={<ServiceDetails />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/create-listing" element={<CreateListingWrapper />} />
        <Route path="/provider/edit-listing/:id" element={<EditListingWrapper />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route path="/provider/profile/:id" element={<ProviderProfile />} />
        <Route path="/provider/bookings" element={<ProviderBookings />} />
        <Route path="/provider/services" element={<ServiceManagement />} />
        <Route path="/provider/services/edit/:serviceId" element={<EditService />} />
        <Route path="/provider/services/new" element={<AddService />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/booking/:id" element={<BookingDetails />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/tailwind-test" element={<TailwindTest />} />
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedAdminRoute>
            <AdminUsers />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/users/create" element={
          <ProtectedAdminRoute>
            <CreateAdminUser />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/providers" element={
          <ProtectedAdminRoute>
            <AdminProviders />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/listings" element={
          <ProtectedAdminRoute>
            <AdminListings />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedAdminRoute>
            <AdminBookings />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedAdminRoute>
            <AdminCategories />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/commissions" element={
          <ProtectedAdminRoute>
            <Commissions />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/complaints" element={
          <ProtectedAdminRoute>
            <Complaints />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedAdminRoute>
            <Reports />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedAdminRoute>
            <Settings />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedAdminRoute>
            <AdminProfile />
          </ProtectedAdminRoute>
        } />
      </Routes>
    </Layout>
  );
}

export default App;