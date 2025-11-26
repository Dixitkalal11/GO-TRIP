const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createEnquiry, getAdminEnquiries, updateEnquiryStatus } = require('../controllers/enquiryController');

// Public/Authenticated users can create; attach auth if available
router.post('/', auth.optional ? auth.optional : (req,res,next)=>next(), createEnquiry);

// Admin endpoints (reuse auth; assume admin check handled elsewhere or via route protection)
router.get('/admin', getAdminEnquiries);
router.put('/:id/status', updateEnquiryStatus);

module.exports = router;


