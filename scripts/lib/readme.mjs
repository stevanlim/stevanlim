import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export const ACTIVITY_START = "<!-- AUTO:ACTIVITY:START -->";
export const ACTIVITY_END = "<!-- AUTO:ACTIVITY:END -->";

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function badgeSegment(value) {
  return encodeURIComponent(String(value).replaceAll("-", "--").replaceAll("_", "__").replaceAll(" ", "_"));
}

function renderLinks(links) {
  return links.map((link) => {
    const logo = link.logo ? `&logo=${encodeURIComponent(link.logo)}&logoColor=white` : "";
    const image = `https://img.shields.io/badge/${badgeSegment(link.label)}-${badgeSegment(link.value)}-${link.color}?style=for-the-badge${logo}`;
    return `  <a href="${link.url}"><img alt="${link.label}" src="${image}"></a>`;
  }).join("\n");
}

function renderFocus(focus) {
  return [
    "| Area | What I am exploring |",
    "| --- | --- |",
    ...focus.map((item) => `| **${escapeCell(item.name)}** | ${escapeCell(item.description)} |`)
  ].join("\n");
}

function renderProjects(projects) {
  return [
    "| Project | Focus | Why it matters |",
    "| --- | --- | --- |",
    ...projects.map((project) => {
      const homepage = project.homepage ? ` [Live](${project.homepage})` : "";
      return `| [**${escapeCell(project.name)}**](${project.url}) | ${escapeCell(project.focus)} | ${escapeCell(project.summary)}${homepage} |`;
    })
  ].join("\n");
}

const TECH_ICONS = {
  "sveltekit": { logo: "svelte", color: "FF3E00" },
  "nativescript": { logo: "nativescript", color: "3A539B" },
  "laravel": { logo: "laravel", color: "FF2D20" },
  "nextjs": { logo: "nextdotjs", color: "000000" },
  "reactjs": { logo: "react", color: "61DAFB" },
  "react": { logo: "react", color: "61DAFB" },
  "androidstudio": { logo: "androidstudio", color: "3DDC84" },
  "html5": { logo: "html5", color: "E34F26" },
  "css3": { logo: "css3", color: "1572B6" },
  "bootstrap": { logo: "bootstrap", color: "7952B3" },
  "tailwindcss": { logo: "tailwindcss", color: "06B6D4" },
  "javascript": { logo: "javascript", color: "F7DF1E" },
  "typescript": { logo: "typescript", color: "3178C6" },
  "vite": { logo: "vite", color: "646CFF" },
  "astrojs": { logo: "astro", color: "BC52EE" },
  "astro": { logo: "astro", color: "BC52EE" },
  "angular": { logo: "angular", color: "DD0031" },
  "redux": { logo: "redux", color: "764ABC" },
  "framermotion": { logo: "framer", color: "0055FF" },
  "shadcnui": { logo: "shadcnui", color: "000000" },
  "nextauthjs": { logo: "nextdotjs", color: "000000" },
  "tanstack": { logo: "reactquery", color: "FF4154" },
  "axios": { logo: "axios", color: "5A29E4" },
  "zod": { logo: "zod", color: "3E67B1" },
  "nodejs": { logo: "nodedotjs", color: "339933" },
  "expressjs": { logo: "express", color: "000000" },
  "express": { logo: "express", color: "000000" },
  "php": { logo: "php", color: "777BB4" },
  "django": { logo: "django", color: "092E20" },
  "prisma": { logo: "prisma", color: "2D3748" },
  "reactnative": { logo: "react", color: "61DAFB" },
  "kotlin": { logo: "kotlin", color: "7F52FF" },
  "jetpackcompose": { logo: "jetpackcompose", color: "4285F4" },
  "postgresql": { logo: "postgresql", color: "4169E1" },
  "mysql": { logo: "mysql", color: "4479A1" },
  "firebase": { logo: "firebase", color: "FFCA28" },
  "supabase": { logo: "supabase", color: "3ECF8E" },
  "docker": { logo: "docker", color: "2496ED" },
  "npm": { logo: "npm", color: "CB3837" },
  "yarn": { logo: "yarn", color: "2C8EBB" },
  "bun": { logo: "bun", color: "F9F1E7" },
  "github": { logo: "github", color: "181717" },
  "figma": { logo: "figma", color: "F24E1E" },
  "figmauiux": { logo: "figma", color: "F24E1E" }
};

function renderTechStack(techStack) {
  return techStack.map((item) => {
    const normalized = item.toLowerCase().replace(/[\s\.\-\(\)\/]/g, "");
    const info = TECH_ICONS[normalized] || { logo: "", color: "4F5D75" };
    const logoParam = info.logo ? `&logo=${encodeURIComponent(info.logo)}&logoColor=white` : "";
    const badgeName = badgeSegment(item);
    return `<img src="https://img.shields.io/badge/${badgeName}-${info.color}?style=flat-square${logoParam}" alt="${item}">`;
  }).join(" ");
}

function extractActivity(readme) {
  const startIndex = readme.indexOf(ACTIVITY_START);
  const endIndex = readme.indexOf(ACTIVITY_END);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return null;
  return readme.slice(startIndex + ACTIVITY_START.length, endIndex).trim();
}

async function readExistingActivity(readmePath) {
  try {
    const existing = await readFile(readmePath, "utf8");
    return extractActivity(existing);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function generateProfileReadme({ config, manifest, readmePath }) {
  const existingActivity = await readExistingActivity(readmePath);
  const activity = existingActivity || "_Recent public activity will appear here after the workflow runs._";
  const activitySection = config.activity.enabled
    ? `\n## Recent Activity\n\n${ACTIVITY_START}\n${activity}\n${ACTIVITY_END}\n`
    : "";
  const techStack = renderTechStack(config.techStack);
  const about = config.profile.about.join("\n\n");

  const readme = `<!-- Generated by GitHub Profile Agent Console. Edit profile.config.json, then run npm run generate. -->
<p align="center">
  <picture>
    <source media="(max-width: 760px) and (prefers-color-scheme: dark)" srcset="./assets/hero/${manifest.assets.mobileDark}">
    <source media="(max-width: 760px)" srcset="./assets/hero/${manifest.assets.mobileLight}">
    <source media="(prefers-color-scheme: dark)" srcset="./assets/hero/${manifest.assets.desktopDark}">
    <source media="(prefers-color-scheme: light)" srcset="./assets/hero/${manifest.assets.desktopLight}">
    <img src="./assets/hero/${manifest.assets.desktopDark}" alt="${config.profile.name} - ${config.profile.headline}" width="100%">
  </picture>
</p>

<p align="center">
${renderLinks(config.links)}
</p>

## About Me

${about}

## Current Focus

${renderFocus(config.focus)}

## Featured Work

${renderProjects(config.projects)}

## Research Direction

${config.research.narrative}

## Tech Stack

${techStack}
${activitySection}
---

<p align="center">
  ${config.footer}
</p>
`;

  await writeFile(resolve(readmePath), readme);
  return readme;
}
