// JavaScript code to extract token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
document.getElementById('token').value = token;

document
  .querySelector(".resetpasswordform")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    const formData = new FormData(this);

    // Convert form data to JSON object
    const userData = {};
    formData.forEach((value, key) => {
      userData[key] = value;
    });

    // Send POST request to the server using Axios
    axios
      .post("/accounts/reset-password", userData)
      .then((response) => {
        console.log(response.data);
        // Handle successful response
        let type = 'success';
        let icon = 'fa-solid fa-circle-exclamation';
        let title = 'Success';
        let text = `Password was successfully resetted. Redirecting you to the sign in page.`;
        const noti = createToast(type, icon, title, text, 2000, true, "/accounts/signin");
        // window.location.href = "/accounts/signin"
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error.response.data);
        document.querySelector(".resetpasswordform").reset()
        let type = 'error';
        let icon = 'fa-solid fa-circle-exclamation';
        let title = 'Error';
        let text = error.response.data.message;
        createToast(type, icon, title, text, 5000);
      });
  });