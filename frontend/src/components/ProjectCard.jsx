import { useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

function ProjectCard({ project }) {
  const navigate = useNavigate();

  if (!project) return null;

  return (
    <div className="group relative">

      {/* Gradient Border Glow */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 blur transition duration-500" />

      {/* Card */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-indigo-500/20">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-white leading-snug group-hover:text-indigo-300 transition">
            {project.title}
          </h3>

          <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/20 text-gray-300">
            Team Size {project.teamSize}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/10 mb-4" />

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-5 min-h-[32px]">
          {project.skills?.length > 0 ? (
            project.skills.map((skill, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1 text-xs rounded-full text-gray-200 transition-all duration-200 hover:bg-indigo-500/20 hover:border-indigo-400/40 hover:scale-[1.05]"
              >
                <SparklesIcon className="w-3 h-3 text-indigo-300" />
                {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-xs italic">
              No skills listed
            </span>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate(`/project/${project.id}`)}
          className="relative flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
        >
          {/* Shine Effect */}
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-300" />

          <span className="relative z-10 flex items-center gap-2">
            View Project
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>

      </div>
    </div>
  );
}

export default ProjectCard;