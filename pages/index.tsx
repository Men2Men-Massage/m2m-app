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
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" 
        />
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
          
          {/* iOS Pre-Login Banner */}
          <div id="ios-pre-login-banner" style={{display: 'none'}}>
            <span className="close-pre-login-banner">&times;</span>
            <div className="ios-banner-content">
              <div className="ios-banner-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <div className="ios-banner-text">
                <p><strong>Install the app before logging in!</strong></p>
                <p>To save your data on this device, tap <img src="/icons/share-icon.png" alt="Share" className="share-icon" /> and then "Add to Home Screen"</p>
              </div>
            </div>
          </div>
          
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
              <input type="email" id="user-email-input" placeholder="Enter your email" inputMode="email" autoComplete="email" />
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
          
          {/* New Fresha Tools Section */}
          <div className="profile-tools">
            <h3>Fresha Tools</h3>
            <div className="profile-tools-buttons">
              <button id="scheduled-shifts-btn">
                <i className="fas fa-calendar-alt"></i> Shifts
              </button>
              <button id="reviews-btn">
                <i className="fas fa-star"></i> Reviews
              </button>
            </div>
          </div>
          
          <div className="profile-edit">
            <h3>Edit Profile</h3>
            <div className="input-group">
              <label htmlFor="edit-name-input">Name <span className="required">*</span></label>
              <input type="text" id="edit-name-input" placeholder="Enter your name" required />
            </div>
            <div className="input-group">
              <label htmlFor="edit-email-input">Email (optional)</label>
              <input type="email" id="edit-email-input" placeholder="Enter your email" inputMode="email" autoComplete="email" />
            </div>
            <button className="update-btn">Update Profile</button>
          </div>
          
          {/* Holiday Request Section */}
          <div className="profile-holiday-request">
            <h3>Request Holiday</h3>
            <p className="holiday-info">
              <i className="fas fa-info-circle"></i> Holidays must be requested at least 31 days in advance.
            </p>
            <div className="input-group">
              <label htmlFor="holiday-start-date">Start Date <span className="required">*</span></label>
              <input type="date" id="holiday-start-date" required />
            </div>
            <div className="input-group">
              <label htmlFor="holiday-end-date">End Date <span className="required">*</span></label>
              <input type="date" id="holiday-end-date" required />
            </div>
            <div className="input-group">
              <label htmlFor="holiday-notes">Notes (optional)</label>
              <textarea id="holiday-notes" placeholder="Any additional information..."></textarea>
            </div>
            <button className="request-holiday-btn">
              <i className="fas fa-calendar-alt"></i> Request Holiday
            </button>
            <div id="holiday-request-success" className="success-message" style={{ display: 'none' }}>
              Holiday request sent successfully!
            </div>
            <div id="holiday-request-error" className="error-message" style={{ display: 'none' }}></div>
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

      {/* Chatbot Help Page - Versione a schermo intero senza intestazione */}
      <div id="chatbot-page" style={{ display: 'none' }}>
        <div id="chatbot-box">
          <div id="chatbot-container">
            <iframe 
              id="JotFormIFrame-0195628f8f8773efa4a82b2494c37ae1e427" 
              title="Alex: Employee consultant"
              allowTransparency
              allow="geolocation; microphone; camera; fullscreen"
              src="https://eu.jotform.com/agent/0195628f8f8773efa4a82b2494c37ae1e427?embedMode=iframe&background=1&shadow=1"
              frameBorder="0" 
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                margin: 0,
                padding: 0
              }}
              scrolling="no"
            ></iframe>
          </div>
        </div>
      </div>
      
      {/* Help FAQ Page */}
      <div id="help-faq-page" style={{ display: 'none' }}>
        <div id="help-faq-box">
          <div className="help-faq-header">
            <h2>Help & FAQ</h2>
          </div>
          <div className="help-faq-content">
            <div className="help-faq-section">
              <h3>Checklists</h3>
              <div className="checklist-buttons">
                <button id="morning-checklist-btn" className="checklist-btn">
                  <i className="fas fa-sun"></i> Opening Checklist
                </button>
                <button id="evening-checklist-btn" className="checklist-btn">
                  <i className="fas fa-exchange-alt"></i> Shift Change Checklist
                </button>
                <button id="night-checklist-btn" className="checklist-btn">
                  <i className="fas fa-moon"></i> Closing Checklist
                </button>
              </div>
            </div>
            <div className="help-faq-section">
              <h3>Store Information</h3>
              <div className="store-info-box">
                <i className="fas fa-info-circle"></i>
                <ul className="store-info-list">
                  <li>Always open HUQZ on the store tablet.</li>
                  <li>Tablet PIN and safe PIN in all stores is 1228.</li>
                  <li>Wash towels at 60 degrees.</li>
                  <li>Remember to empty the water from the tank before starting the dryer.</li>
                  <li>Check that the doorbell outside is working.</li>
                </ul>
              </div>
            </div>
            <div className="help-faq-section">
              <h3>Need more help?</h3>
              <p>For any general information about M2M, use our chat:</p>
              <button id="open-chatbot-btn" className="open-chatbot-btn">
                <i className="fas fa-comments"></i> Open Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Name (top right) */}
      <div id="user-name" style={{ display: 'none' }}></div>

      {/* Main Container (Calculator) */}
      <div className="container" style={{ display: 'none' }}>
        <div className="logo-container">
          <img src="/icons/m2m-app.png" alt="M2M Logo" className="app-logo" />
        </div>
        <h1 className="calculator-title">Payment Calculator</h1>
        
        <div className="instructions-container">
          <div className="instructions-header">
            <span>Instructions</span>
            <button id="toggle-instructions-btn">Hide</button>
          </div>
          <div id="instructions-content" className="instructions">
            <p>Enter regular payments (cash/card payments handled by the therapist). Enter gift card payments (processed by the center). Click Calculate to see the net amount. Make sure you've checked out all appointments in Fresha and entered any gift cards correctly!</p>
            <p>You can then generate and save the payment and access your payment history.</p>
            <p className="highlight">Please remember to make the center payment via instant bank transfer immediately after each shift.</p>
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

      {/* Calculator Modal - Updated */}
      <div id="calculator-modal" className="modal">
        <div className="calculator-modal-content">
          <div className="calculator-header">
            <h2>Calculator</h2>
            <span className="close-calculator">&times;</span>
          </div>
          <div className="calculator-screen">
            <input type="text" id="calculator-display" readOnly />
            <button id="calculator-copy-btn" className="calculator-copy-btn" style={{ display: 'none' }}>
              <i className="fas fa-copy"></i>
            </button>
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
            <button className="calc-btn clear-btn">C</button>
            <button className="calc-btn operator">+</button>
            <button className="calc-btn backspace-btn" style={{ gridColumn: 'span 2' }}>
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

      {/* Email Request Modal */}
      <div id="email-request-modal" className="modal">
        <div className="modal-content">
          <div className="email-request-header">
            <h2>Email Required</h2>
            <span className="close-email-request">&times;</span>
          </div>
          <p>Please provide your email address to receive the monthly report.</p>
          <div className="form-group">
            <label htmlFor="email-for-report">Email <span className="required">*</span></label>
            <input 
              type="email" 
              id="email-for-report" 
              placeholder="Enter your email" 
              inputMode="email" 
              autoComplete="email" 
            />
          </div>
          <div id="email-request-error" className="error-message" style={{ display: 'none' }}></div>
          <div className="modal-buttons">
            <button id="submit-email-btn">Submit</button>
            <button className="cancel-btn close-email-request">Cancel</button>
          </div>
        </div>
      </div>

      {/* Date & Location Modals - Updated with cancel buttons */}
      <div id="date-modal" className="modal">
        <div className="modal-content">
          <h2>Select Date</h2>
          <select id="shift-date-select"></select>
          <div className="modal-buttons">
            <button id="date-next-btn">Next</button>
            <button id="date-cancel-btn" className="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
      
      <div id="location-modal" className="modal">
        <div className="modal-content">
          <h2>Select Location</h2>
          <select id="location-select">
            <option value="Prenzlauer Berg">Prenzlauer Berg</option>
            <option value="Schoeneberg">Schoeneberg</option>
          </select>
          <div className="modal-buttons">
            <button id="location-generate-btn">Generate Payment</button>
            <button id="location-cancel-btn" className="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>

      {/* Installation Banners - Updated with new styles */}
      <div id="android-banner" className="install-banner" style={{ display: 'none' }}>
        <span className="close-banner">&times;</span>
        <div className="install-banner-content">
          <div className="install-banner-text">
            📱 Install this app for easy access
          </div>
        </div>
        <button id="install-button">Install Now</button>
      </div>
      
      <div id="ios-banner" className="install-banner" style={{ display: 'none' }}>
        <span className="close-banner">&times;</span>
        <div className="install-banner-content">
          <div className="install-banner-text">
            📱 Install this app: tap <img src="/icons/share-icon.png" alt="Share" className="share-icon" /> and then "Add to Home Screen"
          </div>
        </div>
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
          <div className="nav-item" id="help-nav">
            <i className="nav-icon fas fa-question-circle"></i>
            <span className="nav-text">Help</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
