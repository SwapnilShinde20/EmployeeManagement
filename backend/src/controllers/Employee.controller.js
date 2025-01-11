import {Employee}  from '../models/Employee.models.js';
import {AuditLog} from '../models/Auditlog.models.js';
import { sendEmail } from '../config/webhookConfig.js';
import { uploadOnCloudinary } from '../config/cloudinary.js';

// Notify external systems
const notifyExternalSystems = async (action, employee) => {
  const payload = {
    action,
    employee,
    timestamp: new Date(),
  };

  // Send to Email API (for demonstration)
    await sendEmail(payload);
  
};

// Create a new employee
const createEmployee = async (req, res,next) => {
  const { name, email, position, department, dateOfJoining, status } = req.body;  
  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
      res.status(401).json("Profile picture is missing. Please upload a profile image.");
  }

  try {
    const profile = await uploadOnCloudinary(profileLocalPath);
    const newEmployee = await Employee.create({
      name,
      email,
      position,
      department,
      dateOfJoining,
      status,
      profilePicture: profile.secure_url // If using multer for file uploads
    });

    // Log the action
    await AuditLog.create({
      action: 'Added Employee',
      performedBy: req.user.id,
      details: { employeeId: newEmployee._id, name: newEmployee.name },
    });
    await notifyExternalSystems('Added Employee', newEmployee);

    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an employee
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const profileLocalPath = req.file?.path;
  console.log(profileLocalPath);
  
  // Check if profile picture is missing
  if (!profileLocalPath) {
    return res.status(401).json("Profile picture is missing. Please upload a profile image.");
  }

  try {
    // Upload profile picture to Cloudinary
    const profile = await uploadOnCloudinary(profileLocalPath);

    // Update employee data in the database
    const updatedEmployee = await Employee.findByIdAndUpdate(id, 
      { ...updates, profilePicture: profile.secure_url }, 
      { new: true }
    );

    // If employee not found, send a 404 response
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Log the action in the audit log
    await AuditLog.create({
      action: 'Updated Employee',
      performedBy: req.user.id,
      details: { employeeId: updatedEmployee._id, updates },
    });

    // Notify external systems of the update
    await notifyExternalSystems('Updated Employee', updatedEmployee);

    // Send the updated employee data as the response
    return res.status(200).json(updatedEmployee);

  } catch (error) {
    // If there was an error, send a 500 response
    return res.status(500).json({ message: error.message });
  }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });

    // Log the action
    await AuditLog.create({
      action: 'Deleted Employee',
      performedBy: req.user.id,
      details: { employeeId: deletedEmployee._id, name: deletedEmployee.name },
    });

    await notifyExternalSystems('Deleted Employee', deletedEmployee);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export {
    createEmployee,
    getAllEmployees,
    updateEmployee,
    deleteEmployee
}