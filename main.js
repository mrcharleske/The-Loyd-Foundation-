// Initialize AOS with error handling
try {
  if (typeof AOS !== 'undefined') {
    AOS.init({ once: true });
  }
} catch (err) {
  console.warn('AOS init failed:', err);
}

// Dynamic nav active state
function setActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === currentPath);
  });
}
setActiveNav(); // On load

// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.textContent = navMenu.classList.contains('active') ? '✖' : '☰';
    hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active'));
  });
}

// Dynamic Year in Footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Lazy video play
document.querySelectorAll('video[preload="metadata"]').forEach(video => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(e => console.warn('Video play failed:', e));
        observer.unobserve(video);
      }
    });
  }, { threshold: 0.5 });
  observer.observe(video);
});

// Donation Modal
const modalBackdrop = document.getElementById('modalBackdrop');
const modalSteps = document.getElementById('modalSteps');
const stepContent = document.getElementById('stepContent');
const modalClose = document.getElementById('modalClose');
const toStep2 = document.getElementById('toStep2');
const toStep3 = document.getElementById('toStep3');
const backToStep1 = document.getElementById('backToStep1');
const backToStep2 = document.getElementById('backToStep2');
const donationForm = document.getElementById('donationForm');
const causeTiles = document.getElementById('causeTiles');
const amountOptions = document.querySelectorAll('.amount-options .amount-btn');
const frequencyOptions = document.querySelectorAll('.frequency-options .amount-btn');
const paymentOptions = document.querySelectorAll('.payment-options .amount-btn');
const customAmount = document.getElementById('customAmount');
const selectedAmountPreview = document.getElementById('selectedAmountPreview');

let selectedCause = '';
let selectedAmount = '';
let selectedFrequency = 'one_time';
let selectedPayment = '';

function showStep(step) {
  try {
    document.querySelectorAll('.step').forEach((s, i) => {
      s.classList.toggle('active', i + 1 === step);
      s.setAttribute('aria-selected', (i + 1 === step).toString());
    });
    document.querySelectorAll('.step-panel').forEach(panel => {
      panel.style.display = panel.dataset.step == step ? 'block' : 'none';
      if (panel.dataset.step == step) panel.setAttribute('tabindex', '-1');
    });
    // Focus first focusable in new step
    const newPanel = document.querySelector(`[data-step="${step}"]`);
    const firstFocusable = newPanel.querySelector('button, input, [href]');
    if (firstFocusable) firstFocusable.focus();
  } catch (err) {
    console.warn('Step show failed:', err);
  }
}

document.querySelectorAll('[data-modal="donate"]').forEach(btn => {
  btn.addEventListener('click', () => {
    modalBackdrop.classList.add('active');
    selectedCause = btn.dataset.cause || '';
    showStep(selectedCause ? 2 : 1);
    if (selectedCause) {
      document.getElementById('form_cause').value = selectedCause;
      // Pre-highlight selected cause
      causeTiles.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
      causeTiles.querySelector(`[data-cause="${selectedCause}"]`)?.classList.add('active');
      selectedAmountPreview.textContent = '';
    }
    // Trigger install prompt after 5s engagement
    clearTimeout(window.installTimeout);
    window.installTimeout = setTimeout(() => {
      if (deferredPrompt) document.getElementById('installBtn').style.display = 'block';
    }, 5000);
  });
});

if (modalClose) modalClose.addEventListener('click', () => {
  modalBackdrop.classList.remove('active');
  showStep(1);
  resetModal();
  clearTimeout(window.installTimeout); // Clear on close
});

function resetModal() {
  selectedCause = '';
  selectedAmount = '';
  selectedFrequency = 'one_time';
  selectedPayment = '';
  document.getElementById('form_cause').value = '';
  document.getElementById('form_amount').value = '';
  document.getElementById('form_frequency').value = 'one_time';
  document.getElementById('form_payment').value = '';
  if (customAmount) customAmount.value = '';
  selectedAmountPreview.textContent = '';
  document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
  if (customAmount) customAmount.style.display = 'none';
}

if (causeTiles) {
  causeTiles.querySelectorAll('.amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCause = btn.dataset.cause;
      document.getElementById('form_cause').value = selectedCause;
      causeTiles.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showStep(2);
    });
  });
}

amountOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    amountOptions.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedAmount = btn.dataset.amount === 'custom' ? '' : btn.dataset.amount;
    if (customAmount) customAmount.style.display = btn.dataset.amount === 'custom' ? 'block' : 'none';
    updateAmountPreview();
  });
});

if (customAmount) {
  customAmount.addEventListener('input', () => {
    selectedAmount = customAmount.value;
    updateAmountPreview();
  });
}

frequencyOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    frequencyOptions.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedFrequency = btn.dataset.frequency;
    document.getElementById('form_frequency').value = selectedFrequency;
    updateAmountPreview();
  });
});

paymentOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    paymentOptions.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPayment = btn.dataset.payment;
    document.getElementById('form_payment').value = selectedPayment;
  });
});

if (toStep2) toStep2.addEventListener('click', () => showStep(2));
if (toStep3) toStep3.addEventListener('click', () => {
  if (!selectedCause) {
    alert('Please select a cause.');
    return;
  }
  const amount = selectedAmount || (customAmount ? customAmount.value : '');
  if (!amount || parseInt(amount) < 100) {
    alert('Please select or enter at least KES 100.');
    return;
  }
  document.getElementById('form_amount').value = amount;
  showStep(3);
});
if (backToStep1) backToStep1.addEventListener('click', () => showStep(1));
if (backToStep2) backToStep2.addEventListener('click', () => showStep(2));

function updateAmountPreview() {
  if (selectedAmount || (customAmount && customAmount.value)) {
    const amount = selectedAmount || customAmount.value;
    selectedAmountPreview.textContent = `Selected: KES ${amount} (${selectedFrequency === 'monthly' ? 'Monthly' : 'One-time'})`;
  }
}

// Form handling for all forms (async, validation, queue)
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    const errorsEl = form.querySelector('#form-errors') || document.createElement('div');
    errorsEl.id = 'form-errors';
    errorsEl.setAttribute('role', 'alert');
    errorsEl.setAttribute('aria-live', 'polite');
    if (!form.contains(errorsEl)) form.insertBefore(errorsEl, form.firstElementChild);
    errorsEl.classList.remove('success');
    errorsEl.style.color = ''; // Reset

    // Client-side validation
    const email = form.querySelector('input[type="email"]')?.value;
    const phone = form.querySelector('input[type="tel"]')?.value;
    const name = form.querySelector('input[name="name"]')?.value;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorsEl.textContent = 'Please enter a valid email address.';
      errorsEl.style.color = 'var(--error)';
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }
    if (phone && !/^\+?[\d\s-()]{10,}$/.test(phone.replace(/\s/g, ''))) {
      errorsEl.textContent = 'Please enter a valid phone number.';
      errorsEl.style.color = 'var(--error)';
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }
    if (name && name.length < 2) {
      errorsEl.textContent = 'Full name must be at least 2 characters.';
      errorsEl.style.color = 'var(--error)';
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    try {
      const fd = new FormData(form);
      const res = await fetch(form.action, { method: 'POST', body: fd });
      if (res.ok) {
        errorsEl.textContent = 'Success! We’ll reply soon.';
        errorsEl.style.color = 'var(--success)';
        errorsEl.classList.add('success');
        form.reset();
        if (form.id === 'donationForm') {
          const cause = fd.get('cause') || 'general';
          const amount = fd.get('amount') || fd.get('customAmount') || '';
          window.location.href = `donate-success.html?cause=${cause}&amount=${amount}&name=${fd.get('name') || 'Supporter'}`;
        }
      } else throw new Error('Server error');
    } catch (err) {
      if (!navigator.onLine) {
        const queued = JSON.parse(localStorage.getItem('queuedForms') || '[]');
        queued.push(Object.fromEntries(new FormData(form)));
        localStorage.setItem('queuedForms', JSON.stringify(queued));
        errorsEl.textContent = 'Offline—your message is queued and will send when online.';
      } else {
        errorsEl.textContent = 'Error: ' + err.message;
      }
      errorsEl.style.color = 'var(--error)';
    }
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
});

// Online sync
window.addEventListener('online', async () => {
  const queued = JSON.parse(localStorage.getItem('queuedForms') || '[]');
  if (queued.length > 0) {
    for (const data of queued) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      await fetch('https://formspree.io/f/xovkarkw', { method: 'POST', body: fd });
    }
    localStorage.removeItem('queuedForms');
    const toast = document.createElement('div');
    toast.textContent = 'Queued messages sent!';
    toast.style.cssText = 'position:fixed; top:20px; right:20px; background:var(--primary); color:var(--white); padding:var(--spacing-md); border-radius:var(--border-radius); z-index:1000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});

// SW register with sync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      if ('sync' in reg) reg.sync.register('form-sync');
    } catch (err) {
      console.error('SW Error:', err);
    }
  });
}

// PWA Install Button
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') console.log('PWA Installed');
      deferredPrompt = null;
      installBtn.style.display = 'none';
    }
  });
});
window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
});

// Impact Counters with easing
document.querySelectorAll('.counter .count').forEach(counter => {
  const target = parseInt(counter.dataset.countTo);
  if (!target) return;
  let startTime;
  const duration = 2000; // 2s easing
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      counter.setAttribute('aria-live', 'polite');
      startTime = performance.now();
      animateCounter();
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  observer.observe(counter);

  function animateCounter(currentTime = 0) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
    const current = Math.floor(target * ease);
    counter.textContent = current;
    counter.setAttribute('aria-label', `Number of ${counter.parentNode.querySelector('.text-sm').textContent.toLowerCase()}: ${current}`);
    if (progress < 1) {
      requestAnimationFrame(animateCounter);
    } else {
      counter.textContent = target;
      counter.setAttribute('aria-label', `Final number of ${counter.parentNode.querySelector('.text-sm').textContent.toLowerCase()}: ${target}`);
    }
  }
});

// Modal focus trap and Escape
if (modalBackdrop) {
  modalBackdrop.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalBackdrop.classList.remove('active');
      resetModal();
      clearTimeout(window.installTimeout);
      document.querySelector('.nav-links a.active')?.focus(); // Back to nav
    }
    if (e.key !== 'Tab') return;
    const focusable = modalBackdrop.querySelectorAll('button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });
}

// Personalize success page (if on donate-success.html)
if (window.location.pathname.includes('donate-success.html')) {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name') || 'Supporter';
  const cause = params.get('cause') || 'our work';
  const amount = params.get('amount') ? `KES ${params.get('amount')}` : '';
  const h1 = document.querySelector('h1');
  if (h1) h1.textContent += `, ${name}!`;
  const p = document.querySelector('.offline-content p');
  if (p) p.innerHTML += `<br>With your ${amount} gift to ${cause}, you're transforming lives.`;
  // Share button
  const action = document.querySelector('.action');
  if (action) {
    const shareBtn = document.createElement('button');
    shareBtn.textContent = 'Share Your Gift';
    shareBtn.className = 'btn-ghost';
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        await navigator.share({
          title: `I supported The Loyd Foundation!`,
          text: `Join me in empowering communities with ${amount} to ${cause}.`,
          url: 'https://mrcharleske.github.io/The-Loyd-Foundation-/'
        });
      } else {
        try {
          await navigator.clipboard.writeText('https://mrcharleske.github.io/The-Loyd-Foundation-/');
          alert('Link copied—share the love!');
        } catch (e) {
          console.warn('Clipboard failed:', e);
          alert('Share: https://mrcharleske.github.io/The-Loyd-Foundation-/');
        }
      }
    });
    action.appendChild(shareBtn);
  }
  // Add body class for styling
  document.body.classList.add('donate-success');
}

// Retry Button for Offline Page
const retryBtn = document.getElementById('retryBtn');
if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    if (navigator.onLine) {
      window.location.href = '/';
    } else {
      alert('Still offline—check connection.');
    }
  });
}

// Newsletter as form (handled in general form listener above)
