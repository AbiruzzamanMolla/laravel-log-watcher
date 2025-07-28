import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

let watcher: fs.FSWatcher | null = null;
let lastFileSize = 0;

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("laravelLogWatcher");
  let enabled = config.get<boolean>("enabled", true);
  let logPath = resolvePath(config.get<string>("logFilePath", ""));
  let message = config.get<string>(
    "notificationMessage",
    "New Laravel log entry detected!"
  );

  const toggleCmd = vscode.commands.registerCommand(
    "laravelLogWatcher.toggle",
    () => {
      enabled = !enabled;
      vscode.workspace
        .getConfiguration()
        .update("laravelLogWatcher.enabled", enabled, true);
      if (enabled) {
        startWatcher(logPath, message);
        vscode.window.showInformationMessage("Laravel Log Watcher Enabled");
      } else {
        stopWatcher();
        vscode.window.showWarningMessage("Laravel Log Watcher Disabled");
      }
    }
  );

  context.subscriptions.push(toggleCmd);

  if (enabled) {
    startWatcher(logPath, message);
  }
}

function resolvePath(configPath: string): string {
  if (path.isAbsolute(configPath)) return configPath;
  const workspaceFolder =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
  return path.join(workspaceFolder, configPath);
}

function startWatcher(filePath: string, defaultMessage: string) {
  if (!fs.existsSync(filePath)) {
    vscode.window.showWarningMessage(`Log file not found: ${filePath}`);
    return;
  }

  stopWatcher();

  lastFileSize = fs.statSync(filePath).size;

  watcher = fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      const currentSize = fs.statSync(filePath).size;

      if (currentSize < lastFileSize) {
        // Log file rotated or truncated
        lastFileSize = 0;
      }

      const stream = fs.createReadStream(filePath, {
        start: lastFileSize,
        end: currentSize,
        encoding: "utf8",
      });

      let buffer = "";

      stream.on("data", (chunk) => {
        buffer += chunk;
      });

      stream.on("end", () => {
        lastFileSize = currentSize;

        const lines = buffer.trim().split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) {
          vscode.window.showInformationMessage(defaultMessage);
          return;
        }

        // Optional: Filter specific levels
        const filtered = lines.filter((line) =>
          /\[.*\]\s(local|production)\.(ERROR|WARNING|CRITICAL|INFO|DEBUG):/.test(
            line
          )
        );

        const lastLine = filtered.pop() || lines.pop() || defaultMessage;

        vscode.window.showInformationMessage(lastLine);
      });

      stream.on("error", (err) => {
        console.error("Error reading log stream:", err);
      });
    }
  });
}

function stopWatcher() {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}

export function deactivate() {
  stopWatcher();
}
