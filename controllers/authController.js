const bcrypt = require("bcrypt");
const { sign } = require("../utils/jwt");
const { getClient } = require("../config/db");
const { createUser, findByEmail } = require("../models/userModel");
const { createRestaurant } = require("../models/restaurantModel");
const storageService = require("../services/storageService");

/**
 * POST /api/auth/signup
 * expects multi-part form with optional logo & cover files
 * body: firstname, lastname, email, password, storeName, moduleType, address, vat, openingTime
 */
async function signup(req, res, next) {
  console.log("registering");
  const client = await getClient();
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      storeName,
      moduleType,
      address,
      // vat,
      // openingTime,
    } = req.body;


    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !storeName ||
      !moduleType ||
      !address
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
        // vat,
        // openingTime,
      },
      client
    );

    await client.query("COMMIT");

    const token = sign({ id: user.id, email: user.email });

    client.release();
    return res
      .status(201)
      .json({
        message: "Signup successful",
        token,
        user: {
          id: user.id,
          lastname: user.firstname || user.lastname,
          email: user.email,
        },
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

/**
 * POST /api/auth/login
 * body: email, password
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await require("../models/userModel").findByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = sign({ id: user.id, email: user.email });
    return res.json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
