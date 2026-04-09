async function main() {
  const { Client } = await import("ssh2");

  const host = process.env.DEPLOY_HOST;
  const username = process.env.DEPLOY_USER;
  const password = process.env.DEPLOY_PASSWORD;

  if (!host || !username || !password) {
    throw new Error("DEPLOY_HOST, DEPLOY_USER, and DEPLOY_PASSWORD must be set.");
  }

  const conn = new Client();
  console.log("Connecting to VPS...");

  conn
    .on("ready", () => {
      console.log("Successfully connected to the server!");

      conn.shell((err, stream) => {
        if (err) throw err;

        stream
          .on("close", () => {
            console.log("Deployment session finished.");
            conn.end();
          })
          .on("data", (data) => {
            process.stdout.write(data.toString());
            if (data.toString().includes("pm2 startup")) {
              setTimeout(() => stream.close(), 1000);
            }
          });

        console.log("Executing deployment commands...");

        stream.write(`
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \\
      sudo apt-get install -y nodejs git && \\
      sudo npm i -g pm2 && \\
      rm -rf fish_ios && \\
      git clone https://github.com/jonleontart-collab/fish_ios.git && \\
      cd fish_ios && \\
      npm install && \\
      echo 'DATABASE_URL="file:./dev.db"' > .env && \\
      npx prisma generate && \\
      npm run build && \\
      pm2 start npm --name "fish_ios" -- run start && \\
      pm2 save && \\
      pm2 startup && \\
      echo "DEPLOYMENT_COMPLETE"
    \n`);
      });
    })
    .on("error", (err) => {
      console.error("Connection error:", err.message);
    })
    .connect({
      host,
      port: 22,
      username,
      password,
      readyTimeout: 20000,
    });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
