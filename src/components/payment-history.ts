import { Payment, GiftCardRequest } from '../types';
import { StorageService } from '../utils/storage-service';
import { formatDate } from '../utils/helpers';

/**
 * Payment History Module
 */
export class PaymentHistory {
  private historyPage: HTMLElement;
  private calendarContainer: HTMLElement;
  private dailyPaymentsSection: HTMLElement;
  private dailyPaymentsList: HTMLElement;
  private selectedDateElement: HTMLElement;
  private currentCalendarMonth: number;
  private currentCalendarYear: number;
  private currentGiftCardRequestData: GiftCardRequest = {
    paymentIndex: null,
    date: null,
    amount: 0
  };
  private giftCardRequestModal: HTMLElement;
  
  /**
   * Create a PaymentHistory instance
   */
  constructor() {
    this.historyPage = document.getElementById('history-page') as HTMLElement;
    this.calendarContainer = document.getElementById('calendar-container') as HTMLElement;
    this.dailyPaymentsSection = document.getElementById('daily-payments-section') as HTMLElement;
    this.dailyPaymentsList = document.getElementById('daily-payments-list') as HTMLElement;
    this.selectedDateElement = document.getElementById('selected-date') as HTMLElement;
    this.giftCardRequestModal = document.getElementById('giftcard-request-modal') as HTMLElement;
    
    // Initialize with current month/year
    const now = new Date();
    this.currentCalendarMonth = now.getMonth();
    this.currentCalendarYear = now.getFullYear();
    
    this.initEventListeners();
  }
  
  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    // Previous month button
    const prevMonthBtn = document.getElementById('prev-month-btn') as HTMLButtonElement;
    prevMonthBtn.addEventListener('click', () => this.navigateToPreviousMonth());
    
    // Next month button
    const nextMonthBtn = document.getElementById('next-month-btn') as HTMLButtonElement;
    nextMonthBtn.addEventListener('click', () => this.navigateToNextMonth());
    
    // GiftCard Request Modal
    const closeGiftCardBtn = document.querySelector('.close-giftcard-request') as HTMLElement;
    closeGiftCardBtn.addEventListener('click', () => this.closeGiftCardRequestModal());
    
    // Gift Card Request Submit Button
    const sendGiftCardRequestBtn = document.getElementById('send-giftcard-request-btn') as HTMLButtonElement;
    sendGiftCardRequestBtn.addEventListener('click', () => this.sendGiftCardPaymentRequest());
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === this.giftCardRequestModal) {
        this.closeGiftCardRequestModal();
      }
    });
  }
  
  /**
   * Show payment history view
   */
  public showPaymentHistory(): void {
    this.historyPage.style.display = 'block';
    this.dailyPaymentsSection.style.display = 'none';
    this.generateCalendar(this.currentCalendarMonth, this.currentCalendarYear);
    
    // Reset scroll position
    window.scrollTo(0, 0);
  }
  
  /**
   * Hide payment history view
   */
  public hidePaymentHistory(): void {
    this.historyPage.style.display = 'none';
  }
  
  /**
   * Navigate to the previous month
   */
  private navigateToPreviousMonth(): void {
    this.currentCalendarMonth--;
    if (this.currentCalendarMonth < 0) {
      this.currentCalendarMonth = 11;
      this.currentCalendarYear--;
    }
    this.generateCalendar(this.currentCalendarMonth, this.currentCalendarYear);
    this.dailyPaymentsSection.style.display = 'none';
  }
  
  /**
   * Navigate to the next month
   */
  private navigateToNextMonth(): void {
    this.currentCalendarMonth++;
    if (this.currentCalendarMonth > 11) {
      this.currentCalendarMonth = 0;
      this.currentCalendarYear++;
    }
    this.generateCalendar(this.currentCalendarMonth, this.currentCalendarYear);
    this.dailyPaymentsSection.style.display = 'none';
  }
  
  /**
   * Go to today
   */
  public goToToday(): void {
    const now = new Date();
    this.currentCalendarMonth = now.getMonth();
    this.currentCalendarYear = now.getFullYear();
    this.generateCalendar(this.currentCalendarMonth, this.currentCalendarYear);
    this.dailyPaymentsSection.style.display = 'none';
  }
  
  /**
   * Generate the calendar view
   */
  public generateCalendar(month: number, year: number): void {
    this.calendarContainer.innerHTML = '';
    const payments = StorageService.getPayments();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const monthYearDisplay = document.getElementById('calendar-month-year') as HTMLElement;
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    // Add "Today" button
    const todayButton = document.createElement('button');
    todayButton.id = 'today-button';
    todayButton.textContent = 'Today';
    todayButton.addEventListener('click', () => this.goToToday());
    monthYearDisplay.appendChild(todayButton);

    // Create calendar table
    const calendarTable = document.createElement('table');
    calendarTable.className = 'calendar';
    
    // Create header row
    let thead = calendarTable.createTHead();
    let headerRow = thead.insertRow();
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    daysOfWeek.forEach(day => {
      let th = document.createElement('th');
      th.textContent = day;
      headerRow.appendChild(th);
    });

    // Create calendar body
    let tbody = calendarTable.createTBody();
    let date = 1;
    // Set counter: if startingDayOfWeek is 0 (Sunday) then start from 6, otherwise -1
    let dayOfWeekCounter = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    for (let i = 0; i < 6; i++) {
      let row = tbody.insertRow();
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < dayOfWeekCounter) {
          let cell = row.insertCell();
          cell.textContent = '';
        } else if (date > daysInMonth) {
          break;
        } else {
          let cell = row.insertCell();
          cell.classList.add('day');
          let dayNumber = document.createElement('div');
          dayNumber.classList.add('day-number');
          dayNumber.textContent = date.toString();
          cell.appendChild(dayNumber);

          const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

          if (payments.some(p => p.date === currentDateString)) {
            cell.classList.add('has-payment');
          }

          const today = new Date();
          const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          if (currentDateString === todayString) {
            cell.classList.add('today');
          }

          cell.addEventListener('click', () => {
            this.showDailyPayments(currentDateString);
          });

          date++;
        }
      }
    }
    
    this.calendarContainer.appendChild(calendarTable);

    // Add monthly totals
    const [monthlyDueTotal, monthlyGiftCardTotal, monthlyEarningsTotal] = this.calculateMonthlyTotals(month, year);

    const totalDueDiv = document.createElement('div');
    totalDueDiv.className = 'monthly-total';
    totalDueDiv.textContent = `Total Due (40%): €${monthlyDueTotal.toFixed(2)}`;
    this.calendarContainer.appendChild(totalDueDiv);

    const totalGiftCardDiv = document.createElement('div');
    totalGiftCardDiv.className = 'monthly-total';
    totalGiftCardDiv.textContent = `Total Gift Cards: €${monthlyGiftCardTotal.toFixed(2)}`;
    this.calendarContainer.appendChild(totalGiftCardDiv);

    const totalEarningsDiv = document.createElement('div');
    totalEarningsDiv.className = 'monthly-total total-earnings';
    totalEarningsDiv.textContent = `Total Earnings: €${monthlyEarningsTotal.toFixed(2)}`;
    this.calendarContainer.appendChild(totalEarningsDiv);
  }
  
  /**
   * Calculate monthly totals
   */
  private calculateMonthlyTotals(month: number, year: number): [number, number, number] {
    let dueTotal = 0;
    let giftCardTotal = 0;
    let earningsTotal = 0;
    const payments = StorageService.getPayments();

    payments.forEach(payment => {
      const [pYear, pMonth] = payment.date.split('-').map(Number);
      if (pYear === year && pMonth - 1 === month) {
        dueTotal += payment.dueAmount;
        giftCardTotal += payment.giftCardAmount;
        earningsTotal += (payment.dueAmount / 0.4) * 0.6;
      }
    });
    
    return [dueTotal, giftCardTotal, earningsTotal];
  }
  
  /**
   * Show daily payments for a specific date
   */
  public showDailyPayments(dateString: string): void {
    this.dailyPaymentsSection.style.display = 'block';
    this.selectedDateElement.textContent = formatDate(new Date(dateString));
    this.dailyPaymentsList.innerHTML = '';
    
    const payments = StorageService.getPayments();
    const paymentsForDate = payments.filter(payment => payment.date === dateString);

    if (paymentsForDate.length === 0) {
      this.dailyPaymentsList.innerHTML = '<p>No payments for this date.</p>';
      return;
    }

    paymentsForDate.forEach((payment, index) => {
      // Find the global index in the savedPayments array
      const globalIndex = payments.findIndex(p => p === payment);
      
      const paymentItem = document.createElement('div');
      paymentItem.className = 'daily-payment-item';
      paymentItem.dataset.paymentIndex = globalIndex.toString();

      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'payment-details';
      detailsDiv.innerHTML = `
        <div>Payment to Center (40%): €${payment.dueAmount.toFixed(2)}</div>
        <div>Gift Card Payment: €${payment.giftCardAmount.toFixed(2)}</div>
      `;
      
      if (payment.note) {
        detailsDiv.innerHTML += `<div class="payment-note">Note: ${payment.note}</div>`;
      }
      
      if (payment.giftCardRequestSent) {
        detailsDiv.innerHTML += `<div class="payment-note success-note">Gift card payment request sent</div>`;
      }
      
      paymentItem.appendChild(detailsDiv);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'payment-actions';

      let noteButton = document.createElement('button');
      noteButton.textContent = payment.note ? 'Edit Note' : 'Add Note';
      noteButton.addEventListener('click', () => this.handleNoteForPayment(globalIndex, payment.note || ''));
      actionsDiv.appendChild(noteButton);

      // Add gift card request button if there's a gift card amount
      if (payment.giftCardAmount > 0) {
        let requestGiftCardButton = document.createElement('button');
        requestGiftCardButton.className = 'request-giftcard-button';
        requestGiftCardButton.innerHTML = '<i class="fas fa-credit-card"></i> Request Gift Card Payment';
        requestGiftCardButton.disabled = payment.giftCardRequestSent;
        
        if (!payment.giftCardRequestSent) {
          requestGiftCardButton.addEventListener('click', () => 
            this.openGiftCardRequestModal(globalIndex, dateString, payment.giftCardAmount)
          );
        }
        
        actionsDiv.appendChild(requestGiftCardButton);
      }

      let deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-button';
      deleteButton.addEventListener('click', () => this.deletePayment(globalIndex, dateString));
      actionsDiv.appendChild(deleteButton);

      paymentItem.appendChild(actionsDiv);
      this.dailyPaymentsList.appendChild(paymentItem);
    });
  }
  
  /**
   * Delete a payment
   */
  private deletePayment(paymentIndex: number, dateString: string): void {
    if (confirm('Are you sure you want to delete this payment?')) {
      StorageService.removePayment(paymentIndex);
      this.showDailyPayments(dateString);
      this.generateCalendar(this.currentCalendarMonth, this.currentCalendarYear);
    }
  }
  
  /**
   * Handle note editing for a payment
   */
  private handleNoteForPayment(paymentIndex: number, existingNote: string): void {
    const dailyPaymentItem = document.querySelector(`.daily-payment-item[data-payment-index="${paymentIndex}"]`) as HTMLElement;
    let noteArea = dailyPaymentItem.querySelector('.note-input-area') as HTMLElement | null;

    if (noteArea) {
      dailyPaymentItem.removeChild(noteArea);
    } else {
      noteArea = document.createElement('div');
      noteArea.className = 'note-input-area';
      
      let textarea = document.createElement('textarea');
      textarea.placeholder = 'Enter note...';
      textarea.value = existingNote;
      textarea.style.fontSize = '16px'; // Imposta la dimensione del font a 16px per prevenire lo zoom su iOS
      noteArea.appendChild(textarea);

      let buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'buttons-container';
      
      let saveNoteButton = document.createElement('button');
      saveNoteButton.textContent = 'Save Note';
      saveNoteButton.addEventListener('click', () => this.saveNote(paymentIndex, textarea.value, dailyPaymentItem));
      buttonsContainer.appendChild(saveNoteButton);

      if (existingNote) {
        let removeNoteButton = document.createElement('button');
        removeNoteButton.textContent = 'Remove';
        removeNoteButton.className = 'remove-note-button';
        removeNoteButton.addEventListener('click', () => this.removeNote(paymentIndex, dailyPaymentItem));
        buttonsContainer.appendChild(removeNoteButton);
      }

      noteArea.appendChild(buttonsContainer);
      dailyPaymentItem.appendChild(noteArea);
    }
  }
  
  /**
   * Save a note for a payment
   */
  private saveNote(paymentIndex: number, noteText: string, dailyPaymentItem: HTMLElement): void {
    const payments = StorageService.getPayments();
    
    if (paymentIndex >= 0 && paymentIndex < payments.length) {
      StorageService.updatePayment(paymentIndex, { note: noteText });
      dailyPaymentItem.removeChild(dailyPaymentItem.querySelector('.note-input-area') as HTMLElement);
      this.showDailyPayments(payments[paymentIndex].date);
    } else {
      console.error("Payment not found at index:", paymentIndex);
    }
  }
  
  /**
   * Remove a note from a payment
   */
  private removeNote(paymentIndex: number, dailyPaymentItem: HTMLElement): void {
    const payments = StorageService.getPayments();
    
    if (paymentIndex >= 0 && paymentIndex < payments.length) {
      StorageService.updatePayment(paymentIndex, { note: '' });
      dailyPaymentItem.removeChild(dailyPaymentItem.querySelector('.note-input-area') as HTMLElement);
      this.showDailyPayments(payments[paymentIndex].date);
    } else {
      console.error("Payment not found at index:", paymentIndex);
    }
  }
  
  /**
   * Open gift card request modal
   */
  private openGiftCardRequestModal(paymentIndex: number, dateString: string, giftCardAmount: number): void {
    // Save current payment data for later submission
    this.currentGiftCardRequestData = {
      paymentIndex,
      date: dateString,
      amount: giftCardAmount
    };
    
    // Reset form
    (document.getElementById('giftcard-number') as HTMLInputElement).value = '';
    (document.getElementById('giftcard-comment') as HTMLTextAreaElement).value = '';
    (document.getElementById('giftcard-request-error') as HTMLElement).style.display = 'none';
    (document.getElementById('giftcard-request-success') as HTMLElement).style.display = 'none';
    (document.getElementById('send-giftcard-request-btn') as HTMLButtonElement).disabled = false;
    
    // Show modal
    this.giftCardRequestModal.style.display = 'flex';
  }
  
  /**
   * Close gift card request modal
   */
  private closeGiftCardRequestModal(): void {
    this.giftCardRequestModal.style.display = 'none';
    this.currentGiftCardRequestData = { paymentIndex: null, date: null, amount: 0 };
  }
  
  /**
   * Send gift card payment request
   */
  private async sendGiftCardPaymentRequest(): Promise<void> {
    const giftCardNumber = (document.getElementById('giftcard-number') as HTMLInputElement).value.trim();
    const comment = (document.getElementById('giftcard-comment') as HTMLTextAreaElement).value.trim();
    const errorElement = document.getElementById('giftcard-request-error') as HTMLElement;
    
    // Validation: comment is required
    if (!comment) {
      errorElement.textContent = 'Please enter a comment.';
      errorElement.style.display = 'block';
      return;
    }
    
    // Disable button during sending
    const sendButton = document.getElementById('send-giftcard-request-btn') as HTMLButtonElement;
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';
    
    // Get data for email
    const userData = StorageService.getUserData();
    const userName = userData.name;
    const date = this.currentGiftCardRequestData.date;
    const amount = this.currentGiftCardRequestData.amount;
    
    // Save current date for later use
    const currentDate = date;
    
    if (!date || this.currentGiftCardRequestData.paymentIndex === null) {
      errorElement.textContent = 'Invalid payment data.';
      errorElement.style.display = 'block';
      sendButton.disabled = false;
      sendButton.textContent = 'Send Payment Request';
      return;
    }
    
    // Prepare data for serverless function
    const requestData = {
      userName,
      date,
      amount,
      giftCardNumber,
      comment
    };
    
    try {
      // Send request to serverless function
      const response = await fetch('/api/send-giftcard-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      console.log('Email sent successfully:', data);
      
      // Update payment status
      if (this.currentGiftCardRequestData.paymentIndex !== null) {
        StorageService.updatePayment(
          this.currentGiftCardRequestData.paymentIndex,
          { giftCardRequestSent: true }
        );
      }
      
      // Show success message
      (document.getElementById('giftcard-request-success') as HTMLElement).style.display = 'block';
      sendButton.textContent = 'Sent Successfully';
      
      // Close modal after delay and update view
      setTimeout(() => {
        this.closeGiftCardRequestModal();
        if (currentDate) {
          this.showDailyPayments(currentDate);
        }
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Show error message
      errorElement.textContent = 'Failed to send email. Please try again later.';
      errorElement.style.display = 'block';
      
      // Re-enable button
      sendButton.disabled = false;
      sendButton.textContent = 'Send Payment Request';
    }
  }
}
