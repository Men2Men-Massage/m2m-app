const AUTH_CODE = "1228";
let currentPaymentAmount = 0;
let savedPayments = JSON.parse(localStorage.getItem('m2m_payments') || '[]');
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

// Date formatting function (YYYY-MM-DD)
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${year}-${month}-${day}`; // Consistent YYYY-MM-DD format
}

// Logout function
function logout() {
    localStorage.removeItem('m2m_access');
    localStorage.removeItem('m2m_name');
    document.querySelector('.container').style.display = 'none';
    document.getElementById('user-name').style.display = 'none';
    document.getElementById('history-overlay').style.display = 'none';
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('access-code').value = '';
    document.getElementById('user-name-input').value = '';
    document.getElementById('code-section').style.display = 'block';
    document.getElementById('name-section').style.display = 'none';
}

// Function to check authentication on app startup
function checkAuth() {
    const savedCode = localStorage.getItem('m2m_access');
    const userName = localStorage.getItem('m2m_name');

    if (savedCode === AUTH_CODE && userName) {
        showApp(userName);
        return true;
    }
    document.getElementById('auth-overlay').style.display = 'flex';
    return false;
}

// Function to check the access code entered by the user
function checkCode() {
    const codeInput = document.getElementById('access-code');
    if (codeInput.value === AUTH_CODE) {
        document.getElementById('code-section').style.display = 'none';
        document.getElementById('name-section').style.display = 'block';
    } else {
        alert('Invalid access code');
    }
}

// Function to save the username
function saveName() {
    const nameInput = document.getElementById('user-name-input');
    if (nameInput.value.trim().length > 0) {
        localStorage.setItem('m2m_access', AUTH_CODE);
        localStorage.setItem('m2m_name', nameInput.value.trim());
        showApp(nameInput.value.trim());
    } else {
        alert('Please enter a valid name');
    }
}

// Function to show the main app interface
function showApp(userName) {
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('user-name').textContent = `Hello ${userName}`;
    document.getElementById('user-name').style.display = 'block';
    document.querySelector('.container').style.display = 'block';
    showInstallBanners();
}

// Function to show installation banners for PWA
function showInstallBanners() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        if (!window.matchMedia('(display-mode: standalone)').matches) {
            document.getElementById('android-banner').style.display = 'flex';
        }
    });

    document.getElementById('install-button').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                document.getElementById('android-banner').style.display = 'none';
            }
            deferredPrompt = null;
        }
    });

    const isIos = () => /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isInStandaloneMode = () => ('standalone' in window.navigator) && window.navigator.standalone;

    if (isIos() && !isInStandaloneMode()) {
        document.getElementById('ios-banner').style.display = 'flex';
    }
}

// Check authentication on app startup
if (!checkAuth()) {
    document.getElementById('auth-overlay').style.display = 'flex';
}

// Function to calculate the payment
function calculatePayment() {
    const regular = parseFloat(document.getElementById('regular-payments').value) || 0;
    const giftcard = parseFloat(document.getElementById('giftcard-payments').value) || 0;
    const toCenter = regular * 0.4;
    const toTherapist = giftcard * 0.6;
    currentPaymentAmount = toCenter - toTherapist;
    const netAmount = currentPaymentAmount;

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="result-line">• Center keeps 40% of regular: €${toCenter.toFixed(2)}</div>
        <div class="result-line">• Center owes 60% of gift cards: €${toTherapist.toFixed(2)}</div>
        <hr>
        <div class="total-amount ${netAmount >= 0 ? 'highlight' : ''}">
            ${netAmount >= 0 ?
                `Payment to Center: €${netAmount.toFixed(2)}` :
                `Payment to Therapist: €${Math.abs(netAmount).toFixed(2)}`}
        </div>
        <button id="save-payment-button" onclick="savePayment()">Save Payment</button>
    `;

    resultDiv.className = netAmount >= 0 ? 'payment-due' : 'payment-receivable';
    resultDiv.style.display = 'block';
    document.getElementById('save-payment-button').style.display = 'inline-block';
}

// Function to reset all form fields
function resetAll() {
    document.getElementById('regular-payments').value = '';
    document.getElementById('giftcard-payments').value = '';
    document.getElementById('result').style.display = 'none';
    document.getElementById('save-payment-button').style.display = 'none';
}

// Function to save the current payment
function savePayment() {
    const now = new Date();
    const paymentDate = formatDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`); // YYYY-MM-DD
    const paymentData = {
        date: paymentDate,
        amount: currentPaymentAmount,
        note: ''
    };

    savedPayments.push(paymentData);
    localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));

    alert(`Payment of €${Math.abs(currentPaymentAmount).toFixed(2)} ${currentPaymentAmount >= 0 ? 'to Center' : 'to Therapist'} saved for ${paymentDate}`);
    document.getElementById('save-payment-button').style.display = 'none';
}

// Function to show the payment history
function showPaymentHistory() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('history-overlay').style.display = 'flex';
    document.getElementById('daily-payments-section').style.display = 'none';
    generateCalendar(currentCalendarMonth, currentCalendarYear);
}

// Function to return to the calculator from the payment history
function showCalculator() {
    document.querySelector('.container').style.display = 'block';
    document.getElementById('history-overlay').style.display = 'none';
}

// Function to generate the calendar (English localization)
function generateCalendar(month, year) {
    const calendarContainer = document.getElementById('calendar-container');
    calendarContainer.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)

    const monthYearDisplay = document.getElementById('calendar-month-year');
    // English month names
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    const calendarTable = document.createElement('table');
    calendarTable.className = 'calendar';
    let thead = calendarTable.createTHead();
    let headerRow = thead.insertRow();
    // English day names
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    daysOfWeek.forEach(day => {
        let th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });

    let tbody = calendarTable.createTBody();
    let date = 1;
    // Adjust starting day for Monday (0 becomes 6, 1 stays 1, etc.)
    let dayOfWeekCounter = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    for (let i = 0; i < 6; i++) {
        let row = tbody.insertRow();
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < dayOfWeekCounter) {
                let cell = row.insertCell();
                cell.textContent = ''; // Empty cells before the first day
            } else if (date > daysInMonth) {
                break; // Stop if we've reached the end of the month
            } else {
                let cell = row.insertCell();
                cell.classList.add('day');
                let dayNumber = document.createElement('div');
                dayNumber.classList.add('day-number');
                dayNumber.textContent = date;
                cell.appendChild(dayNumber);

                // Construct YYYY-MM-DD string directly, NO TIMEZONE ISSUES
                const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

                if (savedPayments.some(p => p.date === currentDateString)) {
                    cell.classList.add('has-payment');
                }

                const today = new Date();
                const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                if (currentDateString === todayString) {
                    cell.classList.add('today');
                }


                cell.addEventListener('click', () => {
                    showDailyPayments(currentDateString);
                });

                date++;
            }
        }
    }
    calendarContainer.appendChild(calendarTable);
}



// Function to display payments for a specific day
function showDailyPayments(dateString) {
    document.getElementById('daily-payments-section').style.display = 'block';
    document.getElementById('selected-date').textContent = formatDate(dateString); // Use formatDate!
    const dailyPaymentsListDiv = document.getElementById('daily-payments-list');
    dailyPaymentsListDiv.innerHTML = '';

    const paymentsForDate = savedPayments.filter(payment => payment.date === dateString);

    if (paymentsForDate.length === 0) {
        dailyPaymentsListDiv.innerHTML = '<p>No payments for this date.</p>';
        return;
    }

    paymentsForDate.forEach((payment, index) => {
        const paymentItem = document.createElement('div');
        paymentItem.className = 'daily-payment-item';
        paymentItem.dataset.paymentIndex = index;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'payment-details';
        detailsDiv.innerHTML = `
            Payment ${payment.amount >= 0 ? 'to Center' : 'to Therapist'}: €${Math.abs(payment.amount).toFixed(2)}
        `;
        if (payment.note) {
            detailsDiv.innerHTML += `<div class="payment-note">Note: ${payment.note}</div>`;
        }
        paymentItem.appendChild(detailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'payment-actions';

        let noteButton = document.createElement('button');
        noteButton.textContent = payment.note ? 'Edit Note' : 'Add Note';
        noteButton.onclick = () => handleNoteForPayment(index, payment.note);
        actionsDiv.appendChild(noteButton);

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.onclick = () => deletePayment(index, dateString);
        actionsDiv.appendChild(deleteButton);

        paymentItem.appendChild(actionsDiv);
        dailyPaymentsListDiv.appendChild(paymentItem);
    });
}


// Function to delete a payment
function deletePayment(paymentIndex, dateString) {
    if (confirm('Are you sure you want to delete this payment?')) {
        savedPayments.splice(paymentIndex, 1);
        localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));
        showDailyPayments(dateString);
        generateCalendar(currentCalendarMonth, currentCalendarYear);
    }
}

// Function to handle adding or editing a note
function handleNoteForPayment(paymentIndex, existingNote) {
    const dailyPaymentItem = document.querySelector(`.daily-payment-item[data-payment-index="${paymentIndex}"]`);
    let noteArea = dailyPaymentItem.querySelector('.note-input-area');

    if (noteArea) {
        // If note area exists, remove it (toggle off)
        dailyPaymentItem.removeChild(noteArea);
    } else {
        // If note area doesn't exist, create it
        noteArea = document.createElement('div');
        noteArea.className = 'note-input-area';
        let textarea = document.createElement('textarea');
        textarea.placeholder = 'Enter note...';
        textarea.value = existingNote || '';
        noteArea.appendChild(textarea);

        let saveNoteButton = document.createElement('button');
        saveNoteButton.textContent = 'Save Note';
        saveNoteButton.onclick = () => saveNote(paymentIndex, textarea.value, dailyPaymentItem);
        noteArea.appendChild(saveNoteButton);

        let cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.onclick = () => dailyPaymentItem.removeChild(noteArea);
        noteArea.appendChild(cancelButton);

        dailyPaymentItem.appendChild(noteArea);
    }
}

// Function to save the note of a payment
function saveNote(paymentIndex, noteText, dailyPaymentItem) {
    const paymentToUpdate = savedPayments.find((payment, index) => index === paymentIndex);

    if (paymentToUpdate) {
        paymentToUpdate.note = noteText;
        localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));
        dailyPaymentItem.removeChild(dailyPaymentItem.querySelector('.note-input-area'));
        showDailyPayments(paymentToUpdate.date); // Refresh to show updated note
    } else {
        console.error("Payment not found at index:", paymentIndex);
    }
}

// Event listener for the "Previous Month" button
document.getElementById('prev-month-btn').addEventListener('click', () => {
    currentCalendarMonth--;
    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }
    generateCalendar(currentCalendarMonth, currentCalendarYear);
    document.getElementById('daily-payments-section').style.display = 'none';
});

// Event listener for the "Next Month" button
document.getElementById('next-month-btn').addEventListener('click', () => {
    currentCalendarMonth++;
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }
    generateCalendar(currentCalendarMonth, currentCalendarYear);
    document.getElementById('daily-payments-section').style.display = 'none';
});

// Event listener for the "Enter" key press in input fields
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            calculatePayment();
        }
    });
});

// Service Worker registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
