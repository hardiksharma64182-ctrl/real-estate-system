import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import { getSupabaseConfig } from '../services/supabaseClient';

const AppContext = createContext();

const DEMO_USERS = {
  admin: {
    id: 'user-admin',
    name: 'Eleanor Vance (Chief Admin)',
    email: 'admin@luxeestate.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    title: 'Managing Director & Platform Admin',
  },
  agent: {
    id: 'agt-1',
    name: 'Sophia Lorenza',
    email: 'sophia.lorenza@luxeestate.com',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    title: 'Senior Luxury Specialist',
  },
  customer: {
    id: 'cust-1',
    name: 'Jonathan Reed',
    email: 'j.reed@techcapital.io',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    title: 'Verified Buyer',
  },
};

export const AppProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation / View State
  const [activeTab, _setActiveTab] = useState('home'); // 'home', 'properties', 'owners', 'agents', 'customers', 'bookings', 'admin'
  const [adminSection, setAdminSection] = useState('overview'); // 'overview', 'properties', 'owners', 'agents', 'customers', 'bookings'

  // Keep activeTab synchronized with current URL path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') _setActiveTab('home');
    else if (path.startsWith('/properties')) _setActiveTab('properties');
    else if (path.startsWith('/owners')) _setActiveTab('owners');
    else if (path.startsWith('/agents')) _setActiveTab('agents');
    else if (path.startsWith('/customers')) _setActiveTab('customers');
    else if (path.startsWith('/bookings')) _setActiveTab('bookings');
    else if (path.startsWith('/admin')) _setActiveTab('admin');
  }, [location.pathname]);

  const setActiveTab = (tab) => {
    _setActiveTab(tab);
    if (tab === 'home') navigate('/');
    else if (tab === 'properties') navigate('/properties');
    else if (tab === 'owners') navigate('/owners');
    else if (tab === 'agents') navigate('/agents');
    else if (tab === 'customers') navigate('/customers');
    else if (tab === 'bookings') navigate('/bookings');
    else if (tab === 'admin') navigate('/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToTab = setActiveTab;

  // Theme State: 'emerald', 'sapphire', 'burgundy', 'bronze', 'navy'
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('lux_theme') || 'emerald';
  });

  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    try {
      localStorage.setItem('lux_theme', themeId);
      document.documentElement.setAttribute('data-theme', themeId);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Auth State (managed securely via authService & database)
  // isAuthLoading: true while we re-verify the Supabase session on startup.
  // ProtectedRoute must wait for this to be false before evaluating the role.
  const [currentUser, setCurrentUser] = useState(() => {
    return authService.getCurrentUser();
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // On mount: re-verify the Supabase session and refresh profile role from DB.
  // This fixes the case where a stale localStorage role differs from the DB role.
  useEffect(() => {
    let cancelled = false;
    authService.refreshSessionFromSupabase().then((refreshedUser) => {
      if (!cancelled) {
        setCurrentUser(refreshedUser);
        setIsAuthLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Data Collections
  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Interaction State
  const [selectedProperty, setSelectedProperty] = useState(null); // For Details Modal
  const [bookingProperty, setBookingProperty] = useState(null); // For Booking Tour Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [myBookingsModalOpen, setMyBookingsModalOpen] = useState(false);

  // Global Search Filter from Hero
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    type: '',
    budget: '',
    keyword: '',
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all collections
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propsData, ownersData, agentsData, custsData, booksData] = await Promise.all([
        dataService.getProperties(),
        dataService.getOwners(),
        dataService.getAgents(),
        dataService.getCustomers(),
        dataService.getBookings(),
      ]);

      setProperties(propsData || []);
      setOwners(ownersData || []);
      setAgents(agentsData || []);
      setCustomers(custsData || []);
      setBookings(booksData || []);
    } catch (err) {
      console.error('Error loading real estate data:', err);
      addToast({
        type: 'error',
        title: 'Error Loading Data',
        message: 'Could not sync real estate listings.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Save current user
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('lux_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('lux_current_user');
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentUser]);

  // Auth functions
  const quickLogin = (role) => {
    if (DEMO_USERS[role]) {
      setCurrentUser(DEMO_USERS[role]);
      addToast({
        type: 'success',
        title: `Switched to ${role.toUpperCase()} Role`,
        message: `Logged in as ${DEMO_USERS[role].name}`,
      });
    }
  };

  const login = (email, password, role = 'customer') => {
    // Check if matching agent or admin or customer
    if (email.includes('admin') || role === 'admin') {
      setCurrentUser(DEMO_USERS.admin);
    } else if (email.includes('agent') || role === 'agent') {
      const foundAgent = agents.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (foundAgent) {
        setCurrentUser({
          id: foundAgent.id,
          name: foundAgent.name,
          email: foundAgent.email,
          role: 'agent',
          avatar: foundAgent.photo,
          title: foundAgent.specialty,
        });
      } else {
        setCurrentUser(DEMO_USERS.agent);
      }
    } else {
      const foundCust = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
      if (foundCust) {
        setCurrentUser({
          id: foundCust.id,
          name: foundCust.name,
          email: foundCust.email,
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          title: 'Registered Client',
        });
      } else {
        const customCust = {
          id: `cust-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          title: 'Customer',
        };
        setCurrentUser(customCust);
      }
    }

    addToast({
      type: 'success',
      title: 'Welcome Back',
      message: `Signed in successfully.`,
    });
    setAuthModalOpen(false);
  };

  const register = async (userData) => {
    try {
      const newCust = await dataService.addCustomer({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '+1 (555) 000-0000',
        address: userData.address || 'United States',
        budget_range: userData.budget_range || '$1M - $3M',
      });

      setCurrentUser({
        id: newCust.id,
        name: newCust.name,
        email: newCust.email,
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        title: 'Registered Client',
      });

      await refreshData();
      addToast({
        type: 'success',
        title: 'Account Created',
        message: `Welcome to LuxeEstate, ${userData.name}!`,
      });
      setAuthModalOpen(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Registration Error',
        message: 'Could not create account. Please try again.',
      });
    }
  };

  const logout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been signed out successfully.',
    });
    navigate('/');
  };

  // CRUD Operations with Data Service
  const addProperty = async (data) => {
    try {
      const created = await dataService.addProperty(data);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Property Listed',
        message: `"${data.name}" added to the portfolio.`,
      });
      return created;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to add property.' });
      throw err;
    }
  };

  const updateProperty = async (id, data) => {
    try {
      const updated = await dataService.updateProperty(id, data);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Property Updated',
        message: 'Property details saved successfully.',
      });
      return updated;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update property.' });
      throw err;
    }
  };

  const deleteProperty = async (id) => {
    try {
      await dataService.deleteProperty(id);
      await refreshData();
      addToast({
        type: 'info',
        title: 'Property Removed',
        message: 'Property listing has been deleted.',
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete property.' });
      throw err;
    }
  };

  // Owners CRUD
  const addOwner = async (data) => {
    try {
      const created = await dataService.addOwner(data);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Owner Added',
        message: `${data.name} was successfully registered as a property owner.`,
      });
      return created;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to add owner.' });
      throw err;
    }
  };

  const updateOwner = async (id, data) => {
    try {
      const updated = await dataService.updateOwner(id, data);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Owner Updated',
        message: 'Owner profile updated.',
      });
      return updated;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update owner.' });
      throw err;
    }
  };

  const deleteOwner = async (id) => {
    try {
      await dataService.deleteOwner(id);
      await refreshData();
      addToast({
        type: 'info',
        title: 'Owner Removed',
        message: 'Owner record deleted.',
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete owner.' });
      throw err;
    }
  };

  // Agents CRUD
  const addAgent = async (data) => {
    try {
      const created = await dataService.addAgent(data);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Agent Added',
        message: `${data.name} was added to the agent directory.`,
      });
      return created;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to add agent.' });
      throw err;
    }
  };

  const updateAgent = async (id, data) => {
    try {
      const updated = await dataService.updateAgent(id, data);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Agent Updated',
        message: 'Agent profile updated.',
      });
      return updated;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update agent.' });
      throw err;
    }
  };

  const deleteAgent = async (id) => {
    try {
      await dataService.deleteAgent(id);
      await refreshData();
      addToast({
        type: 'info',
        title: 'Agent Removed',
        message: 'Agent profile removed from LuxeEstate.',
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete agent.' });
      throw err;
    }
  };

  // Customers CRUD
  const addCustomer = async (data) => {
    try {
      const created = await dataService.addCustomer(data);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Customer Registered',
        message: `${data.name} added to customer directory.`,
      });
      return created;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to add customer.' });
      throw err;
    }
  };

  const updateCustomer = async (id, data) => {
    try {
      const updated = await dataService.updateCustomer(id, data);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Customer Updated',
        message: 'Customer information updated.',
      });
      return updated;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update customer.' });
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await dataService.deleteCustomer(id);
      await refreshData();
      addToast({
        type: 'info',
        title: 'Customer Removed',
        message: 'Customer record deleted.',
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete customer.' });
      throw err;
    }
  };

  // Bookings CRUD
  const addBooking = async (data) => {
    try {
      const created = await dataService.addBooking(data);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Tour Request Submitted!',
        message: `Your visit request for ${data.visit_date} has been received.`,
      });
      return created;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to submit booking request.' });
      throw err;
    }
  };

  const updateBookingStatus = async (id, status, agentId = null) => {
    try {
      const updatePayload = { status };
      if (agentId) updatePayload.agent_id = agentId;

      const updated = await dataService.updateBooking(id, updatePayload);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Booking Updated',
        message: `Booking status changed to "${status}".`,
      });
      return updated;
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update booking status.' });
      throw err;
    }
  };

  const deleteBooking = async (id) => {
    try {
      await dataService.deleteBooking(id);
      await refreshData();
      addToast({
        type: 'info',
        title: 'Booking Cancelled',
        message: 'Booking record has been removed.',
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to cancel booking.' });
      throw err;
    }
  };

  const resetAllData = async () => {
    dataService.resetAllData();
    await refreshData();
    addToast({
      type: 'info',
      title: 'Database Reset',
      message: 'All sample properties, owners, agents, customers, and bookings restored.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        goToTab,
        adminSection,
        setAdminSection,
        currentTheme,
        changeTheme,
        currentUser,
        setCurrentUser,
        isAuthLoading,
        DEMO_USERS,
        quickLogin,
        login,
        register,
        logout,
        properties,
        owners,
        agents,
        customers,
        bookings,
        isLoading,
        refreshData,
        // Modals
        selectedProperty,
        setSelectedProperty,
        bookingProperty,
        setBookingProperty,
        authModalOpen,
        setAuthModalOpen,
        supabaseModalOpen,
        setSupabaseModalOpen,
        myBookingsModalOpen,
        setMyBookingsModalOpen,
        // Search filters
        searchFilters,
        setSearchFilters,
        // Toasts
        toasts,
        addToast,
        removeToast,
        // CRUD
        addProperty,
        updateProperty,
        deleteProperty,
        addOwner,
        updateOwner,
        deleteOwner,
        addAgent,
        updateAgent,
        deleteAgent,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addBooking,
        updateBookingStatus,
        deleteBooking,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
