const args = process.argv.slice(2);

const getArg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? (args[index + 1] ?? fallback) : fallback;
};

const toNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const hexToAnsi = (hex) => {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return null;

  const [r, g, b] = match[1]
    .match(/../g)
    .map((part) => Number.parseInt(part, 16));

  return `\x1b[38;2;${r};${g};${b}m`;
};

const renderBar = ({ percent, length, colorCode, resetCode }) => {
  const filledLength = Math.round((percent / 100) * length);
  const emptyLength = length - filledLength;

  const filledBar = "█".repeat(filledLength);
  const emptyBar = " ".repeat(emptyLength);

  const visibleFilledBar = colorCode
    ? `${colorCode}${filledBar}${resetCode}`
    : filledBar;

  return `[${visibleFilledBar}${emptyBar}] ${percent}%`;
};

const progress = () => {
  const duration = toNumber(getArg("duration", "5000"), 5000);
  const interval = toNumber(getArg("interval", "100"), 100);
  const length = toNumber(getArg("length", "30"), 30);
  const colorCode = hexToAnsi(getArg("color", ""));

  const resetCode = "\x1b[0m";
  const steps = Math.ceil(duration / interval);
  const startedAt = Date.now();

  const timer = setInterval(() => {
    const elapsed = Date.now() - startedAt;
    const step = Math.round(elapsed / interval);
    const percent = Math.min(Math.round((step / steps) * 100), 100);

    process.stdout.write(
      `\r${renderBar({ percent, length, colorCode, resetCode })}`,
    );

    if (percent >= 100) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
