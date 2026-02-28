"use client";

import { css } from "@styled/css";
import { DiResponsive, DiVisualstudio } from "react-icons/di";
import { GiShield, GiSittingDog } from "react-icons/gi";
import {
  SiEslint,
  SiFirebase,
  SiFramer,
  SiGit,
  SiGithub,
  SiGooglemaps,
  SiJest,
  SiMaterialdesign,
  SiNextdotjs,
  SiNodedotjs,
  SiPrettier,
  SiPwa,
  SiReact,
  SiServerless,
  SiSketch,
  SiStyledcomponents,
  SiSwr,
  SiTypescript,
  SiVercel,
  SiVitest,
  SiZod
} from "react-icons/si";

const heading = "PHORM Technology Stack";

const frontendTechs = [
  ["Next.js", "The React framework", <SiNextdotjs />],
  ["React", "For building UIs through components", <SiReact />],
  ["TypeScript", "This is the way...", <SiTypescript />],
  [
    "Material UI",
    "React component library that implements Google's Material Design",
    <SiMaterialdesign />,
  ],
  ["Framer Motion", "Complex animation capabilities for modern UIs", <SiFramer />],
  ["SWR", "React Hooks library for remote data fetching", <SiSwr />],
  [
    "Auth.js (next-auth)",
    "Complete open source authentication solution for Next.js",
    <GiShield />,
  ],
  ["React Icons", "Quickly implement vector icons", <SiSketch />],
  ["Google Maps", "Google Maps API for React", <SiGooglemaps />],
  ["Google Firebase", "Firebase API for React", <SiFirebase />],
  ["Zod", "Type-safe form validation", <SiZod />],
];

const backendTechs = [
  [
    "Node.js",
    "JavaScript runtime enabling server-side JS execution",
    <SiNodedotjs />,
  ],
];

const toolingTech = [
  ["ESLint", "Identifying and reporting on patterns in JavaScript", <SiEslint />],
  ["Jest", "Testing framework", <SiJest />],
  ["Vercel", "The command-line interface for Vercel", <SiVercel />],
  [
    "Husky",
    "Identifying and reporting on patterns in JavaScript",
    <GiSittingDog />,
  ],
  ["Visual Studio Code", "A code editor for web development", <DiVisualstudio />],
  [
    "Prettier",
    "An opinionated code formatter enforcing consistencies",
    <SiPrettier />,
  ],
];

const infrastructureTech = [
  [
    "Vercel",
    "Provides CDN networking, atomic deployments, & DNS management",
    <SiVercel />,
  ],
  ["Github", "Provides code hosting and version control", <SiGithub />],
];
const methodologiesTech = [
  [
    "Server-side Generation (SSG)",
    "HTML rendered on server for performance, then rendered in browser via javascript",
    <SiServerless />,
  ],
  ["PWA", "Progressive Web App (PWA) for offline support", <SiPwa />],
  [
    "Responsive Design",
    "Site adapts smoothly across all device sizes",
    <DiResponsive />,
  ],
  [
    "Modular Components",
    "Encourages reuse through standalone component building blocks",
    <SiStyledcomponents />,
  ],
  [
    "Test Driven Development (TDD)",
    "Testing is a key part of the development process",
    <SiVitest />,
  ],
  [
    "Git Workflow",
    "Following proven practices like branching, PRs, semantic versioning",
    <SiGit />,
  ],
];

export default function TechPage() {
  return (
    <div className={css({
      padding: "3em",
      display: "flex",
      flexDirection: "column",
      gap: "6",
    })}>
      <h1 className={css({ fontSize: "4xl", fontWeight: "bold", fontFamily: "heading" })}>
        {heading}
      </h1>
      <div className={css({ maxWidth: "3xl", padding: "3" })}>
        <p className={css({ fontSize: "lg", color: "text.muted" })}>
          This page outlines the technology stack, infrastructure, tooling and
          techniques used in implementing this website.
          <br />
        </p>
      </div>
      <div className={css({ display: "flex", flexDirection: "column", gap: "6" })}>
        <Section title="Frontend Technologies" techs={frontendTechs} />
        <Section title="Backend Technologies" techs={backendTechs} />
        <Section title="Infrastructure Technologies" techs={infrastructureTech} />
        <Section title="Tooling" techs={toolingTech} />
        <Section title="Methodologies" techs={methodologiesTech} />
      </div>
    </div>
  );
}

export function Section({
  title,
  techs,
}: {
  title: string;
  techs: (string | any)[][];
}) {
  return (
    <div className={css({
      backgroundColor: "brand.orangeLight",
      borderRadius: "xl",
      padding: "6",
      boxShadow: "sm",
    })}>
      <h2 className={css({ fontSize: "2xl", fontWeight: "bold", marginBottom: "4", color: "brand.orangeDark" })}>
        {title}
      </h2>
      <TechList techs={techs} />
    </div>
  );
}

export function TechList({ techs }: { techs: (string | any)[][] }) {
  return (
    <ul className={css({ listStyleType: "none", padding: "0", margin: "0", display: "flex", flexDirection: "column", gap: "2" })}>
      {techs.map((tech, i) => (
        <li key={i} className={css({ display: "flex", alignItems: "center", gap: "3" })}>
          <span className={css({ color: "brand.orangeDark", fontSize: "xl" })}>{tech[2]}</span>
          <span><strong className={css({ color: "brand.black", fontWeight: "600" })}>{tech[0]}</strong> - {tech[1]}</span>
        </li>
      ))}
    </ul>
  );
}
