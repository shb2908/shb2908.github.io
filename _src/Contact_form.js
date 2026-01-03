
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      
      // Get the recipient email from the form's data attribute
      const recipientEmail = contactForm.dataset.email;
      
      if (!recipientEmail) {
        console.error('Contact form: No recipient email configured');
        alert('Contact form is not configured properly. Please try again later.');
        return;
      }
      
      const subject = encodeURIComponent('Message from ' + name + ' via Website');
      const body = encodeURIComponent(
        'From: ' + name + '\n' +
        'Email: ' + email + '\n\n' +
        'Message:\n' + message
      );
      
      window.location.href = 'mailto:' + recipientEmail + '?subject=' + subject + '&body=' + body;
    });
  }
});
