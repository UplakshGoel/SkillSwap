const driver = require("../config/neo4j");

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  const session = driver.session();
  const { email } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email})
      OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (u)-[:INTERESTED_IN]->(i:Skill)

      RETURN u,
             collect(DISTINCT s.name) AS skills,
             collect(DISTINCT i.name) AS interests
      `,
      { email }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const record = result.records[0];
    const userProps = record.get("u").properties;

    res.json({
      user: {
        ...userProps,
        bio: userProps.bio || "",
        organization: userProps.organization || ""
      },
      skills: record.get("skills") || [],
      interests: record.get("interests") || []
    });

  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  const session = driver.session();

  const {
    email,
    skills,
    interests,
    bio,
    organization
  } = req.body;

  try {
    // 🔥 Remove old relationships (skills + interests)
    await session.run(
      `
      MATCH (u:User {email: $email})-[r:HAS_SKILL|INTERESTED_IN]->()
      DELETE r
      `,
      { email }
    );

    const skillList = skills
      ? skills.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const interestList = interests
      ? interests.split(",").map(i => i.trim()).filter(Boolean)
      : [];

    // ================= ADD SKILLS =================
    for (let skill of skillList) {
      await session.run(
        `
        MERGE (s:Skill {name: $skill})
        WITH s
        MATCH (u:User {email: $email})
        MERGE (u)-[:HAS_SKILL]->(s)
        `,
        { skill, email }
      );
    }

    // ================= ADD INTERESTS =================
    for (let interest of interestList) {
      await session.run(
        `
        MERGE (s:Skill {name: $interest})
        WITH s
        MATCH (u:User {email: $email})
        MERGE (u)-[:INTERESTED_IN]->(s)
        `,
        { interest, email }
      );
    }

    // 🔥 UPDATE BIO + ORGANIZATION (SAFE)
    await session.run(
      `
      MATCH (u:User {email: $email})
      SET u.bio = $bio,
          u.organization = $organization
      `,
      {
        email,
        bio: bio || "",
        organization: organization || ""
      }
    );

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};