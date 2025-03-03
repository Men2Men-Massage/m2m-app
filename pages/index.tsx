import { useEffect } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  // Initialize the app after the component mounts
  useEffect(() => {
    // Import app.ts dynamically to avoid SSR issues
    import('../src/app')
      .then(() => {
        console.log('App initialized successfully');
      })
      .catch(error => {
        console.error('Failed to initialize app:', error);
      });
  }, []);

  return (
    <>
      <Head>
        <title>M2M Payment Calculator</title>
        <meta name="description" content="Payment calculator for M2M" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Payment Calc" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </Head>

      {/* Authentication Overlay */}
      <div id="auth-overlay" style={{ display: 'none' }}>
        <div id="auth-box">
          <h2>Welcome to M2M Calculator</h2>
          <div id="code-section">
            <input type="password" id="access-code" placeholder="Enter access code" />
            <button>Continue</button>
          </div>
          <div id="name-section" style={{ display: 'none' }}>
            <h3>Create Your Profile</h3>
            <div className="input-group">
              <label htmlFor="user-name-input">Name <span className="required">*</span></label>
              <input type="text" id="user-name-input" placeholder="Enter your name" required />
            </div>
            <div className="input-group">
              <label htmlFor="user-email-input">Email (optional)</label>
              <input type="email" id="user-email-input" placeholder="Enter your email" />
            </div>
            <div className="input-group profile-image-group">
              <label htmlFor="profile-image-input">Profile Image (optional)</label>
              <div className="profile-image-container">
                <div className="profile-image-preview" id="profile-image-preview">
                  <i className="fas fa-user"></i>
                </div>
                <div className="profile-image-actions">
                  <button id="select-image-btn">
                    Select Image
                  </button>
                  <input type="file" id="profile-image-input" accept="image/*" style={{ display: 'none' }} />
                </div>
              </div>
            </div>
            <button>Save Profile</button>
          </div>
        </div>
      </div>

      {/* User Profile Page */}
      <div id="profile-page" style={{ display: 'none' }}>
        {/* Profile content from your HTML */}
      </div>

      {/* Confirmation Modal for Delete Account */}
      <div id="delete-account-modal" className="modal">
        {/* Modal content from your HTML */}
      </div>

      {/* Payment History Page */}
      <div id="history-page" style={{ display: 'none' }}>
        {/* History content from your HTML */}
      </div>

      {/* User Name (top right) */}
      <div id="user-name" style={{ display: 'none' }}></div>

      {/* Main Container (Calculator) */}
      <div className="container" style={{ display: 'none' }}>
        {/* Main app content from your HTML */}
      </div>

      {/* Calculator Modal */}
      <div id="calculator-modal" className="modal">
        {/* Calculator content from your HTML */}
      </div>

      {/* Gift Card Payment Request Modal */}
      <div id="giftcard-request-modal" className="modal">
        {/* Gift card modal content from your HTML */}
      </div>

      {/* Navigation Bar */}
      <div className="bottom-nav" style={{ display: 'none' }}>
        <div className="nav-container">
          <div className="nav-item active" id="home-nav">
            <i className="nav-icon fas fa-calculator"></i>
            <span className="nav-text">Calculator</span>
          </div>
          <div className="nav-item" id="history-nav">
            <i className="nav-icon fas fa-history"></i>
            <span className="nav-text">Payment</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
