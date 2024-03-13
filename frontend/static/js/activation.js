document
  .querySelector(".activationForm")
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
      .post("/accounts/activateaccount", userData)
      .then((response) => {
        console.log(response)
        console.log(response.data);
        if (response.status == 200) {
          window.location.href = "/accounts/signin"
        } else {
          document.querySelector(".activationForm").reset()
          let type = 'error';
          let icon = 'fa-solid fa-circle-exclamation';
          let title = 'Error';
          let text = response.data.message;
          createToast(type, icon, title, text, 5000);
        }
      })
      .catch((error) => {
        // Handle error
        // console.error("Error:", error.response.data);
        document.querySelector(".activationForm").reset()
        let type = 'error';
        let icon = 'fa-solid fa-circle-exclamation';
        let title = 'Error';
        let text = error.response.data.message;
        createToast(type, icon, title, text, 5000);
      });
  });