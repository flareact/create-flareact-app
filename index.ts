#!/usr/bin/env node
import packageJson from "./package.json";
import Commander from "commander";
import chalk from "chalk";
import prompts from "prompts";
import path from "path";
import { validateNpmName } from "./helpers/validate-pkg";

let projectPath: string = "";

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${chalk.green("<project-directory>")} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option(
    "-e, --example [name]|[github-url]",
    `

  An example to bootstrap the app with. You can use an example name
  from the official Flareact repo or a GitHub URL. The URL can use
  any branch and/or subdirectory
`
  )
  .allowUnknownOption()
  .parse(process.argv);

async function run(): Promise<void> {
  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems![0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log();
    console.log("Please specify the project directory:");
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`);
    console.log();
    console.log("For example:");
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green("my-flareact-app")}`);
    console.log();
    console.log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);
  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(`"${projectName}"`)} because of npm naming restrictions:`
    );

    problems!.forEach((p) => console.error(`    ${chalk.red.bold("*")} ${p}`));
    process.exit(1);
  }

  if (program.example === true) {
    console.error("Please provide an example name or url, otherwise remove the example option.");
    process.exit(1);
    return;
  }

  const example = typeof program.example === "string" && program.example.trim();

  console.log(`TODO: Create Flareact app called ${projectName}...`);
}

run()
  .then(() => {
    console.log("done");
  })
  .catch(async (reason) => {
    console.log();
    console.log("Aborting installation.");
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`);
    } else {
      console.log(chalk.red("Unexpected error. Please report it as a bug:"));
      console.log(reason);
    }
    console.log();

    process.exit(1);
  });
