const jwt = require('jsonwebtoken');
const User = require('../models/User');

// حماية الراوت: لازم يكون فيه توكن صحيح
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'غير مصرح لك، التوكن غير صالح' });
    }
  } else {
    res.status(401).json({ message: 'غير مصرح لك، لا يوجد توكن' });
  }
};

// السماح فقط للأدمن
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'غير مسموح، للأدمن فقط' });
  }
};

module.exports = { protect, admin };
