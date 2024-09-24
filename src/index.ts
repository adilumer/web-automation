import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get all subdirectories
function getSubdirectories(source: string): string[] {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

// Function to present choices and get user input
async function getUserChoice(choices: string[]): Promise<string> {
  console.log("Please choose a project to run:");
  choices.forEach((choice, index) => {
    console.log(`${index + 1}. ${choice}`);
  });

  return new Promise((resolve) => {
    rl.question('Enter the number of your choice: ', (answer) => {
      const choiceIndex = parseInt(answer) - 1;
      if (choiceIndex >= 0 && choiceIndex < choices.length) {
        resolve(choices[choiceIndex]);
      } else {
        console.log('Invalid choice. Please try again.');
        resolve(getUserChoice(choices));
      }
    });
  });
}

// Main function
async function main() {
  const projectsDir = path.join(__dirname, 'projects');
  const choices = getSubdirectories(projectsDir);

  if (choices.length === 0) {
    console.log('No projects found. Please add some projects to the "projects" directory.');
    rl.close();
    return;
  }

  const choice = await getUserChoice(choices);
  console.log(`You selected: ${choice}`);

  // Import and run the main function from the selected project
  try {
    const projectModule = await import(path.join(projectsDir, choice, 'index'));
    if (typeof projectModule.main === 'function') {
      await projectModule.main();
    } else {
      console.log(`Error: main function not found in ${choice}/index.ts`);
    }
  } catch (error) {
    console.error(`Error running project ${choice}:`, error);
  }

  rl.close();
}

main().catch(console.error);
