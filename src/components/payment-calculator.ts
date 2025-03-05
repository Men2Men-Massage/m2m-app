import { Payment, Location, BankInfo } from '../types';
import { StorageService } from '../utils/storage-service';
import { formatDate, copyToClipboard } from '../utils/helpers';

/**
 * Payment Calculator Module
 */
export class PaymentCalculator {
  private regularPaymentsInput: HTMLInputElement;
  private giftCardPaymentsInput: HTMLInputElement;
  private resultDiv: HTMLElement;
  private savePaymentButton: HTMLElement;
  private dateModal: HTMLElement;
  private locationModal: HTMLElement;
  private selectedShiftDate: string = '';
  private selectedLocation: string = '';
  private currentGiftCardAmount: number = 0;
  
  // Lista delle banche tedesche comuni con i loro schemi URI
  private bankList: BankInfo[] = [
    { id: 'sparkasse', name: 'Sparkasse', uriScheme: 'bankingapp://paytoiban' },
    { id: 'commerz', name: 'Commerzbank', uriScheme: 'commerzbank://' },
    { id: 'deutschebank', name: 'Deutsche Bank', uriScheme: 'deutschebank://' },
    { id: 'postbank', name: 'Postbank', uriScheme: 'postbank://' },
    { id: 'volksbank', name: 'Volksbank', uriScheme: 'vr-banking://' },
    { id: 'n26', name: 'N26', uriScheme: 'n26://' },
    { id: 'dkb', name: 'DKB', uriScheme: 'dkb://' },
    { id: 'ing', name: 'ING', uriScheme: 'ing-diba://' },
    { id: 'comdirect', name: 'Comdirect', uriScheme: 'comdirect://' },
    { id: 'hypovereinsbank', name: 'HypoVereinsbank', uriScheme: 'hvb://' },
    { id: 'other', name: 'Other bank', uriScheme: '' }
  ];
  
  /**
   * Create a PaymentCalculator instance
   */
  constructor() {
    // Inputs
    this.regularPaymentsInput = document.getElementById('regular-payments') as HTMLInputElement;
    this.giftCardPaymentsInput = document.getElementById('giftcard-payments') as HTMLInputElement;
    
    // Results
    this.resultDiv = document.getElementById('result') as HTMLElement;
    this.savePaymentButton = document.getElementById('save-payment-button') as HTMLElement;
    
    // Modals
    this.dateModal = document.getElementById('date-modal') as HTMLElement;
    this.locationModal = document.getElementById('location-modal') as HTMLElement;
    
    this.initEventListeners();
  }
  
  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    // Calculate button
    const calculateButton = document.querySelector('.button-container button:first-child') as HTMLButtonElement;
    calculateButton.addEventListener('click', () => this.calculatePayment());
    
    // Reset button
    const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
    resetButton.addEventListener('click', () => this.resetAll());
    
    // Enter key on inputs
    [this.regularPaymentsInput, this.giftCardPaymentsInput].forEach(input => {
      input.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
          this.calculatePayment();
        }
      });
    });
    
    // Date modal next button
    const dateNextButton = document.getElementById('date-next-btn') as HTMLButtonElement;
    if (dateNextButton) {
      dateNextButton.addEventListener('click', () => this.saveDateAndShowLocation());
    } else {
      // Fallback for the old button structure
      const oldDateNextButton = this.dateModal.querySelector('button') as HTMLButtonElement;
      if (oldDateNextButton) {
        oldDateNextButton.addEventListener('click', () => this.saveDateAndShowLocation());
      }
    }
    
    // Date modal cancel button
    const dateCancelButton = document.getElementById('date-cancel-btn') as HTMLButtonElement;
    if (dateCancelButton) {
      dateCancelButton.addEventListener('click', () => this.cancelPaymentGeneration());
    }
    
    // Location modal generate button
    const locationGenButton = document.getElementById('location-generate-btn') as HTMLButtonElement;
    if (locationGenButton) {
      locationGenButton.addEventListener('click', () => this.saveLocationAndGeneratePayment());
    } else {
      // Fallback for the old button structure
      const oldLocationGenButton = this.locationModal.querySelector('button') as HTMLButtonElement;
      if (oldLocationGenButton) {
        oldLocationGenButton.addEventListener('click', () => this.saveLocationAndGeneratePayment());
      }
    }
    
    // Location modal cancel button
    const locationCancelButton = document.getElementById('location-cancel-btn') as HTMLButtonElement;
    if (locationCancelButton) {
      locationCancelButton.addEventListener('click', () => this.cancelPaymentGeneration());
    }
  }
  
  /**
   * Calculate payment
   */
  public calculatePayment(): void {
    const regular = parseFloat(this.regularPaymentsInput.value) || 0;
    const giftcard = parseFloat(this.giftCardPaymentsInput.value) || 0;
    const dueAmount = (regular + giftcard) * 0.4;
    this.currentGiftCardAmount = giftcard;

    this.resultDiv.innerHTML = `
      <div class="result-line-total">• Total: €${(regular + giftcard).toFixed(2)}</div>
      <div class="payment-due-amount">Payment to Center (40%): €${dueAmount.toFixed(2)}</div>
      <div class="payment-receivable-amount">Gift Card Payment to Therapist: €${giftcard.toFixed(2)}</div>
      <button id="save-payment-button" onclick="generatePayment()">Generate Payment</button>
    `;
    this.resultDiv.className = 'payment-due';
    this.resultDiv.style.display = 'block';
    
    // Use the new save payment button from the generated HTML
    const newSaveButton = document.getElementById('save-payment-button') as HTMLElement;
    if (newSaveButton) {
      newSaveButton.style.display = 'inline-block';
      newSaveButton.addEventListener('click', () => this.generatePayment());
    }
  }
  
  /**
   * Reset all fields
   */
  public resetAll(): void {
    this.regularPaymentsInput.value = '';
    this.giftCardPaymentsInput.value = '';
    this.resultDiv.innerHTML = '';
    this.resultDiv.style.display = 'none';
    this.savePaymentButton.style.display = 'none';
    this.currentGiftCardAmount = 0;
  }
  
  /**
   * Start the payment generation process
   */
  public generatePayment(): void {
    this.showDateModal();
  }
  
  /**
   * Show date selection modal
   */
  private showDateModal(): void {
    const dateSelect = document.getElementById('shift-date-select') as HTMLSelectElement;
    dateSelect.innerHTML = ''; // Clear previous options

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    // Add options to select
    dateSelect.add(new Option(`Today (${todayStr})`, todayStr));
    dateSelect.add(new Option(`Yesterday (${yesterdayStr})`, yesterdayStr));

    this.dateModal.style.display = 'flex';
  }
  
  /**
   * Save selected date and show location modal
   */
  private saveDateAndShowLocation(): void {
    const dateSelect = document.getElementById('shift-date-select') as HTMLSelectElement;
    this.selectedShiftDate = dateSelect.value;

    this.dateModal.style.display = 'none';
    this.showLocationModal();
  }
  
  /**
   * Show location selection modal
   */
  private showLocationModal(): void {
    this.locationModal.style.display = 'flex';
  }
  
  /**
   * Cancel the payment generation process
   */
  private cancelPaymentGeneration(): void {
    // Close both modals
    this.dateModal.style.display = 'none';
    this.locationModal.style.display = 'none';
    
    // Reset selected values
    this.selectedShiftDate = '';
    this.selectedLocation = '';
  }
  
  /**
   * Create bank selection dropdown
   * @returns HTML string for the bank selection dropdown
   */
  private createBankSelectionDropdown(): string {
    let bankOptions = '';
    this.bankList.forEach(bank => {
      bankOptions += `<option value="${bank.id}">${bank.name}</option>`;
    });
    
    return `
      <div class="bank-selection-container">
        <label for="bank-select">Select your bank:</label>
        <select id="bank-select" class="bank-select">
          ${bankOptions}
        </select>
      </div>
    `;
  }
  
  /**
   * Open banking app with transfer data
   * @param iban Recipient IBAN
   * @param amount Amount to transfer
   * @param purpose Payment purpose/reference
   * @param bankId Bank ID selected by user
   */
  private openBankingApp(iban: string, amount: string, purpose: string, bankId: string): void {
    // Get the selected bank info
    const selectedBank = this.bankList.find(bank => bank.id === bankId);
    
    // If no bank is selected or "other" is selected, show a message
    if (!selectedBank || bankId === 'other') {
      alert('Please open your banking app manually and enter the transfer details.');
      return;
    }
    
    // Clean IBAN by removing spaces
    const cleanIban = iban.replace(/\s+/g, '');
    
    // Different banks use different URI formats, we'll try some common formats
    let uriToOpen = '';
    
    // Try to construct an appropriate URI based on the bank
    switch (bankId) {
      case 'sparkasse':
        // Sparkasse format
        uriToOpen = `${selectedBank.uriScheme}?name=M2M%20Massagen&iban=${cleanIban}&amount=${amount}&reason=${encodeURIComponent(purpose)}`;
        break;
      case 'volksbank':
        // Volksbank format
        uriToOpen = `${selectedBank.uriScheme}?receiverName=M2M%20Massagen&iban=${cleanIban}&amount=${amount}&purpose=${encodeURIComponent(purpose)}`;
        break;
      case 'n26':
        // N26 format
        uriToOpen = `${selectedBank.uriScheme}transfer?recipient=M2M%20Massagen&iban=${cleanIban}&amount=${amount}&reference=${encodeURIComponent(purpose)}`;
        break;
      default:
        // Generic format for other banks
        uriToOpen = `${selectedBank.uriScheme}?iban=${cleanIban}&amount=${amount}&description=${encodeURIComponent(purpose)}`;
        break;
    }
    
    // Create an invisible anchor element to open the URI
    const link = document.createElement('a');
    link.href = uriToOpen;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Try to open the banking app
    try {
      link.click();
    } catch (e) {
      console.error('Error opening banking app:', e);
      alert('Unable to open banking app. Please open your banking app manually and enter the transfer details.');
    } finally {
      // Clean up the link element
      setTimeout(() => {
        document.body.removeChild(link);
      }, 2000);
    }
  }
  
  /**
   * Save location and generate payment
   */
  private saveLocationAndGeneratePayment(): void {
    const locationSelect = document.getElementById('location-select') as HTMLSelectElement;
    this.selectedLocation = locationSelect.value;
    this.locationModal.style.display = 'none';

    // Calculate amounts
    const regular = parseFloat(this.regularPaymentsInput.value) || 0;
    const giftcard = parseFloat(this.giftCardPaymentsInput.value) || 0;
    const dueAmount = (regular + giftcard) * 0.4;

    // Save payment to storage
    this.savePaymentData(this.selectedShiftDate, dueAmount, giftcard);

    // Generate bank transfer data
    const userData = StorageService.getUserData();
    const userName = userData.name;
    const iban = "DE12 3456 7890 1234 5678 90"; // Example IBAN
    const accountHolder = "M2M Massagen"; // Account holder
    const purpose = `Rent Payment ${userName}, ${this.selectedShiftDate}, ${this.selectedLocation}`;

    // Update the result div with payment instructions
    this.resultDiv.innerHTML = `
      <div class="payment-due-amount">Payment to Center (40%): €${dueAmount.toFixed(2)}</div>
      <div class="payment-receivable-amount">Gift Card Payment to Therapist: €${giftcard.toFixed(2)}</div>
      <div id="payment-info">
        <p><strong>Please make an instant bank transfer:</strong></p>
        <p><strong>Account Holder:</strong> <span>${accountHolder}</span> <button class="copy-button" onclick="copyToClipboard('${accountHolder}')">Copy</button></p>
        <p><strong>IBAN:</strong> <span>${iban}</span> <button class="copy-button" onclick="copyToClipboard('${iban}')">Copy</button></p>
        <p><strong>Amount:</strong> <span>€${dueAmount.toFixed(2)}</span> <button class="copy-button" onclick="copyToClipboard('${dueAmount.toFixed(2)}')">Copy</button></p>
        <p><strong>Purpose:</strong> <span>${purpose}</span> <button class="copy-button" onclick="copyToClipboard('${purpose}')">Copy</button></p>
        <div class="banking-app-section">
          ${this.createBankSelectionDropdown()}
          <button id="open-banking-app-btn" class="banking-app-button">
            <i class="fas fa-university"></i> Open in Banking App
          </button>
          <p class="banking-app-help">Opens your banking app with pre-filled transfer details</p>
        </div>
      </div>
    `;
    
    // Add event listeners to copy buttons
    const copyButtons = this.resultDiv.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const textToCopy = target.previousElementSibling?.textContent || '';
        copyToClipboard(textToCopy);
      });
    });
    
    // Add event listener to the banking app button
    const bankingAppButton = document.getElementById('open-banking-app-btn');
    if (bankingAppButton) {
      bankingAppButton.addEventListener('click', () => {
        const bankSelect = document.getElementById('bank-select') as HTMLSelectElement;
        const selectedBankId = bankSelect.value;
        this.openBankingApp(iban, dueAmount.toFixed(2), purpose, selectedBankId);
      });
    }
    
    this.resultDiv.style.display = 'block';
  }
  
  /**
   * Save payment data
   */
  private savePaymentData(date: string, dueAmount: number, giftCardAmount: number): void {
    const paymentData: Payment = {
      date,
      dueAmount,
      giftCardAmount,
      note: '',
      giftCardRequestSent: false
    };

    StorageService.addPayment(paymentData);
  }
}
