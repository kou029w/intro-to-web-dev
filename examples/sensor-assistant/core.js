export const MIN_INTERVAL = 100;
export const MAX_INTERVAL = 1000;
export const WINDOW_MS = 3000;

export function summarize(samples, now, interval) {
  const recent = samples.filter((s) => now - s.receivedAt <= WINDOW_MS);
  if (recent.length < 3 || now - recent.at(-1).receivedAt > 1500) {
    throw new Error("センサー値が不足しているか、受信が止まっています。");
  }
  const values = recent.map((s) => Math.hypot(...s.accel));
  const average = values.reduce((sum, n) => sum + n, 0) / values.length;
  const deviation = Math.sqrt(
    values.reduce((sum, n) => sum + (n - average) ** 2, 0) / values.length,
  );
  return {
    count: recent.length,
    durationMs: recent.at(-1).receivedAt - recent[0].receivedAt,
    deviationG: deviation,
    shake: deviation >= 0.1 ? "大きな揺れ" : deviation >= 0.02 ? "小さな揺れ" : "静止",
    battery: recent.at(-1).battery,
    intervalMs: interval,
  };
}

export function intervalCommand(value) {
  if (!Number.isInteger(value) || value < MIN_INTERVAL || value > MAX_INTERVAL) {
    throw new Error("計測間隔は100〜1000ミリ秒の整数で指定してください。");
  }
  return `sensor ${value}`;
}

export function servoCommand(value) {
  if (!Number.isInteger(value) || value < 0 || value > 180) {
    throw new Error("角度は0〜180度の整数で指定してください。");
  }
  return `servo 0 ${value}`;
}

export function shouldWarn(summary, result, armed, latched) {
  return armed && !latched && summary.durationMs >= 2000 &&
    summary.deviationG >= 0.1 && result.level === "alert";
}
