const express = require('express');
const { ContactModel } = require('../database/models');
const router = express.Router();

const sanitizeAadhaar = (aadhaar) => {
  return aadhaar.replace(/\s/g, '').replace(/\D/g, '');
};

const otpRequests = new Map();

// Check Aadhaar Status - NO POPUP
router.get('/check-status', (req, res) => {
  const { aadhaar, date } = req.query;
  const cleanAadhaar = sanitizeAadhaar(aadhaar);
  
  if (!cleanAadhaar || cleanAadhaar.length !== 12 || !date) {
    return res.json({
      success: false,
      message: 'Invalid Aadhaar number or date'
    });
  }
  
  const statuses = ['Generated', 'Printed', 'Dispatched', 'Delivered'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  res.json({ 
    status: randomStatus, 
    message: `Your Aadhaar status is: ${randomStatus}`,
    aadhaarNumber: cleanAadhaar
  });
});

// Send OTP - NO POPUP
router.get('/download/send-otp', (req, res) => {
  const { aadhaar } = req.query;
  const cleanAadhaar = sanitizeAadhaar(aadhaar);
  
  if (!cleanAadhaar || cleanAadhaar.length !== 12) {
    return res.json({ 
      success: false,
      message: 'Invalid Aadhaar number' 
    });
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpRequests.set(cleanAadhaar, { otp, timestamp: Date.now() });
  
  res.json({ 
    success: true,
    message: 'OTP sent to your registered mobile number',
    otp: otp.toString()
  });
});

// Download Aadhaar - NO POPUP
router.get('/download', (req, res) => {
  const { aadhaar, otp } = req.query;
  const cleanAadhaar = sanitizeAadhaar(aadhaar);
  
  if (!cleanAadhaar || cleanAadhaar.length !== 12 || !otp) {
    return res.json({ 
      success: false,
      message: 'Aadhaar number and OTP are required' 
    });
  }
  
  res.json({ 
    success: true,
    message: 'e-Aadhaar downloaded successfully',
    downloadUrl: '/assets/demo-aadhaar.pdf'
  });
});

// Verify Aadhaar - NO POPUP
router.get('/verify', (req, res) => {
  const { aadhaar } = req.query;
  const cleanAadhaar = sanitizeAadhaar(aadhaar);
  
  const valid = cleanAadhaar.length === 12 && /^\d+$/.test(cleanAadhaar);
  
  res.json({ 
    aadhaar: cleanAadhaar, 
    valid: valid, 
    message: valid ? 'Aadhaar number format is valid' : 'Invalid Aadhaar format'
  });
});

// Update Aadhaar - NO POPUP
router.post('/update', (req, res) => {
  const { fullName, aadhaar, newAddress, updateReason } = req.body;
  const cleanAadhaar = sanitizeAadhaar(aadhaar);
  
  if (!fullName || !cleanAadhaar || cleanAadhaar.length !== 12 || !newAddress || !updateReason) {
    return res.json({ 
      success: false,
      message: 'All fields are required and Aadhaar must be 12 digits' 
    });
  }
  
  const updateId = 'UPDATE_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  res.json({ 
    success: true,
    message: `Update request submitted successfully for ${updateReason}`,
    updateId: updateId
  });
});

// Contact Form - NO POPUP
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    const result = await ContactModel.saveContact({ name, email, message });
    
    res.json({ 
      success: true,
      message: 'Thank you for your message. We will get back to you soon.',
      contactId: result.contact_id
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.json({ 
      success: false,
      message: 'Failed to save your message' 
    });
  }
});

module.exports = router;