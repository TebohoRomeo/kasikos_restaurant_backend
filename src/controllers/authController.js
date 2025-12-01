const bcrypt = require("bcrypt");
const { sign, verifyRefresh } = require("../utils/jwt");
const { getClient } = require("../config/db");
const { createUser, findByEmail } = require("../models/userModel");
const { createRestaurant } = require("../models/restaurantModel");
const storageService = require("../services/storageService");
const { generateToken, hashToken } = require("../utils/token.js");
const { sendEmail } = require("../services/emailService.js");

async function signup(req, res, next) {
  const client = await getClient();
  try {
    const {
      firstname,
      lastname,
      email,
      phones,
      password,
      storeName,
      moduleType,
      address,
      vat,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !phones ||
      !password ||
      !storeName ||
      !moduleType ||
      !address ||
      !vat
    ) {
      client.release();
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Check existing user
    const existing = await findByEmail(email);
    if (existing) {
      client.release();
      return res.status(409).json({ error: "Email already registered" });
    }

    // upload files via storageService (can be local or S3)
    const logoFile = req.files && req.files.logo ? req.files.logo[0] : null;
    const coverFile = req.files && req.files.cover ? req.files.cover[0] : null;
    const logoRes = await storageService.upload(logoFile);
    const coverRes = await storageService.upload(coverFile);

    const passwordHash = await bcrypt.hash(password, 12);

    await client.query("BEGIN");

    const user = await createUser(
      {
        firstname,
        lastname,
        email,
        phones,
        passwordHash,
      },
      client
    );

    const restaurant = await createRestaurant(
      {
        ownerId: user.id,
        storeName,
        logoUrl: logoRes ? logoRes.url : null,
        logoKey: logoRes ? logoRes.key : null,
        coverUrl: coverRes ? coverRes.url : null,
        coverKey: coverRes ? coverRes.key : null,
        moduleType,
        address,
        vat,
      },
      client
    );

    const verifyToken = generateToken();
    const verifyHash = hash(verifyToken);
    const verifyExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await client.query(
      "INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)",
      [user.id, verifyHash, verifyExpires]
    );

    await client.query("COMMIT");

    try {
      await sendEmail(
        user.email,
        "Verify your email",
        `<p>Click to verify: <a href="${process.env.API_URL}/api/auth/verify?token=${verifyToken}">Verify email</a></p>`
      );
    } catch (e) {
      console.error("sendEmail error", e);
    }
    const token = sign({ id: user.id, email: user.email, role: user.role });
    const refreshToken = verifyRefresh({ id: user.id, role: user.role });
    const refreshHash = hash(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await pool.query(
      "INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES ($1,$2,$3)",
      [refreshHash, user.id, expiresAt]
    );
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    client.release();
    return res.status(201).json({
      message: "Signup successful. Check email to verify.",
      token: token,
      user,
      restaurant,
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
    // optionally remove uploaded files on failure
    console.error(err);
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = await require("../models/userModel").findByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.verified) return res.status(403).json({ error: 'Please verify your email before logging in' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    // rotate refresh tokens
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user.id]);
    const token = sign({ id: user.id, email: user.email });
    return res.json({ token });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next){
  try {
    const { firstname, lastname, email, phones } = req.body;
    const check = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (check.rows[0] && check.rows[0].id !== req.user.id) return res.status(409).json({ error:'Email already in use' });
    const upd = await pool.query('UPDATE users SET firstname=$1, lastname=$2, email=$3, phones=$4 WHERE id=$5 RETURNING id, firstname, lastname, email, phones', [firstname, lastname, email, phones || null, req.user.id]);
    return res.json({ user: upd.rows[0] });
  } catch(err){ next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    const user = await findByEmail(email);
    // Always respond success to avoid leaking existence
    if (!user)
      return res.json({
        message: "If an account exists, a reset email has been sent",
      });
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)",
      [user.id, tokenHash, expires]
    );
    // send email
    try {
      await sendEmail(
        user.email,
        "Password reset",
        `<p>Reset link: <a href="${process.env.APP_URL}/reset-password?token=${token}">Reset password</a></p>`
      );
    } catch (e) {
      console.error("send email failed", e);
    }
    return res.json({
      message: "If an account exists, a reset email has been sent",
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next){
  try {
    const { currentPassword, newPassword } = req.body;
    const user = (await pool.query('SELECT id, password_hash FROM users WHERE id=$1',[req.user.id])).rows[0];
    if (!user) return res.status(404).json({ error:'User not found' });
    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(401).json({ error:'Current password incorrect' });
    const hashedNewPassowrd = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hashedNewPassowrd, req.user.id]);
    await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1', [req.user.id]);
    return res.json({ ok:true });
  } catch(err){ next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ error: "Token and newPassword required" });
    const tokenHash = hashToken(token);
    const row = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE token_hash=$1 AND used=false AND expires_at > NOW()",
      [tokenHash]
    );
    const rec = row.rows[0];
    if (!rec)
      return res.status(400).json({ error: "Invalid or expired token" });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2", [
      passwordHash,
      rec.user_id,
    ]);
    // revoke refresh tokens
    await pool.query("DELETE FROM refresh_tokens WHERE user_id=$1", [
      rec.user_id,
    ]);
    await pool.query("UPDATE password_reset_tokens SET used=true WHERE id=$1", [
      rec.id,
    ]);
    return res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next){
  try {
    const token = req.cookies['refresh_token'];
    if (!token) return res.status(401).json({ error: 'No refresh token' });
    const decoded = await new Promise((resolve,reject)=>{ try{ resolve(JSON.parse(JSON.stringify(require('jsonwebtoken').verify(token, process.env.REFRESH_SECRET)))); }catch(e){reject(e);} });
    const hash = hashToken(token);
    const row = await pool.query('SELECT * FROM refresh_tokens WHERE token_hash=$1 AND user_id=$2', [hash, decoded.id]);
    if (!row.rows[0]) return res.status(401).json({ error: 'Invalid refresh token' });
    await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1', [decoded.id]);
    const newRefresh = sign({ id: decoded.id, role: decoded.role });
    const newHash = hashToken(newRefresh);
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7);
    await pool.query('INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES ($1,$2,$3)', [newHash, decoded.id, expiresAt]);
    const accessToken = sign({ id: decoded.id, role: (await pool.query('SELECT role FROM users WHERE id=$1',[decoded.id])).rows[0].role });
    res.cookie('refresh_token', newRefresh, { httpOnly:true, secure: process.env.COOKIE_SECURE === 'true', sameSite:'lax', path:'/api/auth/refresh', maxAge: 7*24*60*60*1000 });
    return res.json({ token: accessToken });
  } catch(err) { console.error(err); return res.status(401).json({ error: 'Invalid refresh token' }); }
}


async function logout(req, res, next){
  try {
    const token = req.cookies['refresh_token'];
    if (token) {
      const h = hashToken(token);
      await pool.query('DELETE FROM refresh_tokens WHERE token_hash=$1', [h]);
    }
    res.clearCookie('refresh_token', { path:'/api/auth/refresh' });
    return res.json({ ok:true });
  } catch(err) { next(err); }
}

module.exports = { signup, login, logout, refresh, changePassword, forgotPassword, resetPassword };
