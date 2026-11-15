const CHANNEL_NAME = "new-dormitory-students";
const EVENT_TYPE = "students-changed";

export function notifyStudentChanged() {
  if (typeof BroadcastChannel === "undefined") return;

  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.postMessage({
    type: EVENT_TYPE,
  });

  channel.close();
}

export function subscribeToStudentChanges(onChange) {
  let timer = null;

  const scheduleRefresh = () => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      onChange();
    }, 150);
  };

  const refreshWhenVisible = () => {
    if (document.visibilityState === "visible") {
      scheduleRefresh();
    }
  };

  const channel =
    typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(CHANNEL_NAME);

  if (channel) {
    channel.onmessage = (event) => {
      if (event.data?.type === EVENT_TYPE) {
        scheduleRefresh();
      }
    };
  }

  window.addEventListener("focus", refreshWhenVisible);
  document.addEventListener("visibilitychange", refreshWhenVisible);

  return () => {
    clearTimeout(timer);

    window.removeEventListener("focus", refreshWhenVisible);
    document.removeEventListener("visibilitychange", refreshWhenVisible);

    channel?.close();
  };
}
