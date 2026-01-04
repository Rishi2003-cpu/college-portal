// College Portal - Main JavaScript

// Initialize data from localStorage
let users = JSON.parse(localStorage.getItem('collegePortalUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('collegePortalCurrentUser')) || null;
let currentFilter = 'All';

// Check if already logged in
document.addEventListener('DOMContentLoaded', function() {
    if (currentUser) {
        showMainApp();
    }
    // Set minimum date for date inputs
    setMinDates();
});

// Set minimum dates for date inputs
function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    
    const outingDate = document.getElementById('outing-date');
    const returnDate = document.getElementById('return-date');
    const messDate = document.getElementById('mess-date');
    
    if (outingDate) outingDate.min = today;
    if (returnDate) returnDate.min = today;
    if (messDate) messDate.min = today;
}

// Switch between Login and Signup tabs
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

// Handle Signup
function handleSignup(event) {
    event.preventDefault();
    const errorEl = document.getElementById('signupError');
    errorEl.style.display = 'none';
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const emergencyContact = document.getElementById('emergencyContact').value.trim();
    const hostelRoom = document.getElementById('hostelRoom').value.trim();
    const bloodGroup = document.getElementById('bloodGroup').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match!';
        errorEl.style.display = 'block';
        return;
    }
    
    if (users.some(u => u.studentId === studentId)) {
        errorEl.textContent = 'Student ID already registered!';
        errorEl.style.display = 'block';
        return;
    }
    
    if (users.some(u => u.email === email)) {
        errorEl.textContent = 'Email already registered!';
        errorEl.style.display = 'block';
        return;
    }
    
    const newUser = {
        firstName,
        lastName,
        studentId,
        email,
        phone,
        emergencyContact,
        hostelRoom,
        bloodGroup,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('collegePortalUsers', JSON.stringify(users));
    
    showToast('Account created successfully! Please login.');
    switchAuthTab('login');
    document.getElementById('signupForm').reset();
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';
    
    const loginId = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => (u.studentId === loginId || u.phone === loginId) && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('collegePortalCurrentUser', JSON.stringify(user));
        showMainApp();
        showToast('Welcome back, ' + user.firstName + '!');
    } else {
        errorEl.textContent = 'Invalid credentials!';
        errorEl.style.display = 'block';
    }
}

// Show main app after login
function showMainApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainApp').classList.add('active');
    document.getElementById('displayName').textContent = currentUser.firstName + ' ' + currentUser.lastName;
    document.getElementById('displayId').textContent = currentUser.studentId;
    document.getElementById('welcomeMsg').textContent = 'Welcome, ' + currentUser.firstName + '!';
    loadDashboardStats();
    loadOrders();
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('collegePortalCurrentUser');
    document.getElementById('mainApp').classList.remove('active');
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('loginForm').reset();
}

// Show Profile
function showProfile() {
    const content = `
        <div class="form-group">
            <label>Full Name</label>
            <p>${currentUser.firstName} ${currentUser.lastName}</p>
        </div>
        <div class="form-group">
            <label>Student ID</label>
            <p>${currentUser.studentId}</p>
        </div>
        <div class="form-group">
            <label>Email</label>
            <p>${currentUser.email}</p>
        </div>
        <div class="form-group">
            <label>Phone</label>
            <p>${currentUser.phone}</p>
        </div>
        <div class="form-group">
            <label>Emergency Contact</label>
            <p>${currentUser.emergencyContact}</p>
        </div>
        <div class="form-group">
            <label>Hostel/Room</label>
            <p>${currentUser.hostelRoom}</p>
        </div>
        <div class="form-group">
            <label>Blood Group</label>
            <p>${currentUser.bloodGroup}</p>
        </div>
    `;
    document.getElementById('profileContent').innerHTML = content;
    openModal('profileModal');
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// Submit Outing
function submitOuting(event) {
    event.preventDefault();
    
    const outingDate = document.getElementById('outing-date').value;
    const returnDate = document.getElementById('return-date').value;
    
    if (returnDate < outingDate) {
        showToast('Return date must be after outing date!', 'error');
        return;
    }
    
    const order = {
        type: 'Outing',
        date: outingDate,
        returnDate: returnDate,
        reason: document.getElementById('outing-reason').value,
        details: document.getElementById('outing-details').value,
        contact: document.getElementById('outing-contact').value,
        status: 'Pending',
        timestamp: new Date().toISOString()
    };
    
    saveOrder(order);
    closeModal('outingModal');
    event.target.reset();
    showToast('Outing request submitted successfully!');
}

// Submit other orders
function submitOrder(event, type) {
    event.preventDefault();
    let order = { type, status: 'Pending', timestamp: new Date().toISOString() };
    
    if (type === 'Xerox') {
        order.service = document.getElementById('xerox-service').value;
        order.pages = document.getElementById('xerox-pages').value;
        order.delivery = document.getElementById('xerox-delivery').value;
        order.instructions = document.getElementById('xerox-instructions').value;
        order.contact = document.getElementById('xerox-contact').value;
    } else if (type === 'Mess') {
        order.meal = document.getElementById('mess-meal').value;
        order.date = document.getElementById('mess-date').value;
        order.quantity = document.getElementById('mess-qty').value;
        order.requests = document.getElementById('mess-requests').value;
    } else if (type === 'Five Star') {
        order.category = document.getElementById('fs-category').value;
        order.item = document.getElementById('fs-item').value;
        order.quantity = document.getElementById('fs-qty').value;
        order.delivery = document.getElementById('fs-delivery').value;
        order.instructions = document.getElementById('fs-instructions').value;
        order.contact = document.getElementById('fs-contact').value;
    } else if (type === 'CCD') {
        order.category = document.getElementById('ccd-category').value;
        order.item = document.getElementById('ccd-item').value;
        order.quantity = document.getElementById('ccd-qty').value;
        order.size = document.getElementById('ccd-size').value;
        order.instructions = document.getElementById('ccd-instructions').value;
        order.contact = document.getElementById('ccd-contact').value;
    } else if (type === 'Stationery') {
        order.category = document.getElementById('stat-category').value;
        order.item = document.getElementById('stat-item').value;
        order.quantity = document.getElementById('stat-qty').value;
        order.delivery = document.getElementById('stat-delivery').value;
        order.instructions = document.getElementById('stat-instructions').value;
        order.contact = document.getElementById('stat-contact').value;
    }
    
    saveOrder(order);
    
    const modalMap = {
        'Xerox': 'xeroxModal',
        'Mess': 'messModal',
        'Five Star': 'fivestarModal',
        'CCD': 'ccdModal',
        'Stationery': 'stationaryModal'
    };
    
    closeModal(modalMap[type]);
    event.target.reset();
    showToast(type + ' order submitted successfully!');
}

// Save order to localStorage
function saveOrder(order) {
    let allOrders = JSON.parse(localStorage.getItem('collegePortalOrders')) || [];
    order.id = Date.now();
    order.userId = currentUser.studentId;
    order.studentName = currentUser.firstName + ' ' + currentUser.lastName;
    allOrders.push(order);
    localStorage.setItem('collegePortalOrders', JSON.stringify(allOrders));
    loadDashboardStats();
    loadOrders();
}

// Load dashboard stats
function loadDashboardStats() {
    const allOrders = JSON.parse(localStorage.getItem('collegePortalOrders')) || [];
    const userOrders = allOrders.filter(o => o.userId === currentUser.studentId);
    
    document.getElementById('stat-total').textContent = userOrders.length;
    document.getElementById('stat-outing').textContent = userOrders.filter(o => o.type === 'Outing').length;
    document.getElementById('stat-xerox').textContent = userOrders.filter(o => o.type === 'Xerox').length;
    document.getElementById('stat-mess').textContent = userOrders.filter(o => o.type === 'Mess').length;
    document.getElementById('stat-fivestar').textContent = userOrders.filter(o => o.type === 'Five Star').length;
    document.getElementById('stat-ccd').textContent = userOrders.filter(o => o.type === 'CCD').length;
}

// Load orders
function loadOrders() {
    const allOrders = JSON.parse(localStorage.getItem('collegePortalOrders')) || [];
    const userOrders = allOrders.filter(o => o.userId === currentUser.studentId);
    const container = document.getElementById('status-list');
    
    let filtered = currentFilter === 'All' ? userOrders : userOrders.filter(o => o.type === currentFilter);
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No requests yet!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.reverse().map(order => `
        <div class="status-item">
            <div>
                <strong>${order.type}</strong>
                <p>${getOrderDetails(order)}</p>
                <small>${new Date(order.timestamp).toLocaleString()}</small>
            </div>
            <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span>
        </div>
    `).join('');
}

// Get order details
function getOrderDetails(order) {
    if (order.type === 'Outing') {
        return `${order.date} to ${order.returnDate} - ${order.reason}`;
    }
    if (order.type === 'Xerox') {
        return `${order.service}, ${order.pages} pages - ${order.delivery}`;
    }
    if (order.type === 'Mess') {
        return `${order.meal} on ${order.date}, Qty: ${order.quantity}`;
    }
    if (order.type === 'Five Star') {
        return `${order.category} - ${order.item}, Qty: ${order.quantity}`;
    }
    if (order.type === 'CCD') {
        return `${order.category} - ${order.item}, ${order.size}`;
    }
    if (order.type === 'Stationery') {
        return `${order.category} - ${order.item}, Qty: ${order.quantity}`;
    }
    return '';
}

// Filter orders
function filterOrders(type, btn) {
    currentFilter = type;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadOrders();
}

// Toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${type === 'success' ? '✓' : '!'}</span><span>${message}</span>`;
    
    if (type === 'error') {
        toast.style.background = '#e63946';
    }
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// API Integration Functions (for backend connection)
async function submitToAPI(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            return { success: true, data: result };
        } else {
            return { success: false, error: result.error || 'Request failed' };
        }
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// Submit outing via API
async function submitOutingAPI(event) {
    event.preventDefault();
    
    const formData = {
        student_id: currentUser.id || 1, // Will be set after backend integration
        outing_date: document.getElementById('outing-date').value,
        return_date: document.getElementById('return-date').value,
        reason: document.getElementById('outing-reason').value,
        details: document.getElementById('outing-details').value,
        emergency_contact: document.getElementById('outing-contact').value
    };
    
    const result = await submitToAPI('/api/outing-requests', formData);
    
    if (result.success) {
        showToast('Outing request submitted successfully!');
        closeModal('outingModal');
        event.target.reset();
    } else {
        showToast(result.error, 'error');
    }
}

// Submit mess order via API
async function submitMessOrderAPI(event) {
    event.preventDefault();
    
    const formData = {
        student_id: currentUser.id || 1,
        meal_type: document.getElementById('mess-meal').value,
        meal_date: document.getElementById('mess-date').value,
        quantity: parseInt(document.getElementById('mess-qty').value),
        special_requests: document.getElementById('mess-requests').value
    };
    
    const result = await submitToAPI('/api/mess-orders', formData);
    
    if (result.success) {
        showToast('Mess order submitted successfully!');
        closeModal('messModal');
        event.target.reset();
    } else {
        showToast(result.error, 'error');
    }
}

// Submit xerox order via API
async function submitXeroxOrderAPI(event) {
    event.preventDefault();
    
    const formData = {
        student_id: currentUser.id || 1,
        service_type: document.getElementById('xerox-service').value,
        pages: parseInt(document.getElementById('xerox-pages').value),
        delivery_location: document.getElementById('xerox-delivery').value,
        instructions: document.getElementById('xerox-instructions').value,
        contact_number: document.getElementById('xerox-contact').value
    };
    
    const result = await submitToAPI('/api/xerox-orders', formData);
    
    if (result.success) {
        showToast('Xerox order submitted successfully!');
        closeModal('xeroxModal');
        event.target.reset();
    } else {
        showToast(result.error, 'error');
    }
}

// Submit Five Star order via API
async function submitFiveStarOrderAPI(event) {
    event.preventDefault();
    
    const formData = {
        student_id: currentUser.id || 1,
        category: document.getElementById('fs-category').value,
        item: document.getElementById('fs-item').value,
        quantity: parseInt(document.getElementById('fs-qty').value),
        delivery_option: document.getElementById('fs-delivery').value,
        instructions: document.getElementById('fs-instructions').value,
        contact_number: document.getElementById('fs-contact').value
    };
    
    const result = await submitToAPI('/api/fivestar-orders', formData);
    
    if (result.success) {
        showToast('Five Star order submitted successfully!');
        closeModal('fivestarModal');
        event.target.reset();
    } else {
        showToast(result.error, 'error');
    }
}

// Submit CCD order via API
async function submitCCDOrderAPI(event) {
    event.preventDefault();
    
    const formData = {
        student_id: currentUser.id || 1,
        category: document.getElementById('ccd-category').value,
        item: document.getElementById('ccd-item').value,
        quantity: parseInt(document.getElementById('ccd-qty').value),
        size: document.getElementById('ccd-size').value,
        instructions: document.getElementById('ccd-instructions').value,
        contact_number: document.getElementById('ccd-contact').value
    };
    
    const result = await submitToAPI('/api/ccd-orders', formData);
    
    if (result.success) {
        showToast('CCD order submitted successfully!');
        closeModal('ccdModal');
        event.target.reset();
    } else {
        showToast(result.error, 'error');
    }
}

// Submit Stationery order via API
async function submitStationeryOrderAPI(event) {
    event.preventDefault();
    
    const formData = {
        student_id: currentUser.id || 1,
        category: document.getElementById('stat-category').value,
        item: document.getElementById('stat-item').value,
        quantity: parseInt(document.getElementById('stat-qty').value),
        delivery_option: document.getElementById('stat-delivery').value,
        instructions: document.getElementById('stat-instructions').value,
        contact_number: document.getElementById('stat-contact').value
    };
    
    const result = await submitToAPI('/api/stationary-orders', formData);
    
    if (result.success) {
        showToast('Stationery order submitted successfully!');
        closeModal('stationaryModal');
        event.target.reset();
    } else {
        showToast(result.error, 'error');
    }
}

// Load orders from API
async function loadOrdersFromAPI() {
    try {
        const studentId = currentUser.id || 1;
        const response = await fetch(`/api/outing-requests?student_id=${studentId}`);
        const data = await response.json();
        
        if (response.ok) {
            return data.requests || [];
        }
    } catch (error) {
        console.error('Error loading orders from API:', error);
    }
    return [];
}

