// File validation middleware

// Validate file type - only allow images
const validateFileType = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Get file extension
  const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
  
  // Allowed file types
  const allowedTypes = ['jpg', 'jpeg', 'png'];
  
  if (!allowedTypes.includes(fileExtension)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only .jpg, .jpeg, .png files are allowed.'
    });
  }
  
  next();
};

// Validate file size
const validateFileSize = (maxSizeInMB) => {
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

module.exports = {
  validateFileType,
  validateFileSize
};