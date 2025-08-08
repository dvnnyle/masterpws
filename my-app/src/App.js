import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from 'react-hot-toast';

import Navbar from "./comp/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Sor from "./pages/parks/Sor";
import BookingPage from "./pages/BookingPage";
import Products from "./shop/Products";
import CreateUser from "./user/CreateUser";
import LogIn from "./user/LogIn";
import ForgotPassword from "./user/ForgotPassword";
import Profile from "./user/Profile";
import MyCart from "./shop/MyCart";
import PaymentReturn from "./shop/PaymentReturn";
import News from "./pages/News/News.jsx";
import Settings from "./user/SettingsTabs/Settings";
import Tickets from "./TicketSystem/Tickets";
import Support from "./user/SettingsTabs/Support";
import Orders from "./user/SettingsTabs/Orders";
import Coupons from "./user/SettingsTabs/Coupons";

import KlippekortRedeem from "./TicketSystem/KlippekortRedeem";
import MonthPass from "./TicketSystem/MonthPass";
import MonthPassDetails from "./TicketSystem/MonthPassDetails";

import PageTransition from "./comp/PageTransition";
import CloudMsg from "./tools/cloudMsg";
import CloudMsgPage from "./pages/CloudMsgPage";

function AnimatedRoutes() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    
    // Check for redirect path from 404.html
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath && redirectPath !== '/') {
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath, { replace: true });
    }
    
    return () => window.removeEventListener('resize', setAppHeight);
  }, [navigate]);

  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/news"
          element={
            <PageTransition>
              <News />
            </PageTransition>
          }
        />
        <Route
          path="/paymentreturn"
          element={
            <PageTransition>
              <PaymentReturn />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />

        <Route
          path="/sor"
          element={
            <PageTransition>
              <Sor />
            </PageTransition>
          }
        />
        <Route
          path="/BookingPage"
          element={
            <PageTransition>
              <BookingPage />
            </PageTransition>
          }
        />
        <Route
          path="/Products"
          element={
            <PageTransition>
              <Products />
            </PageTransition>
          }
        />
        <Route
          path="/CreateUser"
          element={
            <PageTransition>
              <CreateUser />
            </PageTransition>
          }
        />
        <Route
          path="/LogIn"
          element={
            <PageTransition>
              <LogIn />
            </PageTransition>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPassword />
            </PageTransition>
          }
        />
        <Route
          path="/MyCart"
          element={
            <PageTransition>
              <MyCart />
            </PageTransition>
          }
        />
        <Route
          path="/Profile"
          element={
            <PageTransition>
              <Profile />
            </PageTransition>
          }
        />
        <Route
          path="/Settings"
          element={
            <PageTransition>
              <Settings />
            </PageTransition>
          }
        />
        <Route
          path="/tickets"
          element={
            <PageTransition>
              <Tickets />
            </PageTransition>
          }
        />
        <Route
          path="/Orders"
          element={
            <PageTransition>
              <Orders />
            </PageTransition>
          }
        />
        <Route
          path="/support"
          element={
            <PageTransition>
              <Support />
            </PageTransition>
          }
        />
        <Route
          path="/coupons"
          element={
            <PageTransition>
              <Coupons />
            </PageTransition>
          }
        />
        <Route
          path="/klippekort-redeem"
          element={
            <PageTransition>
              <KlippekortRedeem />
            </PageTransition>
          }
        />
        <Route
          path="/monthpass"
          element={
            <PageTransition>
              <MonthPass />
            </PageTransition>
          }
        />
        <Route
          path="/monthpassdetails"
          element={
            <PageTransition>
              <MonthPassDetails />
            </PageTransition>
          }
        />
        <Route
          path="/cloudmsg"
          element={
            <PageTransition>
              <CloudMsgPage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <AnimatedRoutes />
      <CloudMsg />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 6000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </Router>
  );
}

export default App;
