window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});
const toggleBtn = document.querySelector('.menu-toggle');
  const headerContext = document.querySelector('.header_context');
  const icon = toggleBtn.querySelector('i');
  const navLinks = document.querySelectorAll('.Header_cont');

  // Toggle menu open/close
  toggleBtn.addEventListener('click', () => {
    headerContext.classList.toggle('active');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });

  // Close menu when a nav link is clicked (on mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (headerContext.classList.contains('active')) {
        headerContext.classList.remove('active');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
      }
    });
  });
document.addEventListener("DOMContentLoaded", () => {
  const leftItems = document.querySelectorAll(
    ".Concrete_form, .Insulated_form, .Polystyrene_form, .Blocks_form"
  );
  const panels = document.querySelectorAll(".grid-info");

  if (!leftItems.length || !panels.length) return;

  leftItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      // hide all panels
      panels.forEach(p => p.classList.remove("active"));

      // show the clicked one (instant, no delay)
      if (panels[i]) panels[i].classList.add("active");

      // update left item highlight
      leftItems.forEach(li => li.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // show first by default
  panels[0].classList.add("active");
  leftItems[0].classList.add("active");
});
document.addEventListener("DOMContentLoaded", () => {
  const sliderWrapper = document.querySelector(".slider-wrapper");
  const slides = document.querySelectorAll(".wrapper");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");

  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateSlider() {
    // move wrapper by index
    sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  // Next button
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % totalSlides; // loop back to start
    updateSlider();
  });

  // Prev button
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides; // loop back to end
    updateSlider();
  });

  // Initial load
  updateSlider();
});
// frequently asked question
document.querySelectorAll('.bth_slider').forEach(button => {
  button.addEventListener('click', () => {
    const allContexts = document.querySelectorAll('.fq_context');
    const allIcons = document.querySelectorAll('.span_icon');

    const context = button.parentElement.nextElementSibling; // current FAQ answer
    const icon = button.querySelector('.span_icon');         // current arrow

    // First, close all other FAQs
    allContexts.forEach(c => {
      if (c !== context) {
        c.classList.remove('active');
      }
    });
    allIcons.forEach(i => {
      if (i !== icon) {
        i.classList.remove('rotate');
      }
    });

    // Then toggle the clicked one
    context.classList.toggle('active');
    icon.classList.toggle('rotate');
  });
});

// Smooth scroll for header links
document.querySelectorAll('.header_context a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});
// Send Email 
function sendMail() {
  const name = document.querySelector('.name_txt').value.trim();
  const email = document.getElementById('email_inp').value.trim();
  const subject = document.querySelector('.sub_input').value.trim();
  const message = document.querySelector('.msg_input').value.trim();

  if (!name || !email || !subject || !message) {
    showPopup("⚠️ Please fill in all fields before sending.");
    return;
  }

  const params = {
    from_name: name,
    from_email: email,
    subject: subject,
    message: message
  };

  const serviceID = "service_2tq5gqe";
  const templateID = "template_ltt1edt"; // main contact form
  const autoReplyTemplateID = "template_autoreply"; // your new one

  // Send message to you
  emailjs.send(serviceID, templateID, params)
    .then(() => {
      showPopup("✅ Email sent successfully!");

      // Send auto-reply to the sender
      emailjs.send(serviceID, autoReplyTemplateID, params);

      // Clear form
      document.querySelector('.name_txt').value = "";
      document.getElementById('email_inp').value = "";
      document.querySelector('.sub_input').value = "";
      document.querySelector('.msg_input').value = "";
    })
    .catch((error) => {
      console.error("EmailJS Error:", error);
      showPopup("❌ Failed to send email. Please try again.");
    });
}



function showPopup(message) {
  const popup = document.createElement('div');
  popup.textContent = message;
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.backgroundColor = 'rgba(0,0,0,0.85)';
  popup.style.color = '#fff';
  popup.style.padding = '15px 25px';
  popup.style.borderRadius = '10px';
  popup.style.fontSize = '18px';
  popup.style.zIndex = '9999';
  popup.style.textAlign = 'center';
  popup.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
  popup.style.transition = 'opacity 0.4s ease';
  popup.style.maxWidth = '80%';
  popup.style.wordWrap = 'break-word';

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 400);
  }, 3000);
}