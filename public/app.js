const API_URL = window.location.origin + '/api';
let token = localStorage.getItem('token');
let currentGame = null;
let selectedBet = null;
let socket = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        loadUserData();
        showGame();
        initSocket();
    } else {
        showAuth();
    }

    // Form handlers
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('resultForm')?.addEventListener('submit', handleGenerateResult);
});

// Socket.IO
function initSocket() {
    socket = io();
    
    socket.on('gameResult', (data) => {
        console.log('Game result:', data);
        loadGameData();
        loadBetHistory();
    });
}

// Auth Functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            loadUserData();
            showGame();
            initSocket();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const referralCode = document.getElementById('regReferral').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, phone, password, referralCode })
        });

        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            loadUserData();
            showGame();
            initSocket();
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    if (socket) socket.disconnect();
    showAuth();
}

// Page Navigation
function showAuth() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('authPage').classList.add('active');
}

function showGame() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('gamePage').classList.add('active');
    loadGameData();
    loadBetHistory();
    loadResults();
    startTimer();
}

function showWallet() {
    const amount = prompt('Enter amount to add to wallet (₹10 - ₹10,000):');
    if (amount) {
        addBalance(parseInt(amount));
    }
}

async function addBalance(amount) {
    try {
        const response = await fetch(`${API_URL}/wallet/add-balance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(`₹${amount} added to your wallet!`);
            loadUserData();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Failed to add balance: ' + error.message);
    }
}

function showHistory() {
    alert('History page - Coming soon!');
}

function showProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.isAdmin) {
        showAdmin();
    } else {
        alert(`Profile\nUsername: ${user.username}\nBalance: ₹${user.balance}\nReferral Code: ${user.referralCode}`);
    }
}

function showAdmin() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('adminPage').classList.add('active');
    loadAdminData();
}

// Load User Data
async function loadUserData() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            document.getElementById('userBalance').textContent = `₹${data.user.balance}`;
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

// Game Functions
async function loadGameData() {
    try {
        const response = await fetch(`${API_URL}/game/current`);
        const data = await response.json();
        
        if (response.ok) {
            currentGame = data.game;
            document.getElementById('gamePeriod').textContent = currentGame.period;
        }
    } catch (error) {
        console.error('Failed to load game:', error);
    }
}

function startTimer() {
    setInterval(() => {
        if (!currentGame) return;
        
        const endTime = new Date(currentGame.endTime);
        const now = new Date();
        const diff = endTime - now;
        
        if (diff <= 0) {
            document.getElementById('countdown').textContent = '00:00';
            loadGameData();
            return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        document.getElementById('countdown').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function selectColor(color) {
    selectedBet = { type: 'color', value: color };
    document.querySelectorAll('.color-btn').forEach(btn => btn.style.opacity = '0.5');
    event.target.closest('.color-btn').style.opacity = '1';
}

function selectNumber(number) {
    selectedBet = { type: 'number', value: number.toString() };
    document.querySelectorAll('.number-btn').forEach(btn => btn.style.opacity = '0.5');
    event.target.style.opacity = '1';
}

function setAmount(amount) {
    document.getElementById('customAmount').value = amount;
}

async function placeBet() {
    if (!selectedBet) {
        alert('Please select a color or number');
        return;
    }

    const amount = parseInt(document.getElementById('customAmount').value);
    if (!amount || amount < 10) {
        alert('Minimum bet is ₹10');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/game/bet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                gameId: currentGame.gameId,
                betType: selectedBet.type,
                betValue: selectedBet.value,
                amount
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Bet placed successfully!');
            loadUserData();
            loadBetHistory();
            selectedBet = null;
            document.getElementById('customAmount').value = '';
            document.querySelectorAll('.color-btn, .number-btn').forEach(btn => btn.style.opacity = '1');
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Failed to place bet: ' + error.message);
    }
}

async function loadBetHistory() {
    try {
        const response = await fetch(`${API_URL}/game/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        
        if (response.ok) {
            const betsList = document.getElementById('betsList');
            betsList.innerHTML = data.bets.slice(0, 10).map(bet => `
                <div style="padding: 10px; border-bottom: 1px solid #eee;">
                    <div>Period: ${bet.period}</div>
                    <div>Bet: ${bet.betValue} - ₹${bet.amount}</div>
                    <div style="color: ${bet.result === 'win' ? 'green' : bet.result === 'loss' ? 'red' : 'orange'}">
                        ${bet.result === 'win' ? `Won ₹${bet.winAmount}` : bet.result === 'loss' ? 'Lost' : 'Pending'}
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load bet history:', error);
    }
}

async function loadResults() {
    try {
        const response = await fetch(`${API_URL}/game/results`);
        const data = await response.json();
        
        if (response.ok) {
            const resultsList = document.getElementById('resultsList');
            resultsList.innerHTML = data.results.slice(0, 10).map(game => `
                <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                    <span>Period: ${game.period}</span>
                    <span style="color: ${game.result.color}; font-weight: bold;">
                        ${game.result.color.toUpperCase()} - ${game.result.number}
                    </span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load results:', error);
    }
}

// Admin Functions
async function loadAdminData() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('totalUsers').textContent = data.totalUsers;
            document.getElementById('totalDeposits').textContent = `₹${data.totalDeposits}`;
            document.getElementById('totalWithdrawals').textContent = `₹${data.totalWithdrawals}`;
            document.getElementById('totalBets').textContent = data.totalBets;
        }

        loadWithdrawals();
        loadUsers();
    } catch (error) {
        console.error('Failed to load admin data:', error);
    }
}

async function loadWithdrawals() {
    try {
        const response = await fetch(`${API_URL}/admin/withdrawals`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        
        if (response.ok) {
            const list = document.getElementById('withdrawalsList');
            list.innerHTML = data.withdrawals.map(w => `
                <div style="padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px;">
                    <div>User: ${w.userId.username} (${w.userId.email})</div>
                    <div>Amount: ₹${w.amount}</div>
                    <div>Phone: ${w.userId.phone}</div>
                    <button onclick="processWithdrawal('${w._id}', 'completed')">Approve</button>
                    <button onclick="processWithdrawal('${w._id}', 'rejected')">Reject</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load withdrawals:', error);
    }
}

async function processWithdrawal(id, status) {
    try {
        const response = await fetch(`${API_URL}/admin/withdrawals/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert('Withdrawal processed');
            loadWithdrawals();
        }
    } catch (error) {
        alert('Failed to process withdrawal');
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        
        if (response.ok) {
            const list = document.getElementById('usersList');
            list.innerHTML = data.users.slice(0, 20).map(u => `
                <div style="padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px;">
                    <div>Username: ${u.username}</div>
                    <div>Email: ${u.email}</div>
                    <div>Balance: ₹${u.balance}</div>
                    <div>Status: ${u.isActive ? 'Active' : 'Suspended'}</div>
                    <button onclick="toggleUserStatus('${u._id}', ${!u.isActive})">
                        ${u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

async function toggleUserStatus(userId, isActive) {
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isActive })
        });

        if (response.ok) {
            alert('User status updated');
            loadUsers();
        }
    } catch (error) {
        alert('Failed to update user status');
    }
}

async function handleGenerateResult(e) {
    e.preventDefault();
    const gameId = document.getElementById('resultGameId').value;
    const color = document.getElementById('resultColor').value;
    const number = parseInt(document.getElementById('resultNumber').value);

    try {
        const response = await fetch(`${API_URL}/admin/game/result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ gameId, color, number })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Result generated successfully!');
            document.getElementById('resultForm').reset();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Failed to generate result: ' + error.message);
    }
}