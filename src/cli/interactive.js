import { createInterface } from "node:readline";

const interactive = () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const commands = {
    uptime: () => console.log(`Uptime: ${process.uptime().toFixed(2)}s`),
    cwd: () => console.log(process.cwd()),
    date: () => console.log(new Date().toISOString()),
    exit: () => {
      console.log("Goodbye!");
      process.exit(0);
    },
  };

  const prompt = () => rl.question("> ", handleCommand);

  const handleCommand = (input) => {
    const command = input.trim();
    const handler = commands[command];

    if (handler) {
      handler();
    } else {
      console.log("Unknown command");
    }

    prompt();
  };

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });

  prompt();
};

interactive();
