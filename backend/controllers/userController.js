const driver = require("../config/neo4j");


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
    console.error("REGISTER ERROR:", err);   // 🔥 helpful debug
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
    console.error("LOGIN ERROR:", err);   // 🔥 helpful debug
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};