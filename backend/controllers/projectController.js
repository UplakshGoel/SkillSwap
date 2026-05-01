const driver = require("../config/neo4j");


function getMaxMembers(teamSize) {
  if (!teamSize) return 1;

  if (teamSize.includes("-")) {
    return parseInt(teamSize.split("-")[1]);
  }

  if (teamSize.includes("+")) {
    return parseInt(teamSize);
  }

  return parseInt(teamSize);
}


async function createNotification(session, email, text, metadata = {}) {
  const { type = "info", requesterEmail = null, projectId = null } = metadata;
  
  await session.run(
    `
    MATCH (u:User {email: $email})
    MERGE (u)-[:HAS_NOTIFICATION]->(n:Notification {
      text: $text,
      type: $type,
      requesterEmail: coalesce($requesterEmail, ""),
      projectId: coalesce(toInteger($projectId), -1)
    })
    ON CREATE SET 
      n.createdAt = timestamp(),
      n.read = false
    `,
    { email, text, type, requesterEmail, projectId }
  );
}


exports.createProject = async (req, res) => {
  const session = driver.session();

  const { email, title, description, skills, teamSize } = req.body;

  const maxMembers = Number(teamSize);

  if (!maxMembers || maxMembers < 1) {
    return res.status(400).json({ message: "Invalid team size" });
  }

  try {
    if (!email || !title || !teamSize) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const createRes = await session.run(
      `
      MATCH (u:User {email: $email})
      MERGE (p:Project {
        title: $title,
        owner: $email
      })
      ON CREATE SET 
        p.description = $description,
        p.teamSize = $maxMembers,
        p.createdAt = timestamp()
      
      MERGE (u)-[:CREATED]->(p)
      MERGE (u)-[:JOINED]->(p)
      RETURN p
      `,
      { email, title, description, maxMembers }
    );

    const pNode = createRes.records[0].get("p");
    const projectId = pNode.identity.toNumber();

    const skillList = (skills || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    for (let skill of skillList) {
      await session.run(
        `
        MATCH (p:Project) WHERE id(p) = toInteger($projectId)
        MERGE (s:Skill {name: $skill})
        MERGE (p)-[:REQUIRES]->(s)
        `,
        { projectId, skill }
      );
    }

    res.json({ message: "Project created", projectId });

  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.getProjects = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (p:Project)
      OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
      RETURN p, collect(DISTINCT s.name) AS skills
      `
    );

    const projects = result.records.map(record => ({
        id: record.get("p").identity.low,   // 🔥 IMPORTANT
        ...record.get("p").properties,
        skills: record.get("skills")
    }));

    res.json(projects);

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.updateProject = async (req, res) => {
  const session = driver.session();

  const { email, projectId, title, description, skills, teamSize } = req.body;

  try {
    const maxMembers = Number(teamSize);

    if (!maxMembers || maxMembers < 1) {
      return res.status(400).json({ message: "Invalid team size" });
    }

    await session.run(
      `
      MATCH (p:Project)
      WHERE id(p) = toInteger($projectId) AND p.owner = $email

      SET p.title = $title,
          p.description = $description,
          p.teamSize = $maxMembers
      `,
      {
        projectId,
        email,
        title,
        description,
        maxMembers
      }
    );

    // 🔥 Reset skills (important)
    await session.run(
      `
      MATCH (p:Project)-[r:REQUIRES]->()
      WHERE id(p) = toInteger($projectId)
      DELETE r
      `,
      { projectId }
    );

    const skillList = (skills || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    for (let skill of skillList) {
      await session.run(
        `
        MATCH (p:Project)
        WHERE id(p) = toInteger($projectId)

        MERGE (s:Skill {name: $skill})
        MERGE (p)-[:REQUIRES]->(s)
        `,
        { projectId, skill }
      );
    }

    res.json({ message: "Project updated" });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};


exports.deleteProject = async (req, res) => {
  const session = driver.session();

  const { email, projectId } = req.body;

  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email})-[:CREATED]->(p:Project)
      WHERE id(p) = toInteger($projectId)
      DETACH DELETE p
      RETURN p
      `,
      { email, projectId }
    );

    if (result.records.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ message: "Project deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.getRecommendedProjects = async (req, res) => {
  const session = driver.session();
  const { email } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email})

      // Match user skills
      OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(p:Project)

      // Match interests
      OPTIONAL MATCH (u)-[:INTERESTED_IN]->(i:Skill)<-[:REQUIRES]-(p2:Project)

      WITH collect(DISTINCT p) + collect(DISTINCT p2) AS projects

      UNWIND projects AS proj

      OPTIONAL MATCH (proj)-[:REQUIRES]->(sk:Skill)

      WITH proj, collect(DISTINCT sk.name) AS skills

      RETURN DISTINCT proj, skills
      `
      ,
      { email }
    );

    const projects = result.records.map(record => ({
      id: record.get("proj").identity.low,
      ...record.get("proj").properties,
      skills: record.get("skills")
    }));

    res.json(projects);

  } catch (err) {
    console.error("RECOMMEND ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.joinProject = async (req, res) => {
  const session = driver.session();
  const { email, projectId } = req.body;

  try {
    // 1. Get project + members + check if already requested
    const result = await session.run(
      `
      MATCH (p:Project)
      WHERE id(p) = toInteger($projectId)

      OPTIONAL MATCH (u:User)-[r:JOINED]->(p)
      WHERE NOT (u)-[:CREATED]->(p)
      OPTIONAL MATCH (requester:User {email: $email})

      RETURN p, 
             collect(DISTINCT u.email) AS memberEmails,
             p.owner AS ownerEmail,
             p.title AS title,
             requester.name AS requesterName
      `,
      { projectId, email }
    );

    if (result.records.length === 0) return res.status(404).json({ message: "Project not found" });

    const record = result.records[0];
    const project = record.get("p").properties;
    const memberEmails = record.get("memberEmails");
    const ownerEmail = record.get("ownerEmail");
    const projectTitle = record.get("title");
    const requesterName = record.get("requesterName");

    if (memberEmails.includes(email) || ownerEmail === email) {
      return res.status(400).json({ message: "You are already part of this project" });
    }

    if (memberEmails.length >= project.teamSize) {
      return res.status(400).json({ message: "Project is full" });
    }

    if (!requesterName) {
      return res.status(400).json({ message: "User profile not found. Please complete your profile." });
    }

    // 2. Check if notification already exists (to avoid spam)
    const existingReq = await session.run(
      `
      MATCH (owner:User {email: $ownerEmail})-[:HAS_NOTIFICATION]->(n:Notification {
        type: "join_request", 
        requesterEmail: $email, 
        projectId: toInteger($projectId)
      })
      RETURN n
      `,
      { ownerEmail, email, projectId }
    );

    if (existingReq.records.length > 0) {
      return res.json({ message: "Your request is already pending approval" });
    }

    // 3. Notify Owner
    await createNotification(
      session,
      ownerEmail,
      `${requesterName} wants to join your project "${projectTitle}"`,
      {
        type: "join_request",
        requesterEmail: email,
        projectId: Number(projectId)
      }
    );

    // 4. Notify Requester
    await createNotification(
      session,
      email,
      `Request sent for "${projectTitle}". Awaiting owner approval.`
    );

    res.json({ message: "Join request sent to owner" });

  } catch (err) {
    console.error("JOIN REQUEST ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.getProjectById = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (p:Project)
      WHERE id(p) = toInteger($id)

      OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
      OPTIONAL MATCH (u:User)-[:JOINED]->(p)
      WHERE NOT (u)-[:CREATED]->(p)
      OPTIONAL MATCH (creator:User)-[:CREATED]->(p)

      WITH p,
           collect(DISTINCT s.name) AS skills,
           collect(DISTINCT u.name) AS members,
           creator

      RETURN p, skills, members, creator.name AS creatorName
      `,
      { id }
    );

    // 🔥 SAFETY CHECK
    if (result.records.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const record = result.records[0];
    const p = record.get("p");

    if (!p) {
      return res.status(500).json({ message: "Project data corrupted" });
    }

    const skills = (record.get("skills") || []).filter(Boolean);
    const members = (record.get("members") || []).filter(Boolean);

    const project = {
      id: p.identity.toNumber(),   // ✅ FIXED
      ...p.properties,
      skills,
      members,
      memberCount: members.length,
      creatorName: record.get("creatorName") || "Unknown",
      teamSize: Number(p.properties.teamSize) || 0   // ✅ FIXED
    };

    res.json(project);

  } catch (err) {
    console.error("GET PROJECT ERROR:", err);  // 🔥 IMPORTANT
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};


exports.getMyProjects = async (req, res) => {
  const session = driver.session();
  const { email } = req.params;

  try {
    const createdResult = await session.run(
      `
      MATCH (u:User {email: $email})-[:CREATED]->(p:Project)
      OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
      RETURN p, collect(DISTINCT s.name) AS skills
      `,
      { email }
    );

    const joinedResult = await session.run(
      `
      MATCH (u:User {email: $email})-[:JOINED]->(p:Project)
      WHERE NOT p.owner = $email
      OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
      RETURN p, collect(DISTINCT s.name) AS skills
      `,
      { email }
    );

    const createdProjects = createdResult.records.map(record => ({
      id: record.get("p").identity.low,
      ...record.get("p").properties,
      skills: record.get("skills")
    }));

    const joinedProjects = joinedResult.records.map(record => ({
      id: record.get("p").identity.low,
      ...record.get("p").properties,
      skills: record.get("skills")
    }));

    res.json({
      createdProjects,
      joinedProjects
    });

  } catch (err) {
    console.error("MY PROJECTS ERROR:", err);  // 🔥 check this
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.getAllProjects = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (p:Project)
      OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
      WITH p, collect(DISTINCT s.name) AS skills
      RETURN p, skills
    `);

    const projects = result.records.map(record => {
      const p = record.get("p");

      // 🔥 Safety check
      if (!p) return null;

      return {
        id: p.identity.toNumber(),   // ✅ safer than .low
        ...p.properties,
        skills: (record.get("skills") || []).filter(Boolean) // ✅ remove nulls
      };
    }).filter(Boolean); // remove null entries

    res.json(projects);

  } catch (err) {
    console.error("GET ALL PROJECTS ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.kickMember = async (req, res) => {
  const session = driver.session();

  const { ownerEmail, memberName, projectId } = req.body;

  try {
    // 🔥 Verify owner
    const check = await session.run(
      `
      MATCH (o:User {email: $ownerEmail})-[:CREATED]->(p:Project)
      WHERE id(p) = toInteger($projectId)
      RETURN p
      `,
      { ownerEmail, projectId }
    );

    if (check.records.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔥 Prevent removing owner
    const memberCheck = await session.run(
      `
      MATCH (u:User {name: $memberName})
      RETURN u.email AS email
      `,
      { memberName }
    );

    const memberEmail = memberCheck.records[0]?.get("email");

    if (memberEmail === ownerEmail) {
      return res.status(400).json({ message: "Owner cannot be removed" });
    }

    // 🔥 Remove relationship
    await session.run(
      `
      MATCH (u:User {name: $memberName})-[r:JOINED]->(p:Project)
      WHERE id(p) = toInteger($projectId)
      DELETE r
      `,
      { memberName, projectId }
    );

    const projectRes = await session.run(
      `
      MATCH (p:Project)
      WHERE id(p) = toInteger($projectId)
      RETURN p.title AS title
      `,
      { projectId }
    );

    const projectTitle = projectRes.records[0].get("title");

    await createNotification(
      session,
      memberEmail,
      `You were removed from "${projectTitle}"`,
      { projectId: Number(projectId) }
    );

    res.json({ message: "Member removed" });

  } catch (err) {
    console.error("KICK ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.sendMessage = async (req, res) => {
  const session = driver.session();

  const { email, projectId, text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ message: "Message empty" });
    }

    // 🔥 Ensure user is part of project
    const check = await session.run(
      `
      MATCH (u:User {email: $email})
      MATCH (p:Project)
      WHERE id(p) = toInteger($projectId)

      OPTIONAL MATCH (u)-[:JOINED]->(p)
      OPTIONAL MATCH (u)-[:CREATED]->(p)

      RETURN u, p
      `,
      { email, projectId }
    );

    if (check.records.length === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔥 Create message
    await session.run(
      `
      MATCH (u:User {email: $email})
      MATCH (p:Project)
      WHERE id(p) = toInteger($projectId)

      CREATE (m:Message {
        text: $text,
        createdAt: timestamp()
      })

      MERGE (u)-[:SENT]->(m)
      MERGE (m)-[:IN_PROJECT]->(p)
      `,
      { email, projectId, text }
    );

    res.json({ message: "Sent" });

  } catch (err) {
    console.error("SEND MSG ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

exports.getMessages = async (req, res) => {
  const session = driver.session();
  const { projectId } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (m:Message)-[:IN_PROJECT]->(p:Project)
      WHERE id(p) = toInteger($projectId)

      MATCH (u:User)-[:SENT]->(m)

      RETURN m.text AS text,
             m.createdAt AS createdAt,
             u.name AS sender
      ORDER BY m.createdAt ASC
      `,
      { projectId }
    );

    const messages = result.records.map(r => ({
      text: r.get("text"),
      sender: r.get("sender"),
      createdAt: r.get("createdAt")
    }));

    res.json(messages);

  } catch (err) {
    console.error("GET MSG ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};


exports.leaveProject = async (req, res) => {
  const session = driver.session();

  const { email, projectId } = req.body;

  try {
    // 🔥 Prevent owner from leaving
    const check = await session.run(
      `
      MATCH (u:User {email: $email})-[:CREATED]->(p:Project)
      WHERE id(p) = toInteger($projectId)
      RETURN p
      `,
      { email, projectId }
    );

    if (check.records.length > 0) {
      return res.status(400).json({ message: "Owner cannot leave project" });
    }

    // 🔥 Remove join relationship
    await session.run(
      `
      MATCH (u:User {email: $email})-[r:JOINED]->(p:Project)
      WHERE id(p) = toInteger($projectId)
      DELETE r
      `,
      { email, projectId }
    );

    const projectRes = await session.run(
      `
      MATCH (p:Project)
      WHERE id(p) = toInteger($projectId)
      RETURN p.title AS title
      `,
      { projectId }
    );

    const projectTitle = projectRes.records[0].get("title");

    await createNotification(
      session,
      email,
      `You left "${projectTitle}"`,
      { projectId: Number(projectId) }
    );

    res.json({ message: "Left project" });

  } catch (err) {
    console.error("LEAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.handleJoinRequest = async (req, res) => {
  const session = driver.session();
  const { action, notificationId, requesterEmail, projectId, ownerEmail } = req.body;
  const pId = Number(projectId);
  const nId = Number(notificationId);

  try {
    if (action === "approve") {
      // 0. Double check if project is full
      const capacityRes = await session.run(
        `
        MATCH (p:Project)
        WHERE id(p) = toInteger($pId)
        OPTIONAL MATCH (m:User)-[:JOINED]->(p)
        WHERE NOT (m)-[:CREATED]->(p)
        RETURN p.teamSize AS teamSize, count(m) AS currentMembers
        `,
        { pId }
      );

      if (capacityRes.records.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }

      const record = capacityRes.records[0];
      const rawTeamSize = record.get("teamSize");
      const rawCurrentMembers = record.get("currentMembers");

      const teamSize = (rawTeamSize && rawTeamSize.toNumber) ? rawTeamSize.toNumber() : (Number(rawTeamSize) || 0);
      const currentMembers = (rawCurrentMembers && rawCurrentMembers.toNumber) ? rawCurrentMembers.toNumber() : (Number(rawCurrentMembers) || 0);

      if (currentMembers >= teamSize) {
        return res.status(400).json({ message: "Project is full" });
      }

      // 1. Join user to project
      await session.run(
        `
        MATCH (u:User {email: $requesterEmail})
        MATCH (p:Project)
        WHERE id(p) = toInteger($pId)
        MERGE (u)-[:JOINED]->(p)
        `,
        { requesterEmail, pId }
      );

      // 2. Notify requester
      const projectRes = await session.run(
        `MATCH (p:Project) WHERE id(p) = toInteger($pId) RETURN p.title AS title`,
        { pId }
      );
      const projectTitle = projectRes.records[0]?.get("title") || "the project";

      await createNotification(
        session,
        requesterEmail,
        `Congratulations! Your request to join "${projectTitle}" has been approved.`,
        { type: "approval", projectId: pId }
      );
    } else {
       // Notify requester of rejection (optional but polite)
       await createNotification(
        session,
        requesterEmail,
        `Your request to join the project has been declined.`,
        { type: "rejection", projectId: pId }
      );
    }

    // 3. Delete the join request notification
    await session.run(
      `
      MATCH (n:Notification)
      WHERE id(n) = toInteger($nId)
      DETACH DELETE n
      `,
      { nId }
    );

    res.json({ message: `Request ${action}d successfully` });

  } catch (err) {
    console.error("HANDLE JOIN REQUEST ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

exports.getNotifications = async (req, res) => {
  const session = driver.session();
  const { email } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email})-[:HAS_NOTIFICATION]->(n:Notification)
      RETURN n
      ORDER BY n.createdAt DESC
      `,
      { email }
    );

    const notifications = result.records.map(r => {
      const n = r.get("n");
      const props = n.properties;

      const toJSNumber = (val) => {
        if (val === null || val === undefined) return null;
        return (val.toNumber) ? val.toNumber() : Number(val);
      };

      return {
        id: n.identity.toNumber(),
        text: props.text,
        type: props.type || "info",
        requesterEmail: props.requesterEmail,
        projectId: toJSNumber(props.projectId),
        createdAt: toJSNumber(props.createdAt),
        read: props.read
      };
    });

    res.json(notifications);

  } catch (err) {
    console.error("NOTIFICATION ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

exports.markNotificationsRead = async (req, res) => {
  const session = driver.session();
  const { email } = req.body;

  try {
    await session.run(
      `
      MATCH (u:User {email: $email})-[:HAS_NOTIFICATION]->(n:Notification)
      SET n.read = true
      `,
      { email }
    );

    res.json({ message: "Marked as read" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

exports.markOneNotificationRead = async (req, res) => {
  const session = driver.session();
  const { id } = req.body;

  try {
    await session.run(
      `
      MATCH (n:Notification)
      WHERE id(n) = toInteger($id)
      SET n.read = true
      `,
      { id }
    );

    res.json({ message: "Marked as read" });

  } catch (err) {
    console.error("READ ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

exports.deleteNotification = async (req, res) => {
  const session = driver.session();
  const { id } = req.body;

  try {
    await session.run(
      `
      MATCH (n:Notification)
      WHERE id(n) = toInteger($id)
      DETACH DELETE n
      `,
      { id }
    );

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("DELETE NOTIF ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};



exports.createPost = async (req, res) => {
  const session = driver.session();

  const { email, projectId, content } = req.body;

  try {
    // 🔥 Fetch project details
    const projectRes = await session.run(
      `
      MATCH (p:Project)
      WHERE id(p) = toInteger($projectId)

      OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
      OPTIONAL MATCH (u:User)-[:JOINED]->(p)

      RETURN p,
             collect(DISTINCT s.name) AS skills,
             collect(DISTINCT u.name) AS members
      `,
      { projectId }
    );

    const record = projectRes.records[0];
    const p = record.get("p").properties;

    const skills = (record.get("skills") || []).filter(Boolean);
    const members = (record.get("members") || []).filter(Boolean);

    // 🔥 Create post with full snapshot (MERGE to prevent double-submit)
    await session.run(
      `
      MATCH (u:User {email: $email})
      MATCH (proj:Project)
      WHERE id(proj) = toInteger($projectId)

      MERGE (post:Post {
        content: $content,
        owner: $email,
        title: $title
      })
      ON CREATE SET
        post.description = $description,
        post.skills = $skills,
        post.members = $members,
        post.createdAt = timestamp()

      MERGE (u)-[:POSTED]->(post)
      MERGE (post)-[:FROM_PROJECT]->(proj)
      `,
      {
        email,
        projectId,
        content,
        title: p.title,
        description: p.description,
        skills,
        members
      }
    );

    res.json({ message: "Post created" });

  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

exports.getFeed = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (u:User)-[:POSTED]->(post:Post)

      OPTIONAL MATCH (post)<-[:LIKED]-(l:User)
      OPTIONAL MATCH (post)<-[:ON]-(c:Comment)<-[:COMMENTED]-(cu:User)

      RETURN post,
            u.name AS user,
            count(DISTINCT l) AS likes,
            collect(DISTINCT {
              text: c.text,
              user: cu.name
            }) AS comments
      ORDER BY post.createdAt DESC
    `);

    const posts = result.records.map(r => {
      const p = r.get("post").properties;

      return {
        id: r.get("post").identity.toNumber(),
        content: p.content || "",
        title: p.title || "",
        description: p.description || "",
        skills: p.skills || [],
        members: p.members || [],
        createdAt: p.createdAt || Date.now(),
        user: r.get("user"),
        likes: r.get("likes").low || r.get("likes"),
        comments: r.get("comments")
          .filter(c => c.text) // remove null entries
      };
    });

    res.json(posts);

  } catch (err) {
    console.error("FEED ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

exports.toggleLike = async (req, res) => {
  const session = driver.session();
  const { email, postId } = req.body;

  try {
    // 🔥 Get post owner & project ID
    const ownerRes = await session.run(
      `
      MATCH (owner:User)-[:POSTED]->(p:Post)
      WHERE id(p) = toInteger($postId)
      OPTIONAL MATCH (p)-[:FROM_PROJECT]->(proj:Project)
      RETURN owner.email AS ownerEmail, id(proj) AS projId
      `,
      { postId }
    );

    const ownerEmail = ownerRes.records[0]?.get("ownerEmail");
    const projId = ownerRes.records[0]?.get("projId");

    // 🔥 Check if already liked
    const check = await session.run(
      `
      MATCH (u:User {email: $email})-[l:LIKED]->(p:Post)
      WHERE id(p) = toInteger($postId)
      RETURN l
      `,
      { email, postId }
    );

    if (check.records.length > 0) {
      // UNLIKE
      await session.run(
        `
        MATCH (u:User {email: $email})-[l:LIKED]->(p:Post)
        WHERE id(p) = toInteger($postId)
        DELETE l
        `,
        { email, postId }
      );

      return res.json({ message: "Unliked" });
    }

    // LIKE
    await session.run(
      `
      MATCH (u:User {email: $email})
      MATCH (p:Post)
      WHERE id(p) = toInteger($postId)
      MERGE (u)-[:LIKED]->(p)
      `,
      { email, postId }
    );

    // 🔥 NOTIFICATION (avoid self-like)
    if (ownerEmail && ownerEmail !== email) {
      await createNotification(
        session,
        ownerEmail,
        "Someone liked your post ❤️",
        { 
          type: "like", 
          projectId: projId ? (projId.toNumber ? projId.toNumber() : Number(projId)) : null,
          requesterEmail: email 
        }
      );
    }

    res.json({ message: "Liked" });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

exports.addComment = async (req, res) => {
  const session = driver.session();

  const { email, postId, text } = req.body;

  try {
    // 🔥 Get post owner & Project ID
    const ownerRes = await session.run(
      `
      MATCH (owner:User)-[:POSTED]->(p:Post)
      WHERE id(p) = toInteger($postId)
      OPTIONAL MATCH (p)-[:FROM_PROJECT]->(proj:Project)
      RETURN owner.email AS ownerEmail, id(proj) AS projId
      `,
      { postId }
    );

    const ownerEmail = ownerRes.records[0]?.get("ownerEmail");
    const projId = ownerRes.records[0]?.get("projId");

    // 🔥 Create comment (MERGE to prevent double-submit)
    await session.run(
      `
      MATCH (u:User {email: $email})
      MATCH (p:Post)
      WHERE id(p) = toInteger($postId)

      MERGE (c:Comment {
        text: $text,
        author: $email,
        postId: $postId
      })
      ON CREATE SET
        c.createdAt = timestamp()

      MERGE (u)-[:COMMENTED]->(c)
      MERGE (c)-[:ON]->(p)
      `,
      { email, postId, text }
    );

    // 🔥 NOTIFICATION (avoid self-comment)
    if (ownerEmail && ownerEmail !== email) {
      await createNotification(
        session,
        ownerEmail,
        "Someone commented on your post 💬",
        { 
          type: "comment", 
          projectId: projId ? (projId.toNumber ? projId.toNumber() : Number(projId)) : null,
          requesterEmail: email 
        }
      );
    }

    res.json({ message: "Comment added" });

  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

