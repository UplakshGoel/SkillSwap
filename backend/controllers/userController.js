const driver = require("../config/neo4j");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// ================= REGISTER =================
exports.register = async (req, res) => {
  const session = driver.session();
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const existing = await session.run(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (existing.records.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    await session.run(
      `
      CREATE (u:User {
        name: $name,
        email: $email,
        password: $password
      })
      `,
      { name, email, password }
    );

    // 🔥 IMPORTANT FIX: don't send password back
    res.json({
      message: "User registered successfully",
      user: {
        name,
        email
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR DETAILS:", err);   // 🔥 detailed debug
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  const session = driver.session();
  const { email, password } = req.body;

  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email, password: $password})
      RETURN u
      `,
      { email, password }
    );

    if (result.records.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.records[0].get("u").properties;

    // 🔥 IMPORTANT FIX: return only needed fields
    res.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR DETAILS:", err);   // 🔥 detailed debug
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

// ================= GOOGLE LOGIN =================
exports.googleLogin = async (req, res) => {
  const session = driver.session();
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email } = ticket.getPayload();

    // Check if user exists
    const existing = await session.run(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (existing.records.length === 0) {
      // Create user if not exists
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
    }

    res.json({
      message: "Google Login successful",
      user: { name, email }
    });

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(400).json({ error: err.message || "Invalid Google token" });
  } finally {
    await session.close();
  }
};

// ================= GITHUB LOGIN =================
exports.githubLogin = async (req, res) => {
  const session = driver.session();
  const { code } = req.body;

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
    
    // Email might be private, so fetch emails
    let email = userResponse.data.email;
    if (!email) {
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "SkillSwapApp"
        },
      });
      const primaryEmail = emailResponse.data.find(e => e.primary);
      email = primaryEmail ? primaryEmail.email : null;
    }

    const name = userResponse.data.name || userResponse.data.login;
    if (!email) return res.status(400).json({ error: "Could not retrieve Github email" });

    const existing = await session.run(`MATCH (u:User {email: $email}) RETURN u`, { email });

    if (existing.records.length === 0) {
      await session.run(
        `CREATE (u:User { name: $name, email: $email, authProvider: "github" })`,
        { name, email }
      );
    }

    res.json({ message: "Github Login successful", user: { name, email } });
  } catch (err) {
    console.error("GITHUB LOGIN ERROR:", err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data || "Github login failed" });
  } finally {
    await session.close();
  }
};

// ================= LINKEDIN LOGIN =================
exports.linkedinLogin = async (req, res) => {
  const session = driver.session();
  const { code, redirectUri } = req.body;

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

    const { name, email } = userResponse.data;
    if (!email) return res.status(400).json({ error: "Could not retrieve LinkedIn email" });

    const existing = await session.run(`MATCH (u:User {email: $email}) RETURN u`, { email });

    if (existing.records.length === 0) {
      await session.run(
        `CREATE (u:User { name: $name, email: $email, authProvider: "linkedin" })`,
        { name, email }
      );
    }

    res.json({ message: "LinkedIn Login successful", user: { name, email } });
  } catch (err) {
    console.error("LINKEDIN LOGIN ERROR:", err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data || "LinkedIn login failed" });
  } finally {
    await session.close();
  }
};