import { useEffect, useState } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize the app after the component mounts
  useEffect(() => {
    // Import app.ts dynamically to avoid SSR issues
    import('../src/app')
      .then(() => {
        console.log('App initialized successfully');
        setIsLoaded(true);
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
        <link rel="stylesheet" href="/style.css" />
      </Head>

      {!isLoaded && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          Cargando...
        </div>
      )}

      {/* Authentication Overlay */}
      <div id="auth-overlay">
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
              <input type="email" id="user-email-input" placeholder="Enter your email" inputMode="email" />
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
        <div id="profile-box">
          <div className="profile-header">
            <h2>User Profile</h2>
            <div className="profile-image-large" id="profile-image-large">
              <i className="fas fa-user"></i>
            </div>
            <div className="profile-actions">
              <button className="change-photo-btn" id="change-photo-btn">
                <i className="fas fa-camera"></i> Change Photo
              </button>
              <input type="file" id="profile-image-update-input" accept="image/*" style={{ display: 'none' }} />
            </div>
          </div>
          <div className="profile-info">
            <p><strong>Name:</strong> <span id="profile-name"></span></p>
            <p><strong>Email:</strong> <span id="profile-email"></span></p>
          </div>
          <div className="profile-edit">
            <h3>Edit Profile</h3>
            <div className="input-group">
              <label htmlFor="edit-name-input">Name <span className="required">*</span></label>
              <input type="text" id="edit-name-input" placeholder="Enter your name" required />
            </div>
            <div className="input-group">
              <label htmlFor="edit-email-input">Email (optional)</label>
              <input type="email" id="edit-email-input" placeholder="Enter your email" inputMode="email" />
            </div>
            <button className="update-btn">Update Profile</button>
          </div>
          <div className="profile-actions-footer">
            <button className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
            <button className="delete-account-btn">
              <i className="fas fa-trash-alt"></i> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete Account */}
      <div id="delete-account-modal" className="modal">
        <div className="modal-content">
          <h2>Delete Account</h2>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <div className="modal-buttons">
            <button className="delete-confirm-btn">Delete</button>
            <button className="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>

      {/* Payment History Page */}
      <div id="history-page" style={{ display: 'none' }}>
        <div id="history-box">
          <h2>Payment History</h2>
          <div id="calendar-navigation">
            <button id="prev-month-btn"><i className="fas fa-chevron-left"></i></button>
            <div id="calendar-month-year"></div>
            <button id="next-month-btn"><i className="fas fa-chevron-right"></i></button>
          </div>
          <div id="calendar-container"></div>
          <div id="daily-payments-section" style={{ display: 'none' }}>
            <h3>Payments for <span id="selected-date"></span></h3>
            <div id="daily-payments-list"></div>
          </div>
        </div>
      </div>

      {/* User Name (top right) */}
      <div id="user-name" style={{ display: 'none' }}></div>

      {/* Main Container (Calculator) */}
      <div className="container" style={{ display: 'none' }}>
        <h1>M2M Payment Calculator</h1>
        
        <div className="instructions-container">
          <div className="instructions-header">
            <span>Instructions</span>
            <button id="toggle-instructions-btn">Hide</button>
          </div>
          <div id="instructions-content" className="instructions">
            <p>This tool helps you calculate and track payments for M2M.</p>
            <p>Enter the amount of regular payments and any gift card payments to calculate the center fee (40%) and your earnings (60%).</p>
            <p>You can then save the payment and access your payment history.</p>
            <p className="highlight">Please remember to make the center payment via bank transfer right after each shift.</p>
          </div>
        </div>
        
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="regular-payments">Regular Payments (€)</label>
            <input type="number" id="regular-payments" placeholder="0.00" step="0.01" />
          </div>
          <div className="input-group">
            <label htmlFor="giftcard-payments">Gift Card Payments (€)</label>
            <input type="number" id="giftcard-payments" placeholder="0.00" step="0.01" />
          </div>
          <div className="button-container">
            <button>Calculate Payment</button>
            <button id="reset-button">Reset</button>
          </div>
        </div>
        
        <div id="result"></div>
        
        <div className="tools-section">
          <div className="tools-header">
            <span>Tools</span>
          </div>
          <div className="tools-buttons">
            <button id="calculator-btn">
              <i className="fas fa-calculator"></i> Calculator
            </button>
            <button id="fresha-btn">
              <i className="fas fa-calendar-check"></i> Daily Report
            </button>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      <div id="calculator-modal" className="modal">
        <div className="calculator-modal-content">
          <div className="calculator-header">
            <h2>Calculator</h2>
            <span className="close-calculator">&times;</span>
          </div>
          <div className="calculator-screen">
            <input type="text" id="calculator-display" readOnly />
          </div>
          <div className="calculator-buttons">
            <button className="calc-btn">7</button>
            <button className="calc-btn">8</button>
            <button className="calc-btn">9</button>
            <button className="calc-btn operator">÷</button>
            <button className="calc-btn">4</button>
            <button className="calc-btn">5</button>
            <button className="calc-btn">6</button>
            <button className="calc-btn operator">×</button>
            <button className="calc-btn">1</button>
            <button className="calc-btn">2</button>
            <button className="calc-btn">3</button>
            <button className="calc-btn operator">−</button>
            <button className="calc-btn">0</button>
            <button className="calc-btn">.</button>
            <button className="calc-btn">C</button>
            <button className="calc-btn operator">+</button>
            <button className="calc-btn operator" style={{ gridColumn: 'span 2' }}>
              <i className="fas fa-backspace"></i>
            </button>
            <button className="calc-btn equals" style={{ gridColumn: 'span 2' }}>=</button>
          </div>
        </div>
      </div>

      {/* Gift Card Payment Request Modal */}
      <div id="giftcard-request-modal" className="modal">
        <div className="giftcard-request-modal-content">
          <div className="giftcard-request-header">
            <h2>Request Gift Card Payment</h2>
            <span className="close-giftcard-request">&times;</span>
          </div>
          <div className="important-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <p>IMPORTANT: Request payment only after adding the gift card correctly in Fresha and paying the rent.</p>
          </div>
          <form className="giftcard-request-form">
            <div className="form-group">
              <label htmlFor="giftcard-number">Gift Card Number (optional)</label>
              <input type="text" id="giftcard-number" placeholder="Enter gift card number if available" />
            </div>
            <div className="form-group">
              <label htmlFor="giftcard-comment">Comment <span className="required">*</span></label>
              <textarea id="giftcard-comment" placeholder="Add details about your shift, etc."></textarea>
            </div>
            
            <div className="help-text">
              <i className="fas fa-info-circle"></i>
              Enter your payment details including IBAN and your information.
            </div>
            
            <div id="giftcard-request-error" className="error-message" style={{ display: 'none' }}></div>
            <div id="giftcard-request-success" className="success-message" style={{ display: 'none' }}>
              Gift card request sent successfully!
            </div>
            <button type="button" id="send-giftcard-request-btn">Send Payment Request</button>
          </form>
        </div>
      </div>

      {/* Date & Location Modals */}
      <div id="date-modal" className="modal">
        <div className="modal-content">
          <h2>Select Date</h2>
          <select id="shift-date-select"></select>
          <button>Next</button>
        </div>
      </div>
      
      <div id="location-modal" className="modal">
        <div className="modal-content">
          <h2>Select Location</h2>
          <select id="location-select">
            <option value="Prenzlauer Berg">Prenzlauer Berg</option>
            <option value="Schoeneberg">Schoeneberg</option>
          </select>
          <button>Generate Payment</button>
        </div>
      </div>

      {/* Installation Banners - Positioned at bottom, outside main container */}
      <div id="android-banner" className="install-banner" style={{ display: 'none' }}>
        <div>📱 Install this app for easy access</div>
        <button id="install-button">Install</button>
        <span className="close-banner">&times;</span>
      </div>
      
      <div id="ios-banner" className="install-banner" style={{ display: 'none' }}>
        <div>📱 Install by tapping <img src="/icons/share-icon.png" alt="Share" className="share-icon" /> and then "Add to Home Screen"</div>
        <span className="close-banner">&times;</span>
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
