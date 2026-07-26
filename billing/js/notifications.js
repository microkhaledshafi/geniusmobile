/* ==========================================================
   Genius Scientific ERP
   notifications.js
   Part 1
========================================================== */

let initialized = false;

/* ==========================================================
   Initialize
========================================================== */

export function initializeNotifications() {

    if (initialized)
        return;

    initialized = true;

    console.log(

        "[Notifications] Initialized"

    );

}

/* ==========================================================
   Success
========================================================== */

export function showSuccess(message) {

    showNotification(

        message,

        "success"

    );

}

/* ==========================================================
   Error
========================================================== */

export function showError(message) {

    showNotification(

        message,

        "danger"

    );

}

/* ==========================================================
   Warning
========================================================== */

export function showWarning(message) {

    showNotification(

        message,

        "warning"

    );

}

/* ==========================================================
   Info
========================================================== */

export function showInfo(message) {

    showNotification(

        message,

        "info"

    );

}

/* ==========================================================
   Show Notification
========================================================== */

function showNotification(
    message,
    type = "info"
) {

    let container = document.getElementById(

        "notificationContainer"

    );

    if (!container) {

        container = document.createElement("div");

        container.id = "notificationContainer";

        container.className =
            "position-fixed top-0 end-0 p-3";

        container.style.zIndex = "1080";

        document.body.appendChild(container);

    }

    const notification = document.createElement("div");

    notification.className =

        `alert alert-${type} alert-dismissible fade show`;

    notification.setAttribute(

        "role",

        "alert"

    );

    notification.innerHTML = `

        ${message}

        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close">

        </button>

    `;

    container.appendChild(notification);

    setTimeout(() => {

        notification.classList.remove("show");

        notification.classList.add("hide");

        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 3000);

}

/* ==========================================================
   Clear Notifications
========================================================== */

export function clearNotifications() {

    const container = document.getElementById(

        "notificationContainer"

    );

    if (!container)
        return;

    container.innerHTML = "";

}

/* ==========================================================
   Destroy Notifications
========================================================== */

export function destroyNotifications() {

    clearNotifications();

    initialized = false;

}

/* ==========================================================
   Notifications Status
========================================================== */

export function isNotificationsInitialized() {

    return initialized;

}

/* ==========================================================
   Default Export
========================================================== */

export default {

    initializeNotifications,

    showSuccess,

    showError,

    showWarning,

    showInfo,

    clearNotifications,

    destroyNotifications,

    isNotificationsInitialized

};
