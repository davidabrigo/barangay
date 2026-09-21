
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function setButtonLoading(btn, isLoading) {
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.spinner');
  if (isLoading) {
    btn.classList.add('loading');
    if (text) text.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
  } else {
    btn.classList.remove('loading');
    if (text) text.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}


function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  window.scrollTo(0, 0);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  if (pageId === 'profile') renderMyRequests();
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    const scroll = link.dataset.scroll;
    showPage(page);
    if (scroll) {
      setTimeout(() => {
        const el = document.getElementById(scroll);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  });
});

function updateFileName(input) {
  const name = input.files[0] ? input.files[0].name : 'No file chosen';
  document.getElementById('file-name').textContent = name;
}

function switchAuth(mode) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');

  if (mode === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
  }
}

function updateNavbar(isLoggedIn, userName) {
  const loginBtn = document.getElementById('nav-login-btn');
  const navUser = document.getElementById('nav-user');
  const navUserName = document.getElementById('nav-user-name');
  const navLoginLink = document.getElementById('nav-login-link');
  const navProfileLink = document.getElementById('nav-profile-link');

  if (isLoggedIn) {
    loginBtn.style.display = 'none';
    navUser.classList.add('visible');
    navUserName.textContent = userName || 'Resident';
    if (navLoginLink) navLoginLink.style.display = 'none';
    if (navProfileLink) navProfileLink.style.display = 'inline';
  } else {
    loginBtn.style.display = 'inline-block';
    navUser.classList.remove('visible');
    if (navLoginLink) navLoginLink.style.display = 'inline';
    if (navProfileLink) navProfileLink.style.display = 'none';
  }
}

function updateProfileUI(name) {
  const nameEl = document.getElementById('profile-name');
  const avatarEl = document.getElementById('profile-avatar');
  if (nameEl) nameEl.textContent = name;
  if (avatarEl) {
    const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    avatarEl.textContent = initials || 'R';
  }
}


async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  if (errEl) errEl.textContent = '';

  setButtonLoading(btn, true);

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    await delay(900); // loading animation

    // DEMO auth (palitan ng Supabase later)
    if (!email || !password) throw new Error('Please fill in all fields.');

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);

    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('staff');

    if (isAdmin) {
      localStorage.setItem('userRole', 'Staff Account');
      localStorage.setItem('userName', 'Staff Account');
      showToast('Welcome, Admin!');
      setTimeout(() => window.location.href = 'dashboard.html', 600);
    } else {
      localStorage.setItem('userRole', 'Resident');
      const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
      const displayName = nameFromEmail.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Resident';
      localStorage.setItem('userName', displayName);

      updateNavbar(true, displayName);
      updateProfileUI(displayName);
      showPage('profile');
      showToast('Welcome back, ' + displayName + '!');
    }
  } catch (err) {
    if (errEl) errEl.textContent = err.message || 'Login failed';
    showToast(err.message || 'Login failed', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}


async function handleSignup(e) {
  e.preventDefault();
  const btn = document.getElementById('signup-btn');
  const errEl = document.getElementById('signup-error');
  if (errEl) errEl.textContent = '';

  setButtonLoading(btn, true);

  const first = document.getElementById('signup-firstname').value.trim();
  const last = document.getElementById('signup-lastname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  try {
    await delay(1000);

    if (pass !== confirm) throw new Error('Passwords do not match.');
    if (pass.length < 6) throw new Error('Password must be at least 6 characters.');

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', 'Resident');
    const displayName = (first + ' ' + last).trim() || 'Resident';
    localStorage.setItem('userName', displayName);

    updateNavbar(true, displayName);
    updateProfileUI(displayName);
    showPage('profile');
    showToast('Account created! Welcome, ' + displayName);
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}


function handleLogout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  updateNavbar(false);
  showPage('home');
  showToast('Logged out successfully');
}


async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  setButtonLoading(btn, true);

  try {
    await delay(1100);

    const doctype = document.getElementById('req-doctype').value;
    const first = document.getElementById('req-firstname').value.trim();
    const last = document.getElementById('req-lastname').value.trim();

    
    const requests = JSON.parse(localStorage.getItem('myRequests') || '[]');
    requests.unshift({
      id: Date.now(),
      document: doctype,
      name: first + ' ' + last,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending'
    });
    localStorage.setItem('myRequests', JSON.stringify(requests));

    showToast('Request submitted! Track it in your profile.');
    e.target.reset();
    document.getElementById('file-name').textContent = 'No file chosen';

    if (localStorage.getItem('isLoggedIn') === 'true') {
      setTimeout(() => showPage('profile'), 700);
    }
  } catch (err) {
    showToast('Failed to submit request', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}


function renderMyRequests() {
  const container = document.getElementById('my-requests-list');
  if (!container) return;

  const requests = JSON.parse(localStorage.getItem('myRequests') || '[]');

  if (requests.length === 0) {
    container.innerHTML = `
      <div class="request-card" style="text-align:center;padding:2rem">
        <p style="color:var(--text-muted);margin-bottom:1rem">No requests yet.</p>
        <button class="btn btn-primary" onclick="showPage('request')">Submit your first request</button>
      </div>
    `;
    return;
  }

  container.innerHTML = requests.map(r => {
    const statusClass = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Ready for release': 'status-ready',
      'Released': 'status-released'
    }[r.status] || 'status-pending';

    const steps = ['Pending', 'Processing', 'Ready for Pickup'];
    const current = r.status === 'Ready for release' ? 2 : r.status === 'Processing' ? 1 : 0;

    return `
      <div class="request-card">
        <div class="request-card-top">
          <div>
            <div class="request-card-title">${r.document}</div>
            <div class="request-card-date">Filed on ${r.date}</div>
          </div>
          <span class="status-badge ${statusClass}">${r.status}</span>
        </div>
        <div class="progress-bar">
          ${steps.map((s, i) => `
            <div class="progress-step ${i < current ? 'done' : ''} ${i === current ? 'active' : ''}">
              <div class="dot"></div>${s}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}


(function () {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('userRole');
  const name = localStorage.getItem('userName') || 'Resident';

  if (isLoggedIn) {
    if (role === 'Staff Account') {
      window.location.href = 'dashboard.html';
      return;
    }
    updateNavbar(true, name);
    updateProfileUI(name);
    showPage('profile');
  } else {
    updateNavbar(false);
    if (window.location.hash === '#login') showPage('login');
  }
})();