/**
 * College Portal - Main JavaScript Application
 */

// API Configuration
const API_BASE = '/api';

// Global State
let currentStudentId = null; // Will be set from authenticated user
let currentTab = 'all';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Check authentication first
    await checkAuth();
    
    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            currentTab = tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadRecentRequests();
        });
    });
}

// ==================== DASHBOARD STATS ====================

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats`, {
            credentials: 'same-origin'
        });
        const stats = await response.json();
        
        updateStatsDisplay(stats);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Use placeholder values if API is not available
        updateStatsDisplay({
            total_students: 150,
            pending_outings: 5,
            pending_xerox: 12,
            pending_mess: 8,
            pending_fivestar: 3,
            pending_ccd: 4,
            pending_stationary: 2
        });
    }
}

function updateStatsDisplay(stats) {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card fade-in">
            <div class="stat-icon">👥</div>
            <div class="stat-number">${stats.total_students || 0}</div>
            <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-card fade-in">
            <div class="stat-icon">🚶</div>
            <div class="stat-number">${stats.pending_outings || 0}</div>
            <div class="stat-label">Pending Outings</div>
        </div>
        <div class="stat-card fade-in">
            <div class="stat-icon">🖨️</div>
            <div class="stat-number">${stats.pending_xerox || 0}</div>
            <div class="stat-label">Xerox Orders</div>
        </div>
        <div class="stat-card fade-in">
            <div class="stat-icon">🍽️</div>
            <div class="stat-number">${stats.pending_mess || 0}</div>
            <div class="stat-label">Mess Orders</div>
        </div>
        <div class="stat-card fade-in">
            <div class="stat-icon">🍕</div>
            <div class="stat-number">${stats.pending_fivestar || 0}</div>
            <div class="stat-label">Five Star Orders</div>
        </div>
        <div class="stat-card fade-in">
            <div class="stat-icon">☕</div>
            <div class="stat-number">${stats.pending_ccd || 0}</div>
            <div class="stat-label">CCD Orders</div>
        </div>
    `;
}

// ==================== REQUEST HANDLING ====================

async function loadRecentRequests() {
    const statusList = document.getElementById('status-list');
    if (!statusList) return;
    
    statusList.innerHTML = '<div class="loading">Loading requests...</div>';
    
    try {
        // Load requests from all services
        const services = ['outing-requests', 'xerox-orders', 'mess-orders', 'fivestar-orders', 'ccd-orders', 'stationary-orders'];
        let allRequests = [];
        
        for (const service of services) {
            try {
                const response = await fetch(`${API_BASE}/${service}?student_id=${currentStudentId}`, {
                    credentials: 'same-origin'
                });
                const data = await response.json();
                const requests = data.requests || data.orders || [];
                
                // Add service type to each request
                requests.forEach(r => {
                    r.serviceType = service.replace('-requests', '').replace('-orders', '');
                });
                
                allRequests = allRequests.concat(requests);
            } catch (e) {
                console.warn(`Could not load ${service}:`, e);
            }
        }
        
        // Sort by date
        allRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Filter by tab
        if (currentTab !== 'all') {
            allRequests = allRequests.filter(r => r.serviceType === currentTab);
        }
        
        // Display requests
        displayRequests(allRequests);
        
    } catch (error) {
        console.error('Error loading requests:', error);
        statusList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No requests found. Start by placing an order!</p>
            </div>
        `;
    }
}

function displayRequests(requests) {
    const statusList = document.getElementById('status-list');
    if (!statusList) return;
    
    if (requests.length === 0) {
        statusList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No requests found in this category.</p>
            </div>
        `;
        return;
    }
    
    statusList.innerHTML = requests.map(request => {
        const serviceIcons = {
            'outing': '🚶',
            'xerox': '🖨️',
            'mess': '🍽️',
            'fivestar': '🍕',
            'ccd': '☕',
            'stationary': '📝'
        };
        
        const serviceNames = {
            'outing': 'Outing Request',
            'xerox': 'Xerox Order',
            'mess': 'Mess Order',
            'fivestar': 'Five Star',
            'ccd': 'CCD',
            'stationary': 'Stationary'
        };
        
        const details = getRequestDetails(request);
        const date = new Date(request.created_at).toLocaleDateString();
        
        return `
            <div class="status-item fade-in">
                <div class="status-info">
                    <h4>${serviceIcons[request.serviceType] || '📌'} ${serviceNames[request.serviceType] || request.serviceType}</h4>
                    <p>${details} • ${date}</p>
                </div>
                <span class="status-badge ${request.status}">${request.status}</span>
            </div>
        `;
    }).join('');
}

function getRequestDetails(request) {
    switch (request.serviceType) {
        case 'outing':
            return `${request.reason} - ${new Date(request.outing_date).toLocaleDateString()}`;
        case 'xerox':
            return `${request.pages} pages - ${request.delivery_location}`;
        case 'mess':
            return `${request.meal_type} (Qty: ${request.quantity})`;
        case 'fivestar':
            return `${request.item} (Qty: ${request.quantity})`;
        case 'ccd':
            return `${request.item} - ${request.size}`;
        case 'stationary':
            return `${request.item} (Qty: ${request.quantity})`;
        default:
            return 'Service request';
    }
}

// ==================== MODAL FUNCTIONS ====================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
});

// ==================== OUTING REQUEST ====================

async function submitOutingRequest() {
    const form = document.getElementById('outingForm');
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Submitting...';
    submitBtn.disabled = true;

    try {
        const formData = {
            student_id: currentStudentId,
            outing_date: document.getElementById('outingDate').value,
            return_date: document.getElementById('returnDate').value,
            reason: document.getElementById('outingReason').value,
            details: document.getElementById('outingDetails').value || null,
            emergency_contact: document.getElementById('outingEmergency').value
        };

        const response = await fetch(`${API_BASE}/outing-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Outing request submitted successfully!', 'success');
            closeModal('outingModal');
            form.reset();
            await loadDashboardStats();
            await loadRecentRequests();
            
            // Send WhatsApp notification
            sendWhatsAppNotification('outing', result.request);
        } else {
            showToast(result.error || 'Failed to submit request', 'error');
        }
    } catch (error) {
        console.error('Error submitting outing request:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== XEROX ORDER ====================

async function submitXeroxOrder() {
    const form = document.getElementById('xeroxForm');
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Ordering...';
    submitBtn.disabled = true;

    try {
        const formData = {
            student_id: currentStudentId,
            service_type: document.getElementById('xeroxService').value,
            pages: parseInt(document.getElementById('xeroxPages').value) || 1,
            delivery_location: document.getElementById('xeroxDelivery').value,
            instructions: document.getElementById('xeroxInstructions').value || null,
            contact_number: document.getElementById('xeroxContact').value
        };

        const response = await fetch(`${API_BASE}/xerox-orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Xerox order submitted successfully!', 'success');
            closeModal('xeroxModal');
            form.reset();
            await loadDashboardStats();
            await loadRecentRequests();
            
            sendWhatsAppNotification('xerox', result.order);
        } else {
            showToast(result.error || 'Failed to submit order', 'error');
        }
    } catch (error) {
        console.error('Error submitting xerox order:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== MESS ORDER ====================

async function submitMessOrder() {
    const form = document.getElementById('messForm');
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Ordering...';
    submitBtn.disabled = true;

    try {
        const formData = {
            student_id: currentStudentId,
            meal_type: document.getElementById('messMealType').value,
            meal_date: document.getElementById('messDate').value,
            quantity: parseInt(document.getElementById('messQuantity').value) || 1,
            special_requests: document.getElementById('messRequests').value || null
        };

        const response = await fetch(`${API_BASE}/mess-orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Mess order submitted successfully!', 'success');
            closeModal('messModal');
            form.reset();
            await loadDashboardStats();
            await loadRecentRequests();
            
            sendWhatsAppNotification('mess', result.order);
        } else {
            showToast(result.error || 'Failed to submit order', 'error');
        }
    } catch (error) {
        console.error('Error submitting mess order:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== FIVESTAR ORDER ====================

async function submitFivestarOrder() {
    const form = document.getElementById('fivestarForm');
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Ordering...';
    submitBtn.disabled = true;

    try {
        const formData = {
            student_id: currentStudentId,
            category: document.getElementById('fivestarCategory').value,
            item: document.getElementById('fivestarItem').value,
            quantity: parseInt(document.getElementById('fivestarQuantity').value) || 1,
            delivery_option: document.getElementById('fivestarDelivery').value,
            instructions: document.getElementById('fivestarInstructions').value || null,
            contact_number: document.getElementById('fivestarContact').value
        };

        const response = await fetch(`${API_BASE}/fivestar-orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Five Star order submitted successfully!', 'success');
            closeModal('fivestarModal');
            form.reset();
            await loadDashboardStats();
            await loadRecentRequests();
            
            sendWhatsAppNotification('fivestar', result.order);
        } else {
            showToast(result.error || 'Failed to submit order', 'error');
        }
    } catch (error) {
        console.error('Error submitting fivestar order:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== CCD ORDER ====================

async function submitCCDOrder() {
    const form = document.getElementById('ccdForm');
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Ordering...';
    submitBtn.disabled = true;

    try {
        const formData = {
            student_id: currentStudentId,
            category: document.getElementById('ccdCategory').value,
            item: document.getElementById('ccdItem').value,
            quantity: parseInt(document.getElementById('ccdQuantity').value) || 1,
            size: document.getElementById('ccdSize').value,
            instructions: document.getElementById('ccdInstructions').value || null,
            contact_number: document.getElementById('ccdContact').value
        };

        const response = await fetch(`${API_BASE}/ccd-orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('CCD order submitted successfully!', 'success');
            closeModal('ccdModal');
            form.reset();
            await loadDashboardStats();
            await loadRecentRequests();
            
            sendWhatsAppNotification('ccd', result.order);
        } else {
            showToast(result.error || 'Failed to submit order', 'error');
        }
    } catch (error) {
        console.error('Error submitting CCD order:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== STATIONARY ORDER ====================

async function submitStationaryOrder() {
    const form = document.getElementById('stationaryForm');
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Ordering...';
    submitBtn.disabled = true;

    try {
        const formData = {
            student_id: currentStudentId,
            category: document.getElementById('stationaryCategory').value,
            item: document.getElementById('stationaryItem').value,
            quantity: parseInt(document.getElementById('stationaryQuantity').value) || 1,
            delivery_option: document.getElementById('stationaryDelivery').value,
            instructions: document.getElementById('stationaryInstructions').value || null,
            contact_number: document.getElementById('stationaryContact').value
        };

        const response = await fetch(`${API_BASE}/stationary-orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Stationary order submitted successfully!', 'success');
            closeModal('stationaryModal');
            form.reset();
            await loadDashboardStats();
            await loadRecentRequests();
            
            sendWhatsAppNotification('stationary', result.order);
        } else {
            showToast(result.error || 'Failed to submit order', 'error');
        }
    } catch (error) {
        console.error('Error submitting stationary order:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== WHATSAPP INTEGRATION ====================

function sendWhatsAppNotification(service, data) {
    const phoneNumbers = {
        'outing': '+919380126330',      // Security Office
        'xerox': '+919380126330',       // Xerox Shop
        'mess': '+919380126330',        // Mess Manager
        'fivestar': '+919380126330',    // Five Star
        'ccd': '+919380126330',         // CCD
        'stationary': '+919380126330'   // Stationary Shop
    };
    
    const phone = phoneNumbers[service];
    const message = formatWhatsAppMessage(service, data);
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
}

function formatWhatsAppMessage(service, data) {
    const templates = {
        'outing': `*Outing Request*%0A%0ADate: ${data.outing_date}%0AReturn: ${data.return_date}%0AReason: ${data.reason}%0ADetails: ${data.details || 'None'}%0AEmergency Contact: ${data.emergency_contact}`,
        
        'xerox': `*Xerox Order*%0A%0AService: ${data.service_type}%0APages: ${data.pages}%0ADelivery: ${data.delivery_location}%0AInstructions: ${data.instructions || 'None'}%0AContact: ${data.contact_number}`,
        
        'mess': `*Mess Order*%0A%0AMeal: ${data.meal_type}%0ADate: ${data.meal_date}%0AQuantity: ${data.quantity}%0ASpecial Requests: ${data.special_requests || 'None'}`,
        
        'fivestar': `*Five Star Order*%0A%0ACategory: ${data.category}%0AItem: ${data.item}%0AQuantity: ${data.quantity}%0ADelivery: ${data.delivery_option}%0AInstructions: ${data.instructions || 'None'}%0AContact: ${data.contact_number}`,
        
        'ccd': `*CCD Order*%0A%0ACategory: ${data.category}%0AItem: ${data.item}%0AQuantity: ${data.quantity}%0ASize: ${data.size}%0AInstructions: ${data.instructions || 'None'}%0AContact: ${data.contact_number}`,
        
        'stationary': `*Stationary Order*%0A%0ACategory: ${data.category}%0AItem: ${data.item}%0AQuantity: ${data.quantity}%0ADelivery: ${data.delivery_option}%0AInstructions: ${data.instructions || 'None'}%0AContact: ${data.contact_number}`
    };
    
    return templates[service] || `*${service} Request*%0A%0AOrder ID: ${data.id}`;
}

// ==================== TOAST NOTIFICATIONS ====================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ==================== HELPER FUNCTIONS ====================

// Set minimum date for outing and mess dates
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    
    const outingDate = document.getElementById('outingDate');
    const messDate = document.getElementById('messDate');
    
    if (outingDate) outingDate.setAttribute('min', today);
    if (messDate) messDate.setAttribute('min', today);
    
    // Set default return date to same day
    if (outingDate) {
        outingDate.addEventListener('change', function() {
            const returnDate = document.getElementById('returnDate');
            if (returnDate) {
                returnDate.setAttribute('min', this.value);
            }
        });
    }
});

// Export functions to global scope for onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.submitOutingRequest = submitOutingRequest;
window.submitXeroxOrder = submitXeroxOrder;
window.submitMessOrder = submitMessOrder;
window.submitFivestarOrder = submitFivestarOrder;
window.submitCCDOrder = submitCCDOrder;
window.submitStationaryOrder = submitStationaryOrder;
window.showToast = showToast;

// ==================== AUTHENTICATION ====================

// Global auth state
let currentUser = null;
let isLoggedIn = false;

// Check authentication state on page load
async function checkAuth() {
    try {
        const response = await fetch('/api/me', {
            credentials: 'same-origin'
        });
        if (response.ok) {
            currentUser = await response.json();
            isLoggedIn = true;
            currentStudentId = currentUser.id; // Update currentStudentId from authenticated user
            showMainApp();
            updateUserInfo();
        } else {
            // Not logged in, show auth screen
            showAuthScreen();
        }
    } catch (error) {
        console.error('Error checking auth:', error);
        // Show auth screen if API not available
        showAuthScreen();
    }
}

// Show main app and hide auth screen
function showMainApp() {
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (authScreen) {
        authScreen.classList.add('hidden');
    }
    if (mainApp) {
        mainApp.classList.add('active');
    }
    
    // Initialize the app
    loadDashboardStats();
    loadRecentRequests();
}

// Show auth screen and hide main app
function showAuthScreen() {
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (authScreen) {
        authScreen.classList.remove('hidden');
    }
    if (mainApp) {
        mainApp.classList.remove('active');
    }
}

// Update user info in header
function updateUserInfo() {
    if (!currentUser) return;
    
    const displayName = document.getElementById('displayName');
    const displayId = document.getElementById('displayId');
    
    if (displayName) displayName.textContent = currentUser.name;
    if (displayId) displayId.textContent = currentUser.student_id;
}

// Switch between login and signup tabs
function switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        if (loginError) {
            loginError.classList.remove('show');
            loginError.textContent = '';
        }
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        if (signupError) {
            signupError.classList.remove('show');
            signupError.textContent = '';
        }
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const loginId = document.getElementById('loginId').value;
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    
    if (!loginId || !password) {
        if (loginError) {
            loginError.textContent = 'Please enter both ID and password';
            loginError.classList.add('show');
        }
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Logging in...';
    if (loginError) loginError.classList.remove('show');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ login_id: loginId, password: password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.student;
            isLoggedIn = true;
            currentStudentId = data.student.id; // Update currentStudentId on login
            showToast('Login successful!', 'success');
            showMainApp();
            updateUserInfo();
            
            // Reset form
            document.getElementById('loginForm').reset();
        } else {
            if (loginError) {
                loginError.textContent = data.error || 'Login failed';
                loginError.classList.add('show');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (loginError) {
            loginError.textContent = 'Cannot connect to server. Make sure the Flask server is running on http://localhost:5001';
            loginError.classList.add('show');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login';
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    const form = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const studentId = document.getElementById('studentId').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const emergencyContact = document.getElementById('emergencyContact').value;
    const hostelRoom = document.getElementById('hostelRoom').value;
    const bloodGroup = document.getElementById('bloodGroup').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        if (signupError) {
            signupError.textContent = 'Passwords do not match';
            signupError.classList.add('show');
        }
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        if (signupError) {
            signupError.textContent = 'Password must be at least 6 characters';
            signupError.classList.add('show');
        }
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating account...';
    if (signupError) signupError.classList.remove('show');
    
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                name: `${firstName} ${lastName}`,
                student_id: studentId,
                email: email,
                phone: phone,
                password: password,
                emergency_contact: emergencyContact,
                hostel_room: hostelRoom,
                blood_group: bloodGroup
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.student;
            isLoggedIn = true;
            currentStudentId = data.student.id; // Update currentStudentId on signup
            showToast('Account created successfully!', 'success');
            showMainApp();
            updateUserInfo();
            
            // Switch to login tab
            switchAuthTab('login');
            
            // Pre-fill login form
            document.getElementById('loginId').value = studentId;
            
            // Reset form
            form.reset();
        } else {
            if (signupError) {
                signupError.textContent = data.error || 'Signup failed';
                signupError.classList.add('show');
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        if (signupError) {
            signupError.textContent = 'Network error. Please try again.';
            signupError.classList.add('show');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
    }
}

// Demo login
async function loginDemo() {
    const loginError = document.getElementById('loginError');
    const demoBtn = document.querySelector('.demo-btn-container button');
    
    if (demoBtn) {
        demoBtn.disabled = true;
        demoBtn.innerHTML = '<span class="loading-spinner"></span> Logging in...';
    }
    if (loginError) loginError.classList.remove('show');
    
    try {
        const response = await fetch('/api/demo-login', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.student;
            isLoggedIn = true;
            currentStudentId = data.student.id; // Update currentStudentId on demo login
            showToast('Demo login successful!', 'success');
            showMainApp();
            updateUserInfo();
        } else {
            if (loginError) {
                loginError.textContent = data.error || 'Demo login failed';
                loginError.classList.add('show');
            }
        }
    } catch (error) {
        console.error('Demo login error:', error);
        // Fallback: Show main app without authentication
        showToast('Demo mode activated', 'info');
        showMainApp();
    } finally {
        if (demoBtn) {
            demoBtn.disabled = false;
            demoBtn.innerHTML = '<i class="fas fa-user"></i> Try Demo Account';
        }
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', { 
            method: 'POST',
            credentials: 'same-origin'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    currentUser = null;
    isLoggedIn = false;
    showToast('Logged out successfully', 'success');
    showAuthScreen();
}

// Show profile modal
function showProfile() {
    if (!currentUser) return;
    
    // Populate profile modal with user data
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileStudentId').textContent = currentUser.student_id;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileHostel').textContent = currentUser.hostel_room;
    document.getElementById('profileBlood').textContent = currentUser.blood_group;
    document.getElementById('profileEmergency').textContent = currentUser.emergency_contact || 'Not provided';
    
    openModal('profileModal');
}

// Export auth functions to global scope
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.loginDemo = loginDemo;
window.logout = logout;
window.showProfile = showProfile;
window.checkAuth = checkAuth;

