console.log('functions.js loaded successfully!');

window.handleAlerts = (type,msg) => {
    alertBox.innerHTML = ` 
        <div class="alert alert-${type}" role="alert">
            ${msg}
        </div>
    `
}