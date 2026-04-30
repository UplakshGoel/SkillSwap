import ProjectCard from "./ProjectCard";

function Carousel({ allProjects }) {
  if (!allProjects || allProjects.length === 0) return null;

  // 🔥 duplicate enough times to fully fill loop
  const items = [
    ...allProjects,
    ...allProjects,
    ...allProjects,
    ...allProjects,
  ];

  return (
    <div className="overflow-hidden py-6">

      <div className="carousel">
        {items.map((p, i) => (
          <div
            key={i}
            className="min-w-[300px] max-w-[300px] flex-shrink-0 transition-transform duration-300 hover:scale-[1.03]"
          >
            <ProjectCard project={p} />
          </div>
        ))}
      </div>

    </div>
  );
}

export default Carousel;