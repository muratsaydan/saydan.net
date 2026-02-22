import { exec } from "child_process";

let syncing = false;

export async function gitAutoSync(
  paths: string[],
  message: string
): Promise<void> {
  if (syncing) return;
  syncing = true;

  try {
    const cwd = process.cwd();
    const addPaths = paths.map((p) => `"${p}"`).join(" ");
    const cmd = `git add ${addPaths} && git commit -m "${message.replace(/"/g, '\\"')}" && git push`;

    await new Promise<void>((resolve, reject) => {
      exec(cmd, { cwd, timeout: 30_000 }, (err, _stdout, stderr) => {
        if (err) {
          if (stderr?.includes("nothing to commit")) {
            resolve();
          } else {
            console.error("[gitSync] error:", stderr || err.message);
            reject(err);
          }
        } else {
          resolve();
        }
      });
    });
  } catch (e) {
    console.error("[gitSync] failed (non-blocking):", e);
  } finally {
    syncing = false;
  }
}
