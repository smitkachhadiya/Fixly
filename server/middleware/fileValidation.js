const path = require('path');

// File type validation middleware
exports.validateFileType = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Get file extension
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  
  // Allowed extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  
  // Check if file extension is allowed
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      success: false,
      message: `Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`
    });
  }
  
  next();
};

// File size validation middleware
exports.validateFileSize = (maxSizeInMB) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }
    
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (req.file.size > maxSizeInBytes) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds ${maxSizeInMB}MB limit.`
      });
    }
    
    next();
  };
};