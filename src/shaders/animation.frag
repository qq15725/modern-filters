float linear(float time, float offset, float change, float duration) {
  return change * (time / duration) + offset;
}

float normalizeTime(float time, float duration, bool loop, bool isOut) {
  if (loop) {
    time = mod(time, duration);
  } else {
    time = min(time, duration);
  }
  if (isOut) {
    time = duration - min(time, uDuration);
  }
  return time;
}
