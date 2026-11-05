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
import ProductionLayout from './pages/production/ProductionLayout';
import ProductionHome from './pages/production/ProductionHome';
import ProductionServices from './pages/production/ProductionServices';
import ProductionServiceDetail from './pages/production/ProductionServiceDetail';
import ProductionTypePage from './pages/production/ProductionTypePage';
import ProductionBuildPackage from './pages/production/ProductionBuildPackage';
import ProductionRequest from './pages/production/ProductionRequest';
import ProductionConfirmation from './pages/production/ProductionConfirmation';
import ClientLayout from './pages/production/ClientLayout';
import ProductionProjects from './pages/production/ProductionProjects';
import ProductionProjectDetail from './pages/production/ProductionProjectDetail';
import ClientProposal from './pages/production/ClientProposal';
import ClientShortlist from './pages/production/ClientShortlist';
import ClientPitch from './pages/production/ClientPitch';
import ClientUpdate from './pages/production/ClientUpdate';
import ProdOverview from './pages/admin/production/ProdOverview';
import ProdRequests from './pages/admin/production/ProdRequests';
import ProdRequestDetail from './pages/admin/production/ProdRequestDetail';
import ProdProposals from './pages/admin/production/ProdProposals';
import ProdProposalDetail from './pages/admin/production/ProdProposalDetail';
import ProdProjects from './pages/admin/production/ProdProjects';
import ProdProjectDetail from './pages/admin/production/ProdProjectDetail';
import ProdSourcing from './pages/admin/production/ProdSourcing';
import ProdSourcingDetail from './pages/admin/production/ProdSourcingDetail';
import ProdFunding from './pages/admin/production/ProdFunding';
import ProdFundingDetail from './pages/admin/production/ProdFundingDetail';
import ProdServices from './pages/admin/production/ProdServices';
import ProdServiceDetail from './pages/admin/production/ProdServiceDetail';
import ProdPast from './pages/admin/production/ProdPast';
import ProdPastDetail from './pages/admin/production/ProdPastDetail';
import ProdContent from './pages/admin/production/ProdContent';
import ProdSettings from './pages/admin/production/ProdSettings';

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

        <Route path="/production" element={<ProductionLayout />}>
          <Route index element={<ProductionHome />} />
          <Route path="services" element={<ProductionServices />} />
          <Route path="services/:slug" element={<ProductionServiceDetail />} />
          <Route path="types/:slug" element={<ProductionTypePage />} />
          <Route path="build-package" element={<ProductionBuildPackage />} />
          <Route path="request" element={<ProductionRequest />} />
          <Route path="request/confirmation/:reference" element={<ProductionConfirmation />} />
          <Route path="projects" element={<ProductionProjects />} />
          <Route path="projects/:slug" element={<ProductionProjectDetail />} />
          <Route path="past/:slug" element={<ProductionProjectDetail />} />
        </Route>

        <Route element={<ClientLayout />}>
          <Route path="/production/proposal/:token" element={<ClientProposal />} />
          <Route path="/production/shortlist/:token" element={<ClientShortlist />} />
          <Route path="/production/pitch/:token" element={<ClientPitch />} />
          <Route path="/production/update/:token" element={<ClientUpdate />} />
        </Route>

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

            <Route path="production" element={<Navigate to="/admin/production/overview" replace />} />
            <Route path="production/overview" element={<ProdOverview />} />
            <Route path="production/requests" element={<ProdRequests />} />
            <Route path="production/requests/:id" element={<ProdRequestDetail />} />
            <Route path="production/proposals" element={<ProdProposals />} />
            <Route path="production/proposals/:id" element={<ProdProposalDetail />} />
            <Route path="production/projects" element={<ProdProjects />} />
            <Route path="production/projects/:id" element={<ProdProjectDetail />} />
            <Route path="production/sourcing" element={<ProdSourcing />} />
            <Route path="production/sourcing/:id" element={<ProdSourcingDetail />} />
            <Route path="production/funding" element={<ProdFunding />} />
            <Route path="production/funding/:id" element={<ProdFundingDetail />} />
            <Route path="production/services" element={<ProdServices />} />
            <Route path="production/services/:id" element={<ProdServiceDetail />} />
            <Route path="production/past" element={<ProdPast />} />
            <Route path="production/past/:id" element={<ProdPastDetail />} />
            <Route path="production/content" element={<ProdContent />} />
            <Route path="production/settings" element={<ProdSettings />} />

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