const neo4j = require("neo4j-driver");

// 🔹 Replace password if needed
const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "skill123@.com")
);

// Test connection (optional but useful)
(async () => {
  const session = driver.session();
  try {
    await session.run("RETURN 1");
    console.log("✅ Connected to Neo4j");
  } catch (error) {
    console.error("❌ Neo4j connection failed:", error);
  } finally {
    await session.close();
  }
})();

module.exports = driver;