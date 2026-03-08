const dynamic = async () => {
  const pluginName = process.argv[2];
  const pluginPath = new URL(`./plugins/${pluginName}.js`, import.meta.url);

  const plugin = await import(pluginPath).catch(() => {
    console.log('Plugin not found');
    process.exit(1);
  });

  console.log(plugin.run());
};

await dynamic();
