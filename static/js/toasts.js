let notifications = document.querySelector(".notifications");

function createToast(
  type,
  icon,
  title,
  text,
  timeout,
  redirectStatus,
  redirectUrl
) {
  let newToast = document.createElement("div");
  newToast.innerHTML = `
        <div class="toast ${type}">
            <i class="${icon}"></i>
            <div class="content">
                <div class="title">${title}</div>
                <span>${text}</span>
            </div>
            <i class="fa-solid fa-xmark" onclick="(this.parentElement).remove()"></i>
        </div>`;
  notifications.appendChild(newToast);

  if (redirectStatus == true) {
    newToast.timeOut = setTimeout(() => {
      newToast.remove();
      window.location.href = redirectUrl;
    }, timeout);
  } else {
    newToast.timeOut = setTimeout(() => newToast.remove(), timeout);
  }
}
