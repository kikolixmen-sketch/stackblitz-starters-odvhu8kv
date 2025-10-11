export const playSound = (path: string, volume = 0.6) => {
  const a = new Audio(path);
  a.volume = volume;
  a.play().catch(() => {});
};

export const sfx = {
  click: () => playSound("/sounds/click.mp3", 0.25),
  success: () => playSound("/sounds/success.mp3", 0.35),
  startup: () => playSound("/sounds/startup.mp3", 0.4),
};
