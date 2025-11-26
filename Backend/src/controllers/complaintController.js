const Complaint = require("../models/complaint");

// Create complaint
exports.createComplaint = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    const complaint = await Complaint.create({ subject, message, userId });
    res.json({ message: "Complaint submitted", complaint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get complaints of logged-in user
exports.getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const complaints = await Complaint.findAll({ where: { userId } });
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all complaints (admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll();
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
