// Initialize AOS
AOS.init({
  duration: 1000,
  once: true
});

// Dark Mode Toggle
const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
};
document.addEventListener('DOMContentLoaded', () => {
  // Placeholder for dark mode toggle button (add to HTML if desired)
  // <button onclick="toggleDarkMode()">Toggle Dark Mode</button>
});

// Donate Form Popup
document.querySelectorAll('.donate-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-light">
          <div class="modal-header">
            <h5 class="modal-title text-warning">Donate to The Loyd Foundation</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form action="https://formspree.io/f/xovkarkw" method="POST" class="needs-validation" novalidate>
              <div class="mb-3">
                <label for="donorName" class="form-label">Your Name</label>
                <input type="text" class="form-control" id="donorName" name="name" required>
                <div class="invalid-feedback">Please enter your name.</div>
              </div>
              <div class="mb-3">
                <label for="donorEmail" class="form-label">Your Email</label>
                <input type="email" class="form-control" id="donorEmail" name="email" required>
                <div class="invalid-feedback">Please enter a valid email.</div>
              </div>
              <div class="mb-3">
                <label for="donationAmount" class="form-label">Donation Amount ($)</label>
                <input type="number" class="form-control" id="donationAmount" name="amount" min="1" required>
                <div class="invalid-feedback">Please enter a valid amount.</div>
              </div>
              <div class="mb-3">
                <label for="donorMessage" class="form-label">Your Message</label>
                <textarea class="form-control" id="donorMessage" name="message" rows="3"></textarea>
              </div>
              <button type="submit" class="btn btn-warning text-dark fw-bold">Submit Donation</button>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Bootstrap Modal Behavior
    const bootstrap = window.bootstrap;
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // Form Validation
    const form = modal.querySelector('form');
    form.addEventListener('submit', (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    });

    // Close Modal
    modal.querySelector('.btn-close').addEventListener('click', () => {
      modalInstance.hide();
      document.body.removeChild(modal);
    });
  });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('Service Worker registered', reg))
    .catch(err => console.log('Service Worker registration failed', err));
}
