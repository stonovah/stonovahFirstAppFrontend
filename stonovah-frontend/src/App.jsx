import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Page Imports
import GeneralLandingPage from './pages/GeneralLandingPage';
import EventCoordinationPage from './pages/EventCoordinationPage';
import LivestreamCoordinationPage from './pages/EventLivestreamPage';
import CinematicMediaPage from './pages/EventMediaHandlingPage';
import TicketingPage from './pages/EventTicketingPage';
import EventLandingPageContent from './pages/EventLandingPage';
import EventDetailPage from './pages/EventDetails';
import RequestService from './pages/RequestService';
import NRequestService from './pages/NRequestService';
import OrganiserDashboard from './pages/OrganiserDashboard';
import OrganiserEvent from './pages/OrganiserEvent';
import CreateEventWizard from './pages/CreateEvent';
import OrganizerOnboarding from './pages/organizer/OrganizerOnboarding';
import Checkout from './pages/Checkout';
import CheckoutComplete from './pages/CheckoutComplete';


// Admin Imports
// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import ExecutiveOverview from './pages/admin/pages/ExecutiveOverview';
import EventsOverview from './pages/admin/pages/EventsOverview';
import PendingQueue from './pages/admin/pages/PendingQueue';
import EventReview from './pages/admin/pages/EventReview';
import AllEvents from './pages/admin/pages/AllEvents';
import EventDetail from './pages/admin/pages/EventDetail';
import ComingSoon from './pages/admin/pages/ComingSoon';
import Organizers from './pages/admin/pages/Organizers';
import OrganizerDetail from './pages/admin/pages/OrganizerDetail';
import Payouts from './pages/admin/pages/Payouts';
import TicketTemplates from './pages/admin/pages/TicketTemplates';
import ServiceRequests from './pages/admin/pages/ServiceRequests';
import PastEvents from './pages/admin/pages/PastEvents';


// Add to the imports
import { AuthProvider } from './context/AuthContext';
import RequireRole from './components/RequireRole';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AcceptInvite from './pages/auth/AcceptInvite';
import Orders from './pages/admin/pages/Orders';
import Settings from './pages/admin/pages/Settings';
import Portfolio from './pages/Portfolio';
import PortfolioDetail from './pages/PortfolioDetail';
import ScrollToTop from './components/ScrollToTop';


export default function App() {
  return (
    <Router>
      <ScrollToTop/>
      <AuthProvider>
      {/* Global Toast Provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0A0A0A',
            color: '#FFFFFF',
            border: '1px solid #262626',
            fontSize: '13px',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#D9A006',
              secondary: '#0A0A0A',
            },
          },
          error: {
            iconTheme: {
              primary: '#C0201E',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route
          path="/"
          element={<GeneralLandingPage />}
        />

        <Route
          path="/events"
          element={<EventLandingPageContent />}
        />

        <Route
          path="/events/coordination"
          element={<EventCoordinationPage />}
        />

        <Route
          path="/events/livestream"
          element={<LivestreamCoordinationPage />}
        />

        <Route
          path="/events/media"
          element={<CinematicMediaPage />}
        />

        <Route
          path="/events/ticketing"
          element={<TicketingPage />}
        />

        {/* <Route
          path="/events/:id"
          element={<EventDetailPage />}
        /> */}
        <Route path="/events/:slug" element={<EventDetailPage />} />

        <Route
          path="/request-service-event-coordination"
          element={<RequestService />}
        />

        <Route
          path="/request-service"
          element={<NRequestService />}
        />

        <Route path="/events/past" element={<Portfolio />} />
        <Route path="/events/past/:id" element={<PortfolioDetail />} />

        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/complete" element={<CheckoutComplete />} />

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/organizer/register" element={<OrganizerOnboarding />} />
        <Route path="/organiser-dashboard" element={<RequireRole role="ORGANIZER"><OrganiserDashboard /></RequireRole>} />
        <Route path="/my-events" element={<RequireRole role="ORGANIZER"><OrganiserEvent /></RequireRole>} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/create-event" element={<RequireRole role="ORGANIZER" permission="events.write"><CreateEventWizard /></RequireRole>} />


        {/* =========================
            ADMIN ROUTES
        ========================== */}

        <Route
          path="/admin"
        >

          {/* /admin/login now redirects to the shared login page */}
          <Route path="login" element={<Navigate to="/login" replace />} />

          {/* Protected Admin Routes */}
          <Route
            element={
              <RequireRole role="ADMIN">
                <AdminLayout />
              </RequireRole>
            }
          >

            {/* /admin */}
            <Route
              index
              element={<ExecutiveOverview />}
            />

            {/* /admin/events */}
            <Route
              path="events"
              element={<AllEvents />}
            />

            {/* /admin/events/overview */}
            <Route
              path="events/overview"
              element={<EventsOverview />}
            />

            {/* /admin/events/pending */}
            <Route
              path="events/pending"
              element={<PendingQueue />}
            />

            {/* /admin/events/pending/:id */}
            <Route
              path="events/pending/:id"
              element={<EventReview />}
            />

            {/* /admin/events/:id */}
            <Route
              path="events/:id"
              element={<EventDetail />}
            />

            <Route path="soon/:name" element={<ComingSoon />} />

            <Route path="organizers" element={<Organizers />} />
            <Route path="organizers/:id" element={<OrganizerDetail />} />
            <Route path="payouts" element={<Payouts />} />
            <Route path="payouts/settings" element={<Navigate to="/admin/settings" replace />} />
            <Route path="ticket-templates" element={<TicketTemplates />} />
            <Route path="service-requests" element={<ServiceRequests />} />
            <Route path="past-events" element={<PastEvents />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<Settings />} />

          </Route>
        </Route>

        {/* Uncomment when needed */}
        {/* 
        <Route
          path="/service-fee-configuration"
          element={<ServiceFeeConfiguration />}
        />
        */}

      </Routes>
      </AuthProvider>
    </Router>
  );
}