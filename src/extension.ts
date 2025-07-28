import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

let watcher: fs.FSWatcher | null = null;
let lastFileSize = 0;
let lastNotificationTime = 0;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("laravelLogWatcher");
  let enabled = config.get<boolean>("enabled", true);
  let logPath = resolvePath(config.get<string>("logFilePath", ""));
  let defaultMessage = config.get<string>(
    "notificationMessage",
    "New Laravel log entry detected!"
  );

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.tooltip = "Laravel Log Watcher";
  statusBarItem.text = "$(check) Laravel Log";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const toggleCmd = vscode.commands.registerCommand(
    "laravelLogWatcher.toggle",
    () => {
      enabled = !enabled;
      vscode.workspace
        .getConfiguration()
        .update("laravelLogWatcher.enabled", enabled, true);
      if (enabled) {
        startWatcher(logPath, defaultMessage);
        vscode.window.showInformationMessage("Laravel Log Watcher Enabled");
      } else {
        stopWatcher();
        vscode.window.showWarningMessage("Laravel Log Watcher Disabled");
        statusBarItem.text = "$(circle-slash) Laravel Log";
      }
    }
  );

  context.subscriptions.push(toggleCmd);

  if (enabled) {
    startWatcher(logPath, defaultMessage);
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
        if (lines.length === 0) return;

        const filtered = lines.filter((line) =>
          /\[.*\]\s(local|production)\.(ERROR|WARNING|CRITICAL|INFO|DEBUG):/.test(
            line
          )
        );

        const lastLine = filtered.pop() || lines.pop()!;
        const logLevel = detectLogLevel(lastLine);

        updateStatusBar(logLevel);
        showNotification(lastLine, logLevel, defaultMessage);
      });

      stream.on("error", (err) => {
        console.error("Error reading log stream:", err);
      });
    }
  });
}

function detectLogLevel(line: string): string {
  if (line.includes(".ERROR")) return "ERROR";
  if (line.includes(".WARNING")) return "WARNING";
  if (line.includes(".CRITICAL")) return "CRITICAL";
  if (line.includes(".INFO")) return "INFO";
  if (line.includes(".DEBUG")) return "DEBUG";
  return "UNKNOWN";
}

function updateStatusBar(level: string) {
  switch (level) {
    case "ERROR":
    case "CRITICAL":
      statusBarItem.text = "$(error) Laravel Log: ERROR";
      statusBarItem.color = new vscode.ThemeColor("errorForeground");
      break;
    case "WARNING":
      statusBarItem.text = "$(alert) Laravel Log: WARNING";
      statusBarItem.color = new vscode.ThemeColor("terminal.ansiYellow");
      break;
    case "INFO":
      statusBarItem.text = "$(info) Laravel Log: INFO";
      statusBarItem.color = undefined;
      break;
    case "DEBUG":
      statusBarItem.text = "$(bug) Laravel Log: DEBUG";
      statusBarItem.color = undefined;
      break;
    default:
      statusBarItem.text = "$(question) Laravel Log: UNKNOWN";
      statusBarItem.color = undefined;
  }
}

function showNotification(content: string, level: string, fallback: string) {
  const now = Date.now();
  const cooldown = 5000; // 5 seconds

  if (now - lastNotificationTime < cooldown) return;
  lastNotificationTime = now;

  vscode.window.showInformationMessage(`[${level}] ${content}` || fallback);
}

function stopWatcher() {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}

export function deactivate() {
  stopWatcher();
  statusBarItem.dispose();
}
