export function initNotifications() {
    console.log("[Notifications] Initialized");
}

export function showSuccess(message) {
    console.log(message);
}

export function showWarning(message) {
    console.warn(message);
}

export function showError(message) {
    console.error(message);
}

export function showInfo(message) {
    console.info(message);
}
