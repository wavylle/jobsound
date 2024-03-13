document
  .querySelector(".signinform")
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
      .post("/accounts/signin", userData)
      .then((response) => {
        console.log(response)
        // console.log(response.data);
        if (response.data === true) {
          console.log("True")
          window.location.href = "/panel/home"
        } else {
          document.querySelector(".signinform").reset()
          let type = 'error';
          let icon = 'fa-solid fa-circle-exclamation';
          let title = 'Error';
          let text = "Invalid email or password";
          createToast(type, icon, title, text, 5000);
        }
        // history.push("/accounts/protected")
        // Handle successful response
        // let type = 'success';
        // let icon = 'fa-solid fa-circle-exclamation';
        // let title = 'Success';
        // let text = "Successfully logged in";
        // createToast(type, icon, title, text, 2000, true, "/accounts/protected");
      })
      .catch((error) => {
        // Handle error
        // console.error("Error:", error.response.data);
        document.querySelector(".signinform").reset()
        let type = 'error';
        let icon = 'fa-solid fa-circle-exclamation';
        let title = 'Error';
        let text = error.response.data.message;
        createToast(type, icon, title, text, 5000);
      });
  });