import { Box, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { purple, red } from "@mui/material/colors";
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
  const bg_fg_color = "red";
  const urlEncodedColor = encodeURIComponent(bg_fg_color);
  const patternOpacity = 0.2;

  return (
    <Stack
      style={{
        padding: "3em",
        // backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='199' viewBox='0 0 100 199'%3E%3Cg fill='${urlEncodedColor}' fill-opacity='${patternOpacity}'%3E%3Cpath d='M0 199V0h1v1.99L100 199h-1.12L1 4.22V199H0zM100 2h-.12l-1-2H100v2z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      <Typography variant="h1">{heading} </Typography>
      <Box maxWidth="3xl" p={3}>
        <Typography variant="body1">
          This page outlines the technology stack, infrastructure, tooling and
          techniques used in implementing this website.
          <br />
        </Typography>
      </Box>
      <Stack spacing={6}>
        <Section title="Frontend Technologies" techs={frontendTechs} />
        <Section title="Backend Technologies" techs={backendTechs} />
        <Section
          title="Infrastructure Technologies"
          techs={infrastructureTech}
        />
        <Section title="Tooling" techs={toolingTech} />
        <Section title="Methodologies" techs={methodologiesTech} />
      </Stack>
    </Stack>
  );
}

export function Section({
  title,
  techs,
}: {
  title: string;
  techs: (string | any)[][];
}) {
  const color_purple = purple
  const color_red = red
  const bg_color = purple[50];
  const bg_fg_color = purple[200];
  const urlEncodedColor = encodeURIComponent(bg_fg_color);
  const patternOpacity = 0.2;

  return (
    <Card
      // width="full"
      // padding={8}
      // boxShadow={"md"}
      // backgroundPosition={"-1.5em 2.5em"}
      // borderRadius={2}
      color={bg_color}
      style={
        {
          // backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='199' viewBox='0 0 100 199'%3E%3Cg fill='${urlEncodedColor}' fill-opacity='${patternOpacity}'%3E%3Cpath d='M0 199V0h1v1.99L100 199h-1.12L1 4.22V199H0zM100 2h-.12l-1-2H100v2z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E")`,
        }
      }
    >
      <CardContent>

      <Typography variant="h4" >{title}</Typography>
      <TechList techs={techs} />
      </CardContent>
    </Card>
  );
}

export function TechList({ techs }: { techs: ( string | any)[][] }) {
  return (
    <List>
      {techs.map((tech, i) => (
        <ListItem key={i}>
          <ListItemIcon>{tech[2]} </ListItemIcon>
          <ListItemText><strong>{tech[0]}</strong> - {tech[1]}</ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
