const SUPABASE_URL = window.RANTECH_SUPABASE?.url;
const SUPABASE_KEY = window.RANTECH_SUPABASE?.publishableKey;

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_KEY.includes('PASTE_')) {
  console.warn('Add your Supabase publishable key in config.js before using authentication.');
}

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function showMessage(message, type = 'error') {
  const box = document.getElementById('message');
  if (!box) return;
  box.textContent = message;
  box.className = `message ${type}`;
  box.hidden = false;
}

function setBusy(button, busy, busyText) {
  if (!button) return;
  button.disabled = busy;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const fullName = form.full_name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters.');
    return;
  }

  setBusy(button, true, 'Creating account...');
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  setBusy(button, false);

  if (error) {
    showMessage(error.message);
    return;
  }

  if (data.session) {
    window.location.href = 'dashboard.html';
  } else {
    showMessage('Account created. Check your email to confirm your account, then log in.', 'success');
    form.reset();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const email = form.email.value.trim();
  const password = form.password.value;

  setBusy(button, true, 'Logging in...');
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  setBusy(button, false);

  if (error) {
    showMessage(error.message);
    return;
  }
  window.location.href = 'dashboard.html';
}

async function requireUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data.user) {
    window.location.href = 'login.html';
    return null;
  }
  return data.user;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

window.RantechAuth = { supabaseClient, handleSignup, handleLogin, requireUser, logout };
