/**
 * Contact Form - Google Forms Integration
 * Configuration is read from data attributes set by Jekyll
 */

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    // Read config from data attributes (set by Jekyll from _config.yml)
    const formConfig = {
      formUrl: contactForm.dataset.formUrl,
      entryIds: {
        name: contactForm.dataset.entryName,
        email: contactForm.dataset.entryEmail,
        message: contactForm.dataset.entryMessage
      }
    };

    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      
      if (!name || !email || !message) {
        showFormMessage('Please fill in all fields.', 'error');
        return;
      }
      
      if (!formConfig.formUrl) {
        showFormMessage('Contact form is not configured. Please set up Google Form integration.', 'error');
        console.error('Google Form URL not configured in _config.yml');
        return;
      }
      
      // Show loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      try {
        // Build form data for Google Forms
        const formData = new FormData();
        formData.append(formConfig.entryIds.name, name);
        formData.append(formConfig.entryIds.email, email);
        formData.append(formConfig.entryIds.message, message);
        
        // Submit to Google Forms
        await fetch(formConfig.formUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        });
        
        // Success
        showFormMessage('Thank you! Your message has been sent successfully.', 'success');
        contactForm.reset();
        
      } catch (error) {
        console.error('Form submission error:', error);
        showFormMessage('There was an error sending your message. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});

function showFormMessage(message, type) {
  const existingMsg = document.querySelector('.form-message');
  if (existingMsg) {
    existingMsg.remove();
  }
  
  const msgDiv = document.createElement('div');
  msgDiv.className = `form-message form-message-${type}`;
  msgDiv.textContent = message;
  
  msgDiv.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    margin-top: 16px;
    font-size: 0.9rem;
    text-align: center;
    ${type === 'success' 
      ? 'background: rgba(80, 200, 120, 0.2); color: #50c878; border: 1px solid rgba(80, 200, 120, 0.3);'
      : 'background: rgba(220, 20, 60, 0.2); color: #ff6b6b; border: 1px solid rgba(220, 20, 60, 0.3);'
    }
  `;
  
  const contactForm = document.getElementById('contact-form');
  contactForm.parentNode.insertBefore(msgDiv, contactForm.nextSibling);
  
  setTimeout(() => {
    msgDiv.style.transition = 'opacity 0.3s ease';
    msgDiv.style.opacity = '0';
    setTimeout(() => msgDiv.remove(), 300);
  }, 5000);
}
