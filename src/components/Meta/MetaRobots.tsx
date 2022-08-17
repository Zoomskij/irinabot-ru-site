import { useEffect } from "react";


interface MetaRobotsProps {
  robot?: string;
  noIndex?: boolean;
  noFlow?: boolean;
}

function MetaRobots({robot, noIndex, noFlow}: MetaRobotsProps) {
  useEffect(() => {
    const descriptionTag = document.createElement("meta");
    descriptionTag.setAttribute(robot || "robots", `${noIndex ? "noindex" : ""}, ${noFlow ? "nofollow" : ""}`);

    document.head.appendChild(descriptionTag);

    return () => {
      document.head.removeChild(descriptionTag);
    };
  }, [robot, noIndex, noFlow]);

  return null;
}

export default MetaRobots;
