(() => {
  'use strict';

  const API_BASE_URL = '/api';

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed (${response.status})`);
    }

    if (response.status === 204) return null;
    return response.json();
  };

  const switchTab = (tabIndex) => {
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.add('hidden');
    });

    document.getElementById(`content${tabIndex}`)?.classList.remove('hidden');

    document.querySelectorAll('.tab-button').forEach((btn, index) => {
      if (index === tabIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  const sendMessage = async () => {
    const nameEl = document.getElementById('contact-name');
    const emailEl = document.getElementById('contact-email');
    const messageEl = document.getElementById('contact-message');

    const name = (nameEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const message = (messageEl?.value || '').trim();

    if (!name || !email || !message) {
      alert('Please fill in all fields before sending.');
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      alert('Name can only contain English letters and spaces.');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      await requestJson(`${API_BASE_URL}/contact`, {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
      });

      alert(`Thank you, ${name}!\n\nYour message has been received. We'll get back to you soon.`);
      if (nameEl) nameEl.value = '';
      if (emailEl) emailEl.value = '';
      if (messageEl) messageEl.value = '';
    } catch (error) {
      console.error(error);
      alert('Failed to send message. Please try again later.');
    }
  };

  window.switchTab = switchTab;
  window.sendMessage = sendMessage;

  document.addEventListener('DOMContentLoaded', () => {
    switchTab(0);
  });
})();
