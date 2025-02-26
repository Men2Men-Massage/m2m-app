const AUTH_CODE = "1228";
let currentPaymentAmount = 0;
let currentGiftCardAmount = 0;
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
    initInstructionsToggle(); // Inizializza le istruzioni
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
    const dueAmount = (regular + giftcard) * 0.4;
    currentGiftCardAmount = giftcard;

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="result-line-total">• Total: €${(regular + giftcard).toFixed(2)}</div>
        <div class="payment-due-amount">Payment to Center (40%): €${dueAmount.toFixed(2)}</div>
        <div class="payment-receivable-amount">Gift Card Payment to Therapist: €${giftcard.toFixed(2)}</div>
        <button id="save-payment-button" onclick="generatePayment()">Generate Payment</button>  <!-- Cambiato onclick -->
    `;

    resultDiv.className = 'payment-due';
    resultDiv.style.display = 'block';
    document.getElementById('save-payment-button').style.display = 'inline-block';
}

// Function to reset all form fields
function resetAll() {
    document.getElementById('regular-payments').value = '';
    document.getElementById('giftcard-payments').value = '';
    document.getElementById('result').style.display = 'none';
    document.getElementById('save-payment-button').style.display = 'none';
    currentGiftCardAmount = 0;
}

// NUOVA FUNZIONE: Gestisce la generazione del pagamento
function generatePayment() {
    const regular = parseFloat(document.getElementById('regular-payments').value) || 0;
    const giftcard = parseFloat(document.getElementById('giftcard-payments').value) || 0;
    const dueAmount = (regular + giftcard) * 0.4;
      // 1. Chiedi la data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayStr = formatDate(today.toISOString().split('T')[0]);
    const yesterdayStr = formatDate(yesterday.toISOString().split('T')[0]);

    let shiftDate = prompt(`Enter the shift date (or press Cancel for today - ${todayStr}):\n\n- Today (${todayStr})\n- Yesterday (${yesterdayStr})`, todayStr);

    if (shiftDate === null) {
        shiftDate = todayStr; // Default a oggi se l'utente annulla
    } else if (shiftDate.toLowerCase() !== yesterdayStr.toLowerCase()) {
        shiftDate = todayStr;  // Se non è ieri, imposta a oggi.
    }

    // 2. Chiedi il luogo
    let location = prompt("Enter the location (Prenzlauer Berg or Schoeneberg):", "Prenzlauer Berg");
    if (location !== null) {
        location = location.trim().toLowerCase(); // Converti in minuscolo
        if (location !== "prenzlauer berg" && location !== "schoeneberg") {
            alert("Invalid location.  Please enter 'Prenzlauer Berg' or 'Schoeneberg'.");
            return; // Esci dalla funzione se il luogo non è valido
        }
        // Capitalizza la prima lettera di ogni parola
        location = location.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    } else {
        return; // Esci se l'utente annulla
    }

      // 3. Salva il pagamento (usa la funzione esistente)
    savePaymentData(shiftDate, dueAmount, giftcard);

    // 4. Genera i dati per il bonifico
     const userName = localStorage.getItem('m2m_name'); // Prendi il nome utente
     const iban = "DE12 3456 7890 1234 5678 90";  // IBAN corretto
     const purpose = `${userName}, ${shiftDate}, ${location}`;

    // 5. Mostra i dati all'utente
       alert(`Please make an instant bank transfer:\n\nIBAN: ${iban}\nAmount: €${dueAmount.toFixed(2)}\nPurpose: ${purpose}`);

}

// Funzione separata per salvare i dati (per riutilizzo)
function savePaymentData(date, dueAmount, giftCardAmount) {
     const paymentData = {
        date: date,
        dueAmount: dueAmount,
        giftCardAmount: giftCardAmount,
        note: '' // Puoi aggiungere una nota qui se necessario
    };

    savedPayments.push(paymentData);
    localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));

      // Aggiorna il calendario se siamo nel mese corrente
    const now = new Date();
      if (currentCalendarMonth === now.getMonth() && currentCalendarYear === now.getFullYear()) {
        generateCalendar(currentCalendarMonth, currentCalendarYear);
    }
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
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const monthYearDisplay = document.getElementById('calendar-month-year');
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    const todayButton = document.createElement('button');
    todayButton.id = 'today-button';
    todayButton.textContent = 'Today';
    todayButton.onclick = goToToday;
    monthYearDisplay.appendChild(todayButton);


    const calendarTable = document.createElement('table');
    calendarTable.className = 'calendar';
    let thead = calendarTable.createTHead();
    let headerRow = thead.insertRow();
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    daysOfWeek.forEach(day => {
        let th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });

    let tbody = calendarTable.createTBody();
    let date = 1;
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
                dayNumber.textContent = date;
                cell.appendChild(dayNumber);

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

    const [monthlyDueTotal, monthlyGiftCardTotal, monthlyEarningsTotal] = calculateMonthlyTotals(month, year);

    const totalDueDiv = document.createElement('div');
    totalDueDiv.className = 'monthly-total';
    totalDueDiv.textContent = `Total Due (40%): €${monthlyDueTotal.toFixed(2)}`;
    calendarContainer.appendChild(totalDueDiv);

    const totalGiftCardDiv = document.createElement('div');
    totalGiftCardDiv.className = 'monthly-total';
    totalGiftCardDiv.textContent = `Total Gift Cards: €${monthlyGiftCardTotal.toFixed(2)}`;
    calendarContainer.appendChild(totalGiftCardDiv);

    const totalEarningsDiv = document.createElement('div');
    totalEarningsDiv.className = 'monthly-total total-earnings';
    totalEarningsDiv.textContent = `Total Earnings: €${monthlyEarningsTotal.toFixed(2)}`;
    calendarContainer.appendChild(totalEarningsDiv);

}


// Riporta alla data odierna
function goToToday() {
    currentCalendarMonth = new Date().getMonth();
    currentCalendarYear = new Date().getFullYear();
    generateCalendar(currentCalendarMonth, currentCalendarYear);
    document.getElementById('daily-payments-section').style.display = 'none';
}

//  calcolare *tre* totali
function calculateMonthlyTotals(month, year) {
    let dueTotal = 0;
    let giftCardTotal = 0;
    let earningsTotal = 0;

    savedPayments.forEach(payment => {
        const [pYear, pMonth] = payment.date.split('-').map(Number);
        if (pYear === year && pMonth - 1 === month) {
            dueTotal += payment.dueAmount;
            giftCardTotal += payment.giftCardAmount;
            earningsTotal += (payment.dueAmount / 0.4) * 0.6;
        }
    });
    return [dueTotal, giftCardTotal, earningsTotal];
}



function showDailyPayments(dateString) {
    document.getElementById('daily-payments-section').style.display = 'block';
    document.getElementById('selected-date').textContent = formatDate(dateString);
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
            <div>Payment to Center (40%): €${payment.dueAmount.toFixed(2)}</div>
            <div>Gift Card Payment: €${payment.giftCardAmount.toFixed(2)}</div>
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
        dailyPaymentItem.removeChild(noteArea);
    } else {
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


        if (existingNote) {
            let removeNoteButton = document.createElement('button');
            removeNoteButton.textContent = 'Remove';
            removeNoteButton.className = 'remove-note-button';
            removeNoteButton.onclick = () => removeNote(paymentIndex, dailyPaymentItem);
            noteArea.appendChild(removeNoteButton);
        }

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

// Remove the note
function removeNote(paymentIndex, dailyPaymentItem) {
     const paymentToUpdate = savedPayments.find((payment, index) => index === paymentIndex);

    if (paymentToUpdate) {
        paymentToUpdate.note = '';
        localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));
        dailyPaymentItem.removeChild(dailyPaymentItem.querySelector('.note-input-area'));
        showDailyPayments(paymentToUpdate.date);
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

// Inizializza la sezione istruzioni (chiamata quando l'app si carica)
function initInstructionsToggle() {
    const toggleBtn = document.getElementById('toggle-instructions-btn');
    const instructionsContent = document.getElementById('instructions-content');
    const instructionsContainer = document.querySelector('.instructions-container');

    // Imposta lo stato iniziale (aperto)
    instructionsContent.classList.remove('collapsed');
    instructionsContainer.classList.remove('collapsed'); // Da container
    toggleBtn.textContent = 'Hide'; // Mostra "Hide" inizialmente


    toggleBtn.addEventListener('click', () => {
        instructionsContent.classList.toggle('collapsed');
        instructionsContainer.classList.toggle('collapsed'); // Su container
        toggleBtn.textContent = instructionsContent.classList.contains('collapsed') ? 'Show' : 'Hide'; //Aggiorna pulsante
    });
}

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
