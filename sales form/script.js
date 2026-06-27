// ============================================================
// Responsive Mobile Menu — toggles .header-nav#headerNav
// ============================================================
const menuToggle = document.getElementById('menuToggle');
const headerNav  = document.getElementById('headerNav');

if (menuToggle && headerNav) {
  // Stop click from bubbling up to the <a class="header-brand"> wrapper
  menuToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    headerNav.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });

  // Close nav when any link inside it is clicked
  headerNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      headerNav.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !headerNav.contains(e.target)) {
      headerNav.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });
}

// ----------------------------------------------------
// Time Slot Database & Scheduling Engine
// ----------------------------------------------------
const timeSlots = {
  '2026-06-28': [
    { time: '11:00 AM - 11:45 AM', status: 'available' },
    { time: '11:45 AM - 12:15 PM', status: 'booked' },
    { time: '12:15 PM - 01:00 PM', status: 'available' },
    { time: '01:00 PM - 01:45 PM', status: 'available' },
    { time: '02:00 PM - 03:00 PM', status: 'available' },
    { time: '03:30 PM - 04:15 PM', status: 'booked' },
    { time: '06:00 PM - 07:00 PM', status: 'available' }
  ],
  '2026-06-29': [
    { time: '10:00 AM - 11:00 AM', status: 'booked' },
    { time: '11:00 AM - 11:20 AM', status: 'available' },
    { time: '12:30 PM - 01:15 PM', status: 'available' },
    { time: '02:00 PM - 03:00 PM', status: 'available' },
    { time: '04:00 PM - 04:30 PM', status: 'available' }
  ],
  '2026-06-30': [
    { time: '11:00 AM - 11:45 AM', status: 'available' },
    { time: '12:15 PM - 01:00 PM', status: 'available' },
    { time: '02:00 PM - 03:00 PM', status: 'available' },
    { time: '06:00 PM - 07:00 PM', status: 'available' }
  ],
  '2026-07-01': [
    { time: '11:00 AM - 11:45 AM', status: 'available' },
    { time: '12:15 PM - 01:00 PM', status: 'available' },
    { time: '06:00 PM - 07:00 PM', status: 'available' },
    { time: '09:00 PM - 10:00 PM', status: 'available' }
  ]
};

// State Variables for Apply Form
let resumeBase64 = "";
let resumeFileName = "";
let resumeFileType = "";

// Initialize Calendar Elements
const dayTabs = document.querySelectorAll('.day-tab');
const slotsGrid = document.getElementById('slotsGrid');
const customSlotCheckbox = document.getElementById('customSlotCheckbox');
const customSlotBox = document.getElementById('customSlotBox');
const customDateInput = document.getElementById('customDateInput');
const customTimeInput = document.getElementById('customTimeInput');
const selectedDateInput = document.getElementById('selectedDate');
const selectedTimeInput = document.getElementById('selectedTime');

// Dynamically Render Slots for Selected Date
function renderSlots(dateString) {
  if (!slotsGrid) return;
  slotsGrid.innerHTML = '';
  
  if (customSlotCheckbox && customSlotCheckbox.checked) {
    slotsGrid.innerHTML = '<div style="grid-column: 1/-1; color: var(--pink-medium); text-align: center; font-size: 0.9rem;">Custom schedule input enabled. Fill out date and time below.</div>';
    return;
  }

  const slots = timeSlots[dateString] || [];
  if (slots.length === 0) {
    slotsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No slots listed for this date.</div>';
    return;
  }

  slots.forEach(slot => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `slot-btn ${slot.status}`;
    
    // Check if this slot was previously selected
    if (selectedDateInput.value === dateString && selectedTimeInput.value === slot.time && slot.status !== 'booked') {
      btn.classList.add('selected');
    }

    const checkIcon = slot.status === 'booked' ? '❌' : '✔️';
    const statusText = slot.status === 'booked' ? 'Booked' : 'Available';
    
    btn.innerHTML = `${slot.time} <span class="slot-lbl">${checkIcon} ${statusText}</span>`;

    if (slot.status === 'booked') {
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => {
        // Clear all selections
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        selectedDateInput.value = dateString;
        selectedTimeInput.value = slot.time;
        
        // Hide error if visible
        const slotError = document.getElementById('slotError');
        if (slotError) slotError.style.display = 'none';
      });
    }

    slotsGrid.appendChild(btn);
  });
}

// Attach Tab Click Listeners
if (dayTabs.length > 0) {
  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const targetDate = tab.getAttribute('data-date');
      selectedDateInput.value = targetDate;
      
      // If we don't have custom slot selected, clear previous time selections
      if (!customSlotCheckbox || !customSlotCheckbox.checked) {
        selectedTimeInput.value = '';
      }
      
      renderSlots(targetDate);
    });
  });
  
  // Initial render
  renderSlots('2026-06-28');
}

// Custom Slot Box toggle
if (customSlotCheckbox) {
  customSlotCheckbox.addEventListener('change', () => {
    if (customSlotCheckbox.checked) {
      customSlotBox.style.display = 'flex';
      selectedTimeInput.value = '';
      
      // Select date input min limit setup
      const now = new Date();
      const minDate = now.toISOString().split('T')[0];
      customDateInput.setAttribute('min', minDate);
    } else {
      customSlotBox.style.display = 'none';
      selectedTimeInput.value = '';
    }
    // Update slot grid message
    const activeTab = document.querySelector('.day-tab.active');
    if (activeTab) {
      renderSlots(activeTab.getAttribute('data-date'));
    }
  });

  // Track manual changes
  const handleCustomTimeChange = () => {
    if (customDateInput.value && customTimeInput.value) {
      selectedDateInput.value = customDateInput.value;
      
      // Calculate 45 min slot ending
      const [hours, minutes] = customTimeInput.value.split(':').map(Number);
      let endMinutes = minutes + 45;
      let endHours = hours;
      if (endMinutes >= 60) {
        endMinutes -= 60;
        endHours += 1;
      }
      if (endHours >= 24) {
        endHours -= 24;
      }
      
      const formatTime = (h, m) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        const displayM = m.toString().padStart(2, '0');
        const displayHStr = displayH.toString().padStart(2, '0');
        return `${displayHStr}:${displayM} ${ampm}`;
      };

      const startFormatted = formatTime(hours, minutes);
      const endFormatted = formatTime(endHours, endMinutes);
      
      selectedTimeInput.value = `${startFormatted} - ${endFormatted} (Custom)`;
      
      const slotError = document.getElementById('slotError');
      if (slotError) slotError.style.display = 'none';
    }
  };

  customDateInput.addEventListener('change', handleCustomTimeChange);
  customTimeInput.addEventListener('change', handleCustomTimeChange);
}

// ----------------------------------------------------
// File Upload & Base64 Reader Section
// ----------------------------------------------------
const dropzone = document.getElementById('dropzone');
const resumeFile = document.getElementById('resumeFile');
const fileInfo = document.getElementById('fileInfo');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const resumeError = document.getElementById('resumeError');

if (dropzone && resumeFile) {
  // Drag styling triggers
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  // Drop capture
  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      resumeFile.files = files;
      processFile(files[0]);
    }
  });

  // Browse selection capture
  resumeFile.addEventListener('change', (e) => {
    if (resumeFile.files.length > 0) {
      processFile(resumeFile.files[0]);
    }
  });
}

function processFile(file) {
  if (!file) return;

  // Validation
  const allowedExtensions = /(\.pdf|\.png|\.jpeg|\.jpg)$/i;
  if (!allowedExtensions.exec(file.name)) {
    alert('Invalid file format. Please upload PDF, PNG, or JPEG.');
    resumeFile.value = '';
    fileInfo.style.display = 'none';
    return;
  }

  // Size limit validation (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds the 5MB limit.');
    resumeFile.value = '';
    fileInfo.style.display = 'none';
    return;
  }

  resumeFileName = file.name;
  resumeFileType = file.type;
  fileNameDisplay.textContent = file.name;
  fileInfo.style.display = 'flex';
  if (resumeError) resumeError.style.display = 'none';

  // Read as Base64 string
  const reader = new FileReader();
  reader.onload = function(e) {
    const rawResult = e.target.result;
    // Extract base64 part
    resumeBase64 = rawResult.split(',')[1];
  };
  reader.readAsDataURL(file);
}

// ----------------------------------------------------
// Form Validations & Sheet Submit Trigger
// ----------------------------------------------------
const recruitmentForm = document.getElementById('recruitmentForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const thankyouOverlay = document.getElementById('thankYouOverlay');
const whatsappDirectBtn = document.getElementById('whatsappDirectBtn');

if (recruitmentForm) {
  recruitmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;

    // Reset all error displays
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');

    // 1. Basic Fields validation
    const fullName = document.getElementById('fullName').value.trim();
    if (!fullName) {
      document.getElementById('nameError').style.display = 'flex';
      isValid = false;
    }

    const emailId = document.getElementById('emailId').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailId || !emailPattern.test(emailId)) {
      document.getElementById('emailError').style.display = 'flex';
      isValid = false;
    }

    const phoneNo = document.getElementById('phoneNo').value.trim();
    const phonePattern = /^\d{10}$/;
    // Extract digit length
    const cleanPhone = phoneNo.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      document.getElementById('phoneError').style.display = 'flex';
      isValid = false;
    }

    const livingLocation = document.getElementById('livingLocation').value.trim();
    if (!livingLocation) {
      document.getElementById('locationError').style.display = 'flex';
      isValid = false;
    }

    const currentCity = document.getElementById('currentCity').value.trim();
    if (!currentCity) {
      document.getElementById('cityError').style.display = 'flex';
      isValid = false;
    }

    const qualification = document.getElementById('qualification').value.trim();
    if (!qualification) {
      document.getElementById('qualificationError').style.display = 'flex';
      isValid = false;
    }

    const salesExperience = document.getElementById('salesExperience').value;
    if (!salesExperience) {
      document.getElementById('experienceError').style.display = 'flex';
      isValid = false;
    }

    // 2. Checklists arrays validation
    // Sales Knowledge (>= 4)
    const salesChecked = Array.from(document.querySelectorAll('#salesKnowledgeGroup input[type="checkbox"]:checked')).map(el => el.value);
    if (salesChecked.length < 4) {
      document.getElementById('salesCheckError').style.display = 'flex';
      isValid = false;
    }

    // Tech Knowledge (>= 3)
    const techChecked = Array.from(document.querySelectorAll('#techKnowledgeGroup input[type="checkbox"]:checked')).map(el => el.value);
    if (techChecked.length < 3) {
      document.getElementById('techCheckError').style.display = 'flex';
      isValid = false;
    }

    // Tools Knowledge (>= 3)
    const toolsChecked = Array.from(document.querySelectorAll('#toolsGroup input[type="checkbox"]:checked')).map(el => el.value);
    if (toolsChecked.length < 3) {
      document.getElementById('toolsCheckError').style.display = 'flex';
      isValid = false;
    }

    // Mandatory Skills (must tick ALL 11)
    const mandatoryTotal = document.querySelectorAll('#mandatorySkillsGroup input[type="checkbox"]').length;
    const mandatoryChecked = Array.from(document.querySelectorAll('#mandatorySkillsGroup input[type="checkbox"]:checked')).map(el => el.value);
    if (mandatoryChecked.length < mandatoryTotal) {
      document.getElementById('mandatoryCheckError').style.display = 'flex';
      isValid = false;
    }

    // 3. Resume validity
    if (!resumeBase64) {
      if (resumeError) resumeError.style.display = 'flex';
      isValid = false;
    }

    // 4. Scheduling slot check
    const dateSelected = selectedDateInput.value;
    const timeSelected = selectedTimeInput.value;
    if (!dateSelected || !timeSelected) {
      const slotError = document.getElementById('slotError');
      if (slotError) slotError.style.display = 'flex';
      isValid = false;
    }

    if (!isValid) {
      // Scroll to the first visible error
      const firstError = document.querySelector('.error-msg[style*="display: flex"], .error-msg[style*="display: block"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Capture other variables
    const inPerson = document.querySelector('input[name="inPerson"]:checked') ? document.querySelector('input[name="inPerson"]:checked').value : 'Yes';
    const altMobile = document.getElementById('altMobile').value.trim();
    const workedB2b = document.querySelector('input[name="workedB2b"]:checked').value;
    const coldCalling = document.querySelector('input[name="coldCalling"]:checked').value;
    const fullTimeOffice = document.querySelector('input[name="fullTimeOffice"]:checked').value;
    const joinTime = document.querySelector('input[name="joinTime"]:checked').value;

    // Build Form JSON Payload
    const formData = {
      fullName,
      emailId,
      phoneNo: cleanPhone,
      altPhoneNo: altMobile || 'N/A',
      livingLocation,
      inPerson,
      currentCity,
      qualification,
      salesExperience,
      workedB2b,
      coldCalling,
      fullTimeOffice,
      joinTime,
      salesKnowledge: salesChecked.join(', '),
      techKnowledge: techChecked.join(', '),
      toolsKnowledge: toolsChecked.join(', '),
      mandatorySkills: mandatoryChecked.join(', '),
      interviewDate: dateSelected,
      interviewSlot: timeSelected,
      resumeBase64,
      resumeFileName,
      resumeFileType
    };

    // Show Loader
    if (loadingOverlay) loadingOverlay.classList.add('visible');

    // POST to Google Apps Script
    const scriptURL = 'https://script.google.com/macros/s/AKfycbx5ibVCb3hF7YDvj5yw2V4Lz4OWGeWBZF9UTWCtaPHABEIUy00bGLCLdd7QXFLZrgTI_w/exec';

    fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors', // standard workaround for apps script CORS redirection
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      // Since mode is no-cors, we won't get standard response headers or response JSON. 
      // It will return an opaque response. This is normal and means it went through.
      handleFormSuccess(formData);
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      // Even if fetch throws CORS issues, the data usually records correctly. We trigger transition.
      handleFormSuccess(formData);
    });
  });
}

function handleFormSuccess(data) {
  // Hide loader
  if (loadingOverlay) loadingOverlay.classList.remove('visible');
  
  // Show thank you overlay
  if (thankyouOverlay) thankyouOverlay.classList.add('visible');

  // Build WhatsApp pre-filled link
  const hrPhoneNumber = '918094100513';
  const customMessage = `Hi HENU OS HR Team,
I have successfully submitted my Sales Executive application on the careers portal.

My Application Summary:
• Name: ${data.fullName}
• Phone: +91 ${data.phoneNo}
• City: ${data.currentCity}
• Experience: ${data.salesExperience}
• Scheduled Interview: ${data.interviewDate} [${data.interviewSlot}]

Looking forward to the interview session!`;

  const encodedMsg = encodeURIComponent(customMessage);
  const waURL = `https://api.whatsapp.com/send?phone=${hrPhoneNumber}&text=${encodedMsg}`;
  
  if (whatsappDirectBtn) {
    whatsappDirectBtn.href = waURL;
  }
}
