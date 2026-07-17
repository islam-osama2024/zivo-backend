const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    تسجيل مستخدم جديد
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    تسجيل الدخول
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غلط' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    بيانات المستخدم الحالي
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  res.json(req.user);
};

// @desc    طلب إعادة تعيين كلمة المرور - بيبعت إيميل فيه رابط
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // ملحوظة أمان: بنرجع نفس الرسالة سواء الإيميل موجود أو لأ
    // عشان محدش يقدر يعرف إيه الإيميلات المسجلة عندنا
    if (!user) {
      return res.json({
        message: 'لو الإيميل ده مسجل عندنا، هيوصلك رابط إعادة تعيين كلمة المرور',
      });
    }

    // توليد كود عشوائي وتشفيره قبل التخزين
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // صالح 30 دقيقة
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Zivo" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'إعادة تعيين كلمة المرور - Zivo',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #10b981;">إعادة تعيين كلمة المرور</h2>
          <p>مرحبًا ${user.name}،</p>
          <p>وصلنا طلب لإعادة تعيين كلمة المرور بتاعة حسابك على Zivo. اضغط على الزرار ده لإكمال العملية:</p>
          <a href="${resetUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">إعادة تعيين كلمة المرور</a>
          <p>الرابط ده هيفضل شغال لمدة 30 دقيقة بس.</p>
          <p>لو انت مش اللي طلبت ده، تجاهل الإيميل ده ببساطة.</p>
        </div>
      `,
    });

    res.json({
      message: 'لو الإيميل ده مسجل عندنا، هيوصلك رابط إعادة تعيين كلمة المرور',
    });
  } catch (error) {
    res.status(500).json({ message: 'حصل خطأ، جرب تاني كمان شوية' });
  }
};

// @desc    حفظ كلمة المرور الجديدة باستخدام التوكن اللي جه بالإيميل
// @route   POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'الرابط غير صالح أو منتهي الصلاحية' });
    }

    user.password = password; // هيتشفر تلقائي بسبب pre-save hook في الموديل
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حصل خطأ، جرب تاني كمان شوية' });
  }
};

module.exports = { registerUser, loginUser, getProfile, forgotPassword, resetPassword };
