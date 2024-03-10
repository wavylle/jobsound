document
  .querySelector(".forgotpasswordform")
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
      .post("/accounts/forgot-password", userData)
      .then((response) => {
        console.log(response.data);
        // Handle successful response
        let type = 'success';
        let icon = 'fa-solid fa-circle-exclamation';
        let title = 'Success';
        let text = "Reset password email sent successfully";
        createToast(type, icon, title, text, 5000);
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error.response.data);
        document.querySelector(".forgotpasswordform").reset()
        let type = 'error';
        let icon = 'fa-solid fa-circle-exclamation';
        let title = 'Error';
        let text = error.response.data.message;
        createToast(type, icon, title, text, 5000);
      });
  });