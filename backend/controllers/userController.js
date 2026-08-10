const driver = require("../config/neo4j");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper for formatting DB errors cleanly
const handleDbError = (err, res, prefix = "Database error") => {
  console.error(`${prefix}:`, err);
  if (
    err.code === "ServiceUnavailable" ||
    err.code === "SessionExpired" ||
    err.message?.includes("RoutingTable") ||
    err.message?.includes("discovery") ||
    err.message?.includes("ENOTFOUND")
  ) {
    return res.status(503).json({
      error: "Database service unavailable. Please check your Neo4j instance status.",
      message: "Database service unavailable. Please check your Neo4j instance status."
    });
  }
  return res.status(500).json({
    error: err.message || "Internal server error",
    message: err.message || "Internal server error"
  });
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required", message: "Name, email, and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const session = driver.session();

  try {
    // Check if user exists
    const existing = await session.run(
      `MATCH (u:User {email: $cleanEmail}) RETURN u`,
      { cleanEmail }
    );

    if (existing.records.length > 0) {
      return res.status(400).json({ message: "User already exists", error: "User already exists" });
    }

    // Create user
    await session.run(
      `
      CREATE (u:User {
        name: $cleanName,
        email: $cleanEmail,
        password: $password
      })
      `,
      { cleanName, cleanEmail, password }
    );

    res.json({
      message: "User registered successfully",
      user: {
        name: cleanName,
        email: cleanEmail
      }
    });

  } catch (err) {
    handleDbError(err, res, "REGISTER ERROR DETAILS");
  } finally {
    await session.close();
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required", error: "Email and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $cleanEmail, password: $password})
      RETURN u
      `,
      { cleanEmail, password }
    );

    if (result.records.length === 0) {
      return res.status(401).json({ message: "Invalid credentials", error: "Invalid credentials" });
    }

    const user = result.records[0].get("u").properties;

    res.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    handleDbError(err, res, "LOGIN ERROR DETAILS");
  } finally {
    await session.close();
  }
};

// ================= GOOGLE LOGIN =================
exports.googleLogin = async (req, res) => {
  const { token } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: "Google token is required", message: "Google token is required" });
  }

  let name = "";
  let email = "";

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload() || {};
    email = payload.email ? payload.email.trim().toLowerCase() : "";
    name = payload.name ? payload.name.trim() : (email ? email.split("@")[0] : "Google User");

    if (!email) {
      return res.status(400).json({ error: "Could not retrieve email from Google token", message: "Could not retrieve email from Google token" });
    }
  } catch (err) {
    console.error("GOOGLE TOKEN VERIFICATION ERROR:", err.message);
    return res.status(400).json({ error: err.message || "Invalid Google token", message: err.message || "Invalid Google token" });
  }

  const session = driver.session();

  try {
    const existing = await session.run(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (existing.records.length === 0) {
      await session.run(
        `
        CREATE (u:User {
          name: $name,
          email: $email,
          authProvider: "google"
        })
        `,
        { name, email }
      );
    } else {
      const existingUser = existing.records[0].get("u").properties;
      name = existingUser.name || name;
    }

    res.json({
      message: "Google Login successful",
      user: { name, email }
    });

  } catch (err) {
    handleDbError(err, res, "GOOGLE LOGIN DB ERROR");
  } finally {
    await session.close();
  }
};

// ================= GITHUB LOGIN =================
exports.githubLogin = async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: "Github auth code is required" });

  let name = "";
  let email = "";

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return res.status(400).json({ error: "Failed to get Github access token" });

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "SkillSwapApp"
      },
    });
    
    let rawEmail = userResponse.data.email;
    if (!rawEmail) {
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "SkillSwapApp"
        },
      });
      const primaryEmail = emailResponse.data.find(e => e.primary);
      rawEmail = primaryEmail ? primaryEmail.email : null;
    }

    name = userResponse.data.name || userResponse.data.login || "Github User";
    if (!rawEmail) return res.status(400).json({ error: "Could not retrieve Github email" });
    email = rawEmail.trim().toLowerCase();
  } catch (err) {
    console.error("GITHUB OAUTH ERROR:", err.response?.data || err.message);
    return res.status(400).json({ error: err.response?.data || "Github login failed" });
  }

  const session = driver.session();

  try {
    const existing = await session.run(`MATCH (u:User {email: $email}) RETURN u`, { email });

    if (existing.records.length === 0) {
      await session.run(
        `CREATE (u:User { name: $name, email: $email, authProvider: "github" })`,
        { name, email }
      );
    } else {
      const existingUser = existing.records[0].get("u").properties;
      name = existingUser.name || name;
    }

    res.json({ message: "Github Login successful", user: { name, email } });
  } catch (err) {
    handleDbError(err, res, "GITHUB LOGIN DB ERROR");
  } finally {
    await session.close();
  }
};

// ================= LINKEDIN LOGIN =================
exports.linkedinLogin = async (req, res) => {
  const { code, redirectUri } = req.body || {};
  if (!code) return res.status(400).json({ error: "LinkedIn auth code is required" });

  let name = "";
  let email = "";

  try {
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", tokenParams.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return res.status(400).json({ error: "Failed to get LinkedIn access token" });

    const userResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const rawEmail = userResponse.data.email;
    name = userResponse.data.name || "LinkedIn User";
    if (!rawEmail) return res.status(400).json({ error: "Could not retrieve LinkedIn email" });
    email = rawEmail.trim().toLowerCase();
  } catch (err) {
    console.error("LINKEDIN OAUTH ERROR:", err.response?.data || err.message);
    return res.status(400).json({ error: err.response?.data || "LinkedIn login failed" });
  }

  const session = driver.session();

  try {
    const existing = await session.run(`MATCH (u:User {email: $email}) RETURN u`, { email });

    if (existing.records.length === 0) {
      await session.run(
        `CREATE (u:User { name: $name, email: $email, authProvider: "linkedin" })`,
        { name, email }
      );
    } else {
      const existingUser = existing.records[0].get("u").properties;
      name = existingUser.name || name;
    }

    res.json({ message: "LinkedIn Login successful", user: { name, email } });
  } catch (err) {
    handleDbError(err, res, "LINKEDIN LOGIN DB ERROR");
  } finally {
    await session.close();
  }
};