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


async function createNotification(session, email, text) {
  await session.run(
    `
    MATCH (u:User {email: $email})
    CREATE (n:Notification {
      text: $text,
      createdAt: timestamp(),
      read: false
    })
    MERGE (u)-[:HAS_NOTIFICATION]->(n)
    `,
    { email, text }
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
      CREATE (p:Project {
        title: $title,
        description: $description,
        owner: $email,
        teamSize: $maxMembers
      })
      MERGE (u)-[:CREATED]->(p)
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
      RETURN p, collect(s.name) AS skills
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

      WITH proj, collect(sk.name) AS skills

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
    // Get project + members
    const result = await session.run(
      `
      MATCH (p:Project)
      WHERE id(p) = toInteger($projectId)

      OPTIONAL MATCH (u:User)-[:JOINED]->(p)

      RETURN p, collect(u) AS members
      `,
      { projectId }
    );

    const record = result.records[0];
    const project = record.get("p").properties;
    const members = record.get("members");

    const maxMembers = project.teamSize;
    const currentMembers = members.length;

    // 🔥 Check limit
    if (currentMembers >= maxMembers) {
      return res.status(400).json({ message: "Project is full" });
    }

    // Add user
    await session.run(
      `
      MATCH (u:User {email: $email})
      MATCH (p:Project)
      WHERE id(p) = toInteger($projectId)
      MERGE (u)-[:JOINED]->(p)
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
      `You joined "${projectTitle}"`
    );

    res.json({ message: "Joined project" });

  } catch (err) {
    console.error("JOIN ERROR:", err);
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
      RETURN p, collect(s.name) AS skills
      `,
      { email }
    );

    const joinedResult = await session.run(
      `
      MATCH (u:User {email: $email})-[:JOINED]->(p:Project)
      OPTIONAL MATCH (p)-[:REQUIRES]->(s:Skill)
      RETURN p, collect(s.name) AS skills
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
      WITH p, collect(s.name) AS skills
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
      `You were removed from "${projectTitle}"`
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
      `You left "${projectTitle}"`
    );

    res.json({ message: "Left project" });

  } catch (err) {
    console.error("LEAVE ERROR:", err);
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

      return {
        id: n.identity.toNumber(),   // 🔥 IMPORTANT
        text: n.properties.text,
        createdAt: n.properties.createdAt,
        read: n.properties.read
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

    // 🔥 Create post with full snapshot
    await session.run(
      `
      MATCH (u:User {email: $email})

      CREATE (post:Post {
        content: $content,
        title: $title,
        description: $description,
        skills: $skills,
        members: $members,
        createdAt: timestamp()
      })

      MERGE (u)-[:POSTED]->(post)
      `,
      {
        email,
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
    // 🔥 Get post owner
    const ownerRes = await session.run(
      `
      MATCH (owner:User)-[:POSTED]->(p:Post)
      WHERE id(p) = toInteger($postId)
      RETURN owner.email AS ownerEmail, owner.name AS ownerName
      `,
      { postId }
    );

    const ownerEmail = ownerRes.records[0]?.get("ownerEmail");

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
        "Someone liked your post ❤️"
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
    // 🔥 Get post owner
    const ownerRes = await session.run(
      `
      MATCH (owner:User)-[:POSTED]->(p:Post)
      WHERE id(p) = toInteger($postId)
      RETURN owner.email AS ownerEmail
      `,
      { postId }
    );

    const ownerEmail = ownerRes.records[0]?.get("ownerEmail");

    // 🔥 Create comment
    await session.run(
      `
      MATCH (u:User {email: $email})
      MATCH (p:Post)
      WHERE id(p) = toInteger($postId)

      CREATE (c:Comment {
        text: $text,
        createdAt: timestamp()
      })

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
        "Someone commented on your post 💬"
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

