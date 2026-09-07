import { Build } from "../types";

export function parseBuilds(text: string): Build[] {
  const builds: Build[] = [];

  const regex = /\[BUILD\]([\s\S]*?)\[\/BUILD\]/g;

  let match;

  while ((match = regex.exec(text)) !== null) {
    const buildText = match[1];

    const build: Build = {};

    buildText
      .trim()
      .split("\n")
      .forEach((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex === -1) return;

        const key = line.slice(0, separatorIndex).trim();

        const value = line.slice(separatorIndex + 1).trim();

        if (key === "Name") {
          build.Name = value;
        }

        if (key === "Use Case") {
          build["Use Case"] = value;
        }

        if (key === "CPU") {
          build.CPU = value;
        }

        if (key === "GPU") {
          build.GPU = value;
        }

        if (key === "Motherboard") {
          build.Motherboard = value;
        }

        if (key === "RAM") {
          build.RAM = value;
        }

        if (key === "Storage") {
          build.Storage = value;
        }

        if (key === "PSU") {
          build.PSU = value;
        }

        if (key === "Cooler") {
          build.Cooler = value;
        }

        if (key === "Case") {
          build.Case = value;
        }

        if (key === "Estimated Total") {
          build["Estimated Total"] = value;
        }
      });

    builds.push(build);
  }

  return builds;
}

export function removeBuildSections(text: string): string {
  return text
    .replace(/\[BUILD\][\s\S]*?\[\/BUILD\]/g, "")
    .trim();
}