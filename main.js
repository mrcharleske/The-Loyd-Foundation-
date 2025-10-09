// Initialize AOS
AOS.init({ once: true });

// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  hamburger.textContent = navMenu.classList.contains('active') ? '✖' : '☰';
});

// Dynamic Year in Footer
document.getElementById('year').textContent = new Date().getFullYear();

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
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === step);
  });
  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.style.display = panel.dataset.step == step ? 'block' : 'none';
  });
}

document.querySelectorAll('[data-modal="donate"]').forEach(btn => {
  btn.addEventListener('click', () => {
    modalBackdrop.classList.add('active');
    selectedCause = btn.dataset.cause || '';
    showStep(selectedCause ? 2 : 1);
    if (selectedCause) {
      document.getElementById('form_cause').value = selectedCause;
      selectedAmountPreview.textContent = '';
    }
  });
});

modalClose.addEventListener('click', () => {
  modalBackdrop.classList.remove('active');
  showStep(1);
  resetModal();
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
  customAmount.value = '';
  selectedAmountPreview.textContent = '';
  document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
}

causeTiles.querySelectorAll('.amount-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedCause = btn.dataset.cause;
    document.getElementById('form_cause').value = selectedCause;
    showStep(2);
  });
});

amountOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    amountOptions.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedAmount = btn.dataset.amount === 'custom' ? '' : btn.dataset.amount;
    customAmount.style.display = btn.dataset.amount === 'custom' ? 'block' : 'none';
    updateAmountPreview();
  });
});

customAmount.addEventListener('input', () => {
  selectedAmount = customAmount.value;
  updateAmountPreview();
});

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
    // Placeholder for payment API integration
    console.log('Trigger payment for:', selectedPayment);
  });
});

toStep2.addEventListener('click', () => showStep(2));
toStep3.addEventListener('click', () => {
  if (selectedAmount || customAmount.value) {
    document.getElementById('form_amount').value = selectedAmount || customAmount.value;
    showStep(3);
  } else {
    alert('Please select or enter an amount.');
  }
});
backToStep1.addEventListener('click', () => showStep(1));
backToStep2.addEventListener('click', () => showStep(2));

function updateAmountPreview() {
  if (selectedAmount || customAmount.value) {
    const amount = selectedAmount || customAmount.value;
    selectedAmountPreview.textContent = `Selected: KES ${amount} (${selectedFrequency === 'monthly' ? 'Monthly' : 'One-time'})`;
  }
}

donationForm.addEventListener('submit', (e) => {
  // Redirect to donate-success.html after successful submission
  setTimeout(() => {
    window.location.href = 'donate-success.html';
  }, 500);
});

// Impact Counters
document.querySelectorAll('.counter .count').forEach(counter => {
  const target = parseInt(counter.dataset.countTo);
  let current = 0;
  const increment = target / 100;
  const updateCounter = () => {
    if (current < target) {
      current += increment;
      counter.textContent = Math.ceil(current);
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target;
    }
  };
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      updateCounter();
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  observer.observe(counter);
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(err => console.error('Service Worker Error:', err));
  });
}

// PWA Install Button
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA Installed');
      }
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  });
});
window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
});

// Retry Button for Offline Page
const retryBtn = document.getElementById('retryBtn');
if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    window.location.reload();
  });
}
