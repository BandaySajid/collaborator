function showAlert(data, timer) {
    var alert = document.createElement("div");
    const alertType = data.status === 'error' ? 'danger' : 'success';
    alert.classList.add("alert", `alert-${alertType}`, "alert-dismissible", "fade", "show");
    alert.setAttribute("role", "alert");
    alert.innerHTML = `<strong>${data.description || data.error }</strong> `;
    document.querySelector("#alert-container").appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, timer);
}