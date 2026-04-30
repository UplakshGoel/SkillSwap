const neo4j = require("neo4j-driver");

// 🔹 Replace password if needed
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Test connection (optional but useful)
(async () => {
  const session = driver.session();
  try {
    await session.run("RETURN 1");
    console.log("✅ Connected to Neo4j Cloud");
  } catch (error) {
    console.error("❌ Neo4j connection failed:", error);
  } finally {
    await session.close();
  }
})();

module.exports = driver;