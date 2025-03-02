const AUTH_CODE = "1228";
let currentPaymentAmount = 0;
let currentGiftCardAmount = 0;
let savedPayments = JSON.parse(localStorage.getItem('m2m_payments') || '[]');
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

// Variabili globali per memorizzare data e luogo selezionati
let selectedShiftDate = '';
let selectedLocation = '';

// Funzione per formattare la data (YYYY-MM-DD)
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() è 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Funzione di logout
function logout() {
    localStorage.removeItem('m2m_access');
    localStorage.removeItem('m2m_name');
    document.querySelector('.container').style.display = 'none';
    document.getElementById('user-name').style.display = 'none';
    // Ora la Payment History è una pagina a schermo intero (history-page)
    document.getElementById('history-page').style.display = 'none';
    document.getElementById('profile-page').style.display = 'none'; // Nascondi la pagina del profilo
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('access-code').value = '';
    document.getElementById('user-name-input').value = '';
    document.getElementById('code-section').style.display = 'block';
    document.getElementById('name-section').style.display = 'none';
    // Nascondi la barra di navigazione al logout
    document.querySelector('.bottom-nav').style.display = 'none';
}


// Funzione per controllare l'autenticazione all'avvio dell'app
function checkAuth() {
    const savedCode = localStorage.getItem('m2m_access');
    const userName = localStorage.getItem('m2m_name');

    if (savedCode === AUTH_CODE && userName) {
        showApp(userName);
        return true;
    }
    document.getElementById('auth-overlay').style.display = 'flex';
     // Nascondi la barra di navigazione se non autenticato
    document.querySelector('.bottom-nav').style.display = 'none';
    return false;
}

// Funzione per controllare il codice di accesso inserito dall'utente
function checkCode() {
    const codeInput = document.getElementById('access-code');
    if (codeInput.value === AUTH_CODE) {
        document.getElementById('code-section').style.display = 'none';
        document.getElementById('name-section').style.display = 'block';
    } else {
        alert('Invalid access code');
    }
}

// Funzione per salvare il nome utente
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

// Funzione per mostrare l'interfaccia principale dell'app
function showApp(userName) {
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('user-name').textContent = `Hello ${userName}`;
    document.getElementById('user-name').style.display = 'block';
    document.querySelector('.container').style.display = 'block';
    // Mostra la barra di navigazione solo dopo l'accesso
    document.querySelector('.bottom-nav').style.display = 'flex';
    showInstallBanners();
    initInstructionsToggle();
}

// Funzione per mostrare i banner di installazione della PWA
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

// Controlla l'autenticazione all'avvio
if (!checkAuth()) {
    document.getElementById('auth-overlay').style.display = 'flex';
}

// Funzione per calcolare il pagamento
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
        <button id="save-payment-button" onclick="generatePayment()">Generate Payment</button>
    `;
    resultDiv.className = 'payment-due';
    resultDiv.style.display = 'block';
    document.getElementById('save-payment-button').style.display = 'inline-block';
}

// Funzione per resettare tutti i campi del form
function resetAll() {
    document.getElementById('regular-payments').value = '';
    document.getElementById('giftcard-payments').value = '';
    document.getElementById('result').innerHTML = ''; // Pulisce completamente il div result
    document.getElementById('result').style.display = 'none';
    document.getElementById('save-payment-button').style.display = 'none';
    currentGiftCardAmount = 0;
}

// MODIFICATA: Mostra il modal della data per generare il pagamento
function generatePayment() {
    showDateModal();
}

// Mostra il modal per la selezione della data
function showDateModal() {
    const dateModal = document.getElementById('date-modal');
    const dateSelect = document.getElementById('shift-date-select');
    dateSelect.innerHTML = ''; // Pulisce eventuali opzioni precedenti

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    // Aggiunge le opzioni al select
    dateSelect.add(new Option(`Today (${todayStr})`, todayStr));
    dateSelect.add(new Option(`Yesterday (${yesterdayStr})`, yesterdayStr));

    dateModal.style.display = 'flex'; // Mostra il modal
}

// Salva la data selezionata e mostra il modal per la scelta del luogo
function saveDateAndShowLocation() {
    const dateSelect = document.getElementById('shift-date-select');
    selectedShiftDate = dateSelect.value; // Salva la data selezionata

    document.getElementById('date-modal').style.display = 'none'; // Nasconde il modal della data
    showLocationModal(); // Mostra il modal del luogo
}

// Mostra il modal per la selezione del luogo
function showLocationModal() {
    document.getElementById('location-modal').style.display = 'flex';
}

// Salva il luogo selezionato, esegue i calcoli e salva il pagamento
function saveLocationAndGeneratePayment() {
    selectedLocation = document.getElementById('location-select').value;
    document.getElementById('location-modal').style.display = 'none';

    // Calcola l'importo dovuto
    const regular = parseFloat(document.getElementById('regular-payments').value) || 0;
    const giftcard = parseFloat(document.getElementById('giftcard-payments').value) || 0;
    const dueAmount = (regular + giftcard) * 0.4;

    // Salva il pagamento
    savePaymentData(selectedShiftDate, dueAmount, giftcard);

    // Genera i dati per il bonifico
    const userName = localStorage.getItem('m2m_name');
    const iban = "DE12 3456 7890 1234 5678 90"; // IBAN di esempio
    const accountHolder = "M2M Massagen"; // Intestatario del conto
    const purpose = `${userName}, ${selectedShiftDate}, ${selectedLocation}`;

    // Rimuove il pulsante "Generate Payment" e mostra le informazioni al suo posto
    const resultDiv = document.getElementById('result');
    document.getElementById('save-payment-button').style.display = 'none';
    resultDiv.innerHTML = `
        <div class="payment-due-amount">Payment to Center (40%): €${dueAmount.toFixed(2)}</div>
        <div class="payment-receivable-amount">Gift Card Payment to Therapist: €${giftcard.toFixed(2)}</div>
        <div id="payment-info">
            <p><strong>Please make an instant bank transfer:</strong></p>
            <p><strong>Account Holder:</strong> <span>${accountHolder}</span> <button class="copy-button" onclick="copyToClipboard('${accountHolder}')">Copy</button></p>
            <p><strong>IBAN:</strong> <span>${iban}</span> <button class="copy-button" onclick="copyToClipboard('${iban}')">Copy</button></p>
            <p><strong>Amount:</strong> <span>€${dueAmount.toFixed(2)}</span> <button class="copy-button" onclick="copyToClipboard('${dueAmount.toFixed(2)}')">Copy</button></p>
            <p><strong>Purpose:</strong> <span>${purpose}</span> <button class="copy-button" onclick="copyToClipboard('${purpose}')">Copy</button></p>
        </div>
    `;
    resultDiv.style.display = 'block';
}

// Salva i dati del pagamento (per eventuale riutilizzo)
function savePaymentData(date, dueAmount, giftCardAmount) {
    const paymentData = {
        date: date,
        dueAmount: dueAmount,
        giftCardAmount: giftCardAmount,
        note: '' // Nota opzionale
    };

    savedPayments.push(paymentData);
    localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));

    // Se il mese corrente è in corso, aggiorna il calendario
    const now = new Date();
    if (currentCalendarMonth === now.getMonth() && currentCalendarYear === now.getFullYear()) {
        generateCalendar(currentCalendarMonth, currentCalendarYear);
    }
}

// Funzione per mostrare la Payment History (pagina a schermo intero)
function showPaymentHistory() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('history-page').style.display = 'block';
    document.getElementById('daily-payments-section').style.display = 'none';
      document.getElementById('profile-page').style.display = 'none'; // Assicurati che sia nascosta
    generateCalendar(currentCalendarMonth, currentCalendarYear);
}

// Funzione per tornare alla pagina Calculator (Home)
function showCalculator() {
    document.querySelector('.container').style.display = 'block';
    document.getElementById('history-page').style.display = 'none';
    document.getElementById('profile-page').style.display = 'none'; // Assicurati che sia nascosta
}

// Funzione per generare il calendario (localizzazione in inglese)
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

    // Aggiunge un pulsante "Today" al calendario
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
    // Imposta il contatore: se startingDayOfWeek è 0 (domenica) allora partiamo da 6, altrimenti -1
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

// Calcola tre totali: dovuto, gift card e guadagni
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

// Mostra i pagamenti giornalieri per una data specifica
function showDailyPayments(dateString) {
    document.getElementById('daily-payments-section').style.display = 'block';
    document.getElementById('selected-date').textContent = formatDate(new Date(dateString));
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

// Funzione per eliminare un pagamento
function deletePayment(paymentIndex, dateString) {
    if (confirm('Are you sure you want to delete this payment?')) {
        savedPayments.splice(paymentIndex, 1);
        localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));
        showDailyPayments(dateString);
        generateCalendar(currentCalendarMonth, currentCalendarYear);
    }
}

// Gestisce l'aggiunta o la modifica di una nota per un pagamento
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

// Salva la nota di un pagamento
function saveNote(paymentIndex, noteText, dailyPaymentItem) {
    const paymentToUpdate = savedPayments.find((payment, index) => index === paymentIndex);

    if (paymentToUpdate) {
        paymentToUpdate.note = noteText;
        localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));
        dailyPaymentItem.removeChild(dailyPaymentItem.querySelector('.note-input-area'));
        showDailyPayments(paymentToUpdate.date); // Aggiorna la visualizzazione con la nota aggiornata
    } else {
        console.error("Payment not found at index:", paymentIndex);
    }
}

// Rimuove la nota da un pagamento
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

// Event listener per il pulsante "Previous Month"
document.getElementById('prev-month-btn').addEventListener('click', () => {
    currentCalendarMonth--;
    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }
    generateCalendar(currentCalendarMonth, currentCalendarYear);
    document.getElementById('daily-payments-section').style.display = 'none';
});

// Event listener per il pulsante "Next Month"
document.getElementById('next-month-btn').addEventListener('click', () => {
    currentCalendarMonth++;
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }
    generateCalendar(currentCalendarMonth, currentCalendarYear);
    document.getElementById('daily-payments-section').style.display = 'none';
});

// Aggiunge un listener per il tasto "Enter" in tutti gli input
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            calculatePayment();
        }
    });
});

// Inizializza la sezione delle istruzioni all'avvio dell'app
function initInstructionsToggle() {
    const toggleBtn = document.getElementById('toggle-instructions-btn');
    const instructionsContent = document.getElementById('instructions-content');
    const instructionsContainer = document.querySelector('.instructions-container');

    // Stato iniziale: istruzioni visibili
    instructionsContent.classList.remove('collapsed');
    instructionsContainer.classList.remove('collapsed');
    toggleBtn.textContent = 'Hide';

    toggleBtn.addEventListener('click', () => {
        instructionsContent.classList.toggle('collapsed');
        instructionsContainer.classList.toggle('collapsed');
        toggleBtn.textContent = instructionsContent.classList.contains('collapsed') ? 'Show' : 'Hide';
    });
}

// Funzione per copiare il testo negli appunti
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert(`Copied: ${text}`);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy text. Please copy manually.');
    });
}

// Registrazione del Service Worker (per le funzionalità PWA)
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

// NUOVA FUNZIONE: Crea l'effetto ripple per i pulsanti della navbar
function createRipple(event) {
    const button = event.currentTarget;

    // Rimuovi eventuali ripple esistenti prima di aggiungerne uno nuovo
    const ripples = button.getElementsByClassName("ripple");
    while(ripples.length > 0) {
        ripples[0].remove();
    }

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    // Calcola la posizione del click in relazione all'elemento
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.classList.add("ripple");

    button.appendChild(circle);

    // Rimuovi il ripple dopo l'animazione
    setTimeout(() => {
        circle.remove();
    }, 600);
}

// NUOVA FUNZIONE: Gestisce la navigazione e cambia la vista attiva
function handleNavigation(target) {
    // Rimuovi la classe active da tutti gli elementi della navigazione
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Aggiungi la classe active all'elemento cliccato
    target.classList.add('active');

    // Gestisci il cambio di vista in base all'id dell'elemento
    if (target.id === 'home-nav') {
        showCalculator();
    } else if (target.id === 'history-nav') {
        showPaymentHistory();
    }
}


// NUOVE FUNZIONI: Mostra e aggiorna il profilo utente

function showUserProfile() {
    const userName = localStorage.getItem('m2m_name');
    if (userName) {
        document.getElementById('profile-name').textContent = userName;
        document.getElementById('edit-name-input').value = userName; // Pre-popola il campo
    }
    document.querySelector('.container').style.display = 'none';
    document.getElementById('history-page').style.display = 'none';
    document.getElementById('profile-page').style.display = 'block';
}

function updateUserName() {
    const newName = document.getElementById('edit-name-input').value.trim();
    if (newName) {
        localStorage.setItem('m2m_name', newName);
        document.getElementById('user-name').textContent = `Hello ${newName}`;
        showCalculator(); // Torna alla calcolatrice dopo l'aggiornamento
    } else {
        alert('Please enter a valid name');
    }
}


// Event Listeners per la Navigazione
document.addEventListener('DOMContentLoaded', function() {
    // Funzione iniziale per assicurarsi che i listener siano aggiunti correttamente
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        // Aggiungi l'effetto ripple al click
        item.addEventListener('click', function(e) {
            createRipple(e);
            handleNavigation(this);
        });
    });

    // Imposta il tab Home come attivo all'avvio
    const homeNav = document.getElementById('home-nav');
    if (homeNav) {
        homeNav.classList.add('active');
    }
});

// Calculator Functions
function openCalculator() {
    document.getElementById('calculator-modal').style.display = 'flex';
    document.getElementById('calculator-display').value = '';
}

function closeCalculator() {
    document.getElementById('calculator-modal').style.display = 'none';
}

function appendToCalculator(value) {
    document.getElementById('calculator-display').value += value;
}

function clearCalculator() {
    document.getElementById('calculator-display').value = '';
}

function backspaceCalculator() {
    const display = document.getElementById('calculator-display');
    display.value = display.value.slice(0, -1);
}

function calculateResult() {
    const display = document.getElementById('calculator-display');
    try {
        // Replace × with * and ÷ with / for evaluation
        let expression = display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
            
        // Evaluate the expression
        const result = eval(expression);
        
        // Display the result with 2 decimal places if it's a floating point number
        if (result !== undefined) {
            display.value = Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
        }
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            display.value = '';
        }, 1500);
    }
}

// Close the calculator when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('calculator-modal');
    if (event.target === modal) {
        closeCalculator();
    }
});

// Add keyboard support for the calculator
document.addEventListener('keydown', function(event) {
    const calcModal = document.getElementById('calculator-modal');
    
    // Only process keyboard input if calculator is open
    if (calcModal.style.display === 'flex') {
        const key = event.key;
        
        // Check if key is a number, operator, decimal point, or parenthesis
        if (/^[0-9+\-*/.()]$/.test(key)) {
            appendToCalculator(key);
            event.preventDefault();
        } else if (key === 'Enter') {
            calculateResult();
            event.preventDefault();
        } else if (key === 'Backspace') {
            backspaceCalculator();
            event.preventDefault();
        } else if (key === 'Escape') {
            closeCalculator();
            event.preventDefault();
        } else if (key === 'c' || key === 'C') {
            clearCalculator();
            event.preventDefault();
        }
    }
});

// Variabile globale per tenere traccia delle informazioni sul pagamento gift card corrente
let currentGiftCardRequestData = {
    paymentIndex: null,
    date: null,
    amount: 0
};

// Funzione modificata per mostrare i pagamenti giornalieri includendo il pulsante per richiedere pagamento gift card
function showDailyPayments(dateString) {
    document.getElementById('daily-payments-section').style.display = 'block';
    document.getElementById('selected-date').textContent = formatDate(new Date(dateString));
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
        if (payment.giftCardRequestSent) {
            detailsDiv.innerHTML += `<div class="payment-note success-note">Gift card payment request sent</div>`;
        }
        paymentItem.appendChild(detailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'payment-actions';

        let noteButton = document.createElement('button');
        noteButton.textContent = payment.note ? 'Edit Note' : 'Add Note';
        noteButton.onclick = () => handleNoteForPayment(index, payment.note);
        actionsDiv.appendChild(noteButton);

        // Aggiungi il pulsante per richiedere il pagamento gift card solo se c'è un importo gift card
        if (payment.giftCardAmount > 0) {
            let requestGiftCardButton = document.createElement('button');
            requestGiftCardButton.className = 'request-giftcard-button';
            requestGiftCardButton.innerHTML = '<i class="fas fa-credit-card"></i> Request Gift Card Payment';
            requestGiftCardButton.disabled = payment.giftCardRequestSent || false;
            
            if (!payment.giftCardRequestSent) {
                requestGiftCardButton.onclick = () => openGiftCardRequestModal(index, dateString, payment.giftCardAmount);
            }
            
            actionsDiv.appendChild(requestGiftCardButton);
        }

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.onclick = () => deletePayment(index, dateString);
        actionsDiv.appendChild(deleteButton);

        paymentItem.appendChild(actionsDiv);
        dailyPaymentsListDiv.appendChild(paymentItem);
    });
}

// Funzione per aprire il modal di richiesta pagamento gift card
function openGiftCardRequestModal(paymentIndex, dateString, giftCardAmount) {
    // Salva i dati del pagamento corrente per l'invio successivo
    currentGiftCardRequestData = {
        paymentIndex: paymentIndex,
        date: dateString,
        amount: giftCardAmount
    };
    
    // Resetta il form
    document.getElementById('giftcard-number').value = '';
    document.getElementById('giftcard-comment').value = '';
    document.getElementById('giftcard-request-error').style.display = 'none';
    document.getElementById('giftcard-request-success').style.display = 'none';
    document.getElementById('send-giftcard-request-btn').disabled = false;
    
    // Mostra il modal
    document.getElementById('giftcard-request-modal').style.display = 'flex';
}

// Funzione per chiudere il modal di richiesta pagamento gift card
function closeGiftCardRequestModal() {
    document.getElementById('giftcard-request-modal').style.display = 'none';
    currentGiftCardRequestData = { paymentIndex: null, date: null, amount: 0 };
}

// Funzione per inviare la richiesta di pagamento gift card in modo sicuro
function sendGiftCardPaymentRequest() {
    const giftCardNumber = document.getElementById('giftcard-number').value.trim();
    const comment = document.getElementById('giftcard-comment').value.trim();
    const errorElement = document.getElementById('giftcard-request-error');
    
    // Validazione: il commento è obbligatorio
    if (!comment) {
        errorElement.textContent = 'Please enter a comment.';
        errorElement.style.display = 'block';
        return;
    }
    
    // Disabilita il pulsante durante l'invio
    const sendButton = document.getElementById('send-giftcard-request-btn');
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';
    
    // Raccogli i dati per l'email
    const userName = localStorage.getItem('m2m_name');
    const date = currentGiftCardRequestData.date;
    const amount = currentGiftCardRequestData.amount;
    
    // Prepara i dati da inviare alla serverless function
    const requestData = {
        userName,
        date,
        amount,
        giftCardNumber,
        comment
    };
    
    // Invia la richiesta alla serverless function invece che direttamente all'API di Brevo
    fetch('/api/send-giftcard-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Email sent successfully:', data);
        
        // Aggiorna lo stato del pagamento
        const paymentIndex = savedPayments.findIndex(
            (payment, index) => index === currentGiftCardRequestData.paymentIndex && payment.date === currentGiftCardRequestData.date
        );
        
        if (paymentIndex !== -1) {
            savedPayments[paymentIndex].giftCardRequestSent = true;
            localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));
        }
        
        // Mostra il messaggio di successo
        document.getElementById('giftcard-request-success').style.display = 'block';
        sendButton.textContent = 'Sent Successfully';
        
        // Chiudi il modal dopo un ritardo e aggiorna la visualizzazione
        setTimeout(() => {
            closeGiftCardRequestModal();
            showDailyPayments(currentGiftCardRequestData.date);
        }, 2000);
    })
    .catch(error => {
        console.error('Error sending email:', error);
        
        // Mostra il messaggio di errore
        errorElement.textContent = 'Failed to send email. Please try again later.';
        errorElement.style.display = 'block';
        
        // Riabilita il pulsante
        sendButton.disabled = false;
        sendButton.textContent = 'Send Payment Request';
    });
}

// Event listener per chiudere il modal di richiesta gift card cliccando fuori
window.addEventListener('click', function(event) {
    const modal = document.getElementById('giftcard-request-modal');
    if (event.target === modal) {
        closeGiftCardRequestModal();
    }
});

// Funzione modificata per salvare i dati del pagamento per includere il flag giftCardRequestSent
function savePaymentData(date, dueAmount, giftCardAmount) {
    const paymentData = {
        date: date,
        dueAmount: dueAmount,
        giftCardAmount: giftCardAmount,
        note: '',
        giftCardRequestSent: false // Nuovo flag per tenere traccia dello stato della richiesta
    };

    savedPayments.push(paymentData);
    localStorage.setItem('m2m_payments', JSON.stringify(savedPayments));

    // Se il mese corrente è in corso, aggiorna il calendario
    const now = new Date();
    if (currentCalendarMonth === now.getMonth() && currentCalendarYear === now.getFullYear()) {
        generateCalendar(currentCalendarMonth, currentCalendarYear);
    }
}

// Calculator Functions
function openCalculator() {
    document.getElementById('calculator-modal').style.display = 'flex';
    document.getElementById('calculator-display').value = '';
}

function closeCalculator() {
    document.getElementById('calculator-modal').style.display = 'none';
}

function appendToCalculator(value) {
    document.getElementById('calculator-display').value += value;
}

function clearCalculator() {
    document.getElementById('calculator-display').value = '';
}

function backspaceCalculator() {
    const display = document.getElementById('calculator-display');
    display.value = display.value.slice(0, -1);
}

function calculateResult() {
    const display = document.getElementById('calculator-display');
    try {
        // Replace × with * and ÷ with / for evaluation
        let expression = display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
            
        // Evaluate the expression
        const result = eval(expression);
        
        // Display the result with 2 decimal places if it's a floating point number
        if (result !== undefined) {
            display.value = Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
        }
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            display.value = '';
        }, 1500);
    }
}

// Close the calculator when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('calculator-modal');
    if (event.target === modal) {
        closeCalculator();
    }
});

// Add keyboard support for the calculator
document.addEventListener('keydown', function(event) {
    const calcModal = document.getElementById('calculator-modal');
    
    // Only process keyboard input if calculator is open
    if (calcModal.style.display === 'flex') {
        const key = event.key;
        
        // Check if key is a number, operator, decimal point, or parenthesis
        if (/^[0-9+\-*/.()]$/.test(key)) {
            appendToCalculator(key);
            event.preventDefault();
        } else if (key === 'Enter') {
            calculateResult();
            event.preventDefault();
        } else if (key === 'Backspace') {
            backspaceCalculator();
            event.preventDefault();
        } else if (key === 'Escape') {
            closeCalculator();
            event.preventDefault();
        } else if (key === 'c' || key === 'C') {
            clearCalculator();
            event.preventDefault();
        }
    }
});
