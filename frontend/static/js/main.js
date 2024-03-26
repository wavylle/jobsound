document.addEventListener("DOMContentLoaded", function () {
  const micIcon = document.getElementById("micIcon");
  const micOnOff = document.querySelector(".mic-on-off");

  micOnOff.addEventListener("click", function () {
    if (micIcon.classList.contains("fa-microphone")) {
      micIcon.classList.remove("fa-microphone");
      micIcon.classList.add("fa-microphone-slash");
    } else {
      micIcon.classList.remove("fa-microphone-slash");
      let countdown = 5;

// Countdown loop
for (let i = countdown; i > 0; i--) {
  setTimeout(() => {
    micIcon.textContent = i;
    if (i === 1) {
      micIcon.textContent = ""; // Clear text
      micIcon.classList.add("fa-microphone"); // Add microphone icon
    }
  }, (countdown - i) * 1000);
}
    }
  });
});

window.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".text-count")) {
    var countdownElement = document.querySelector(".text-count");
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    // Delay the countup timer by 6 seconds
    setTimeout(function () {
      // Update the countup every second
      var countupInterval = setInterval(function () {
        seconds++;

        if (seconds >= 60) {
          seconds = 0;
          minutes++;
        }

        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }

        var formattedTime =
          String(hours).padStart(2, "0") +
          ":" +
          String(minutes).padStart(2, "0") +
          ":" +
          String(seconds).padStart(2, "0");
        countdownElement.textContent = formattedTime;
      }, 1000);
    }, 6000); // Delay the start of the countup timer by 6 seconds (6000 milliseconds)
  }
});

var i = 4;
var $wrap = $("#wrap");
function countdown() {
  if (i < 0) {
    $wrap.empty(); // Remove all child elements of the wrap div
    return false;
  }
  $wrap.removeAttr("class");
  if (i === 3) {
  } else if (i === 0) {
    $("#message-wrap").addClass("deleted");
  }
  setTimeout(function () {
    $wrap.addClass("wrap-" + i);
    setTimeout(function () {
      i--;
      countdown();
    }, 1000);
  }, 600);
}
countdown();

function handlePopups() {
  const startInterviewButton = document.querySelector(
    ".start-interview-button"
  );
  const popup = document.querySelector(".id-ps-popup");
  const cancelButton = document.querySelector(".cncl-popup");
  const startTestButton = document.querySelector(".start-test");
  const popupTest = document.querySelector(".id-ps-popup-test");
  const cnclPopupTest = document.querySelector(".cncl-popup-test");

  startInterviewButton.addEventListener("click", function () {
    popup.style.display = "block";
  });

  cancelButton.addEventListener("click", function () {
    popup.style.display = "none";
  });
  startTestButton.addEventListener("click", function () {
    popupTest.style.display = "block";
    popup.style.display = "none";
  });
  cancelButton.addEventListener("click", function () {
    popupTest.style.display = "none";
  });
  cnclPopupTest.addEventListener("click", function () {
    popupTest.style.display = "none";
  });
}
document.addEventListener("DOMContentLoaded", function () {
  handlePopups();
});

document.addEventListener("DOMContentLoaded", function () {
  const salaryHideCheckbox = document.getElementById("salary-hide");
  const salaryInput = document.querySelector(".salary-input");

  salaryHideCheckbox.addEventListener("click", function () {
    if (salaryHideCheckbox.checked) {
      salaryInput.style.display = "none";
    } else {
      salaryInput.style.display = "block";
    }
  });
});

const optionsO = {
  chart: {
    height: 200,
    maxWidth: "100%",
    type: "line",
    fontFamily: "Inter, sans-serif",
    dropShadow: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    enabled: true,
    x: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 6,
  },
  grid: {
    show: false,
    strokeDashArray: 8,
    padding: {
      left: 2,
      right: 2,
      top: -26,
    },
  },
  series: [
    {
      name: "Clicks",
      data: [6, 4, 9, 6, 6, 5],
      color: "#1A56DB",
    },
    {
      name: "Interviews",
      data: [2, 1, 3, 1, 4, 5],
      color: "#7E3AF2",
    },
  ],
  legend: {
    show: false,
  },
  stroke: {
    curve: "smooth",
  },
  xaxis: {
    categories: [
      "01 Feb",
      "02 Feb",
      "03 Feb",
      "04 Feb",
      "05 Feb",
      "06 Feb",
      "07 Feb",
    ],
    labels: {
      show: true,
      style: {
        fontFamily: "Inter, sans-serif",
        cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
};

if (
  document.getElementById("line-chart") &&
  typeof ApexCharts !== "undefined"
) {
  const chart = new ApexCharts(document.getElementById("line-chart"), optionsO);
  chart.render();
}

const getChartOptions = () => {
  return {
    series: [35, 23, 2, 5],
    colors: ["#1C64F2", "#16BDCA", "#FDBA8C", "#E74694"],
    chart: {
      height: 250,
      width: "100%",
      type: "donut",
    },
    stroke: {
      colors: ["transparent"],
      lineCap: "",
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: "Inter, sans-serif",
              offsetY: 20,
            },
            total: {
              showAlways: true,
              show: true,
              label: "Clicks",
              fontFamily: "Inter, sans-serif",
              formatter: function (w) {
                const sum = w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0);
                return "%" + sum + "";
              },
            },
            value: {
              show: true,
              fontFamily: "Inter, sans-serif",
              offsetY: -20,
              color: ["white"],
              fontWeight: 600,
              fontSize: "30px",
              formatter: function (value) {
                return value + "";
              },
            },
          },
          size: "80%",
        },
      },
    },
    grid: {
      padding: {
        top: -2,
      },
    },
    labels: [
      "Not Done Yet",
      "Unaccepted",
      "Clicked without joining the meeting ",
      "Accepted",
    ],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      fontFamily: "Inter, sans-serif",
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + "";
        },
      },
    },
    xaxis: {
      labels: {
        formatter: function (value) {
          return value + "";
        },
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
  };
};

if (
  document.getElementById("donut-chart") &&
  typeof ApexCharts !== "undefined"
) {
  const chart = new ApexCharts(
    document.getElementById("donut-chart"),
    getChartOptions()
  );
  chart.render();

  // Get all the checkboxes by their class name
  const checkboxes = document.querySelectorAll(
    '#devices input[type="checkbox"]'
  );

  // Function to handle the checkbox change event
  function handleCheckboxChange(event, chart) {
    const checkbox = event.target;
    if (checkbox.checked) {
      switch (checkbox.value) {
        case "desktop":
          chart.updateSeries([15.1, 22.5, 4.4, 8.4]);
          break;
        case "tablet":
          chart.updateSeries([25.1, 26.5, 1.4, 3.4]);
          break;
        case "mobile":
          chart.updateSeries([45.1, 27.5, 8.4, 2.4]);
          break;
        default:
          chart.updateSeries([55.1, 28.5, 1.4, 5.4]);
      }
    } else {
      chart.updateSeries([35.1, 23.5, 2.4, 5.4]);
    }
  }

  // Attach the event listener to each checkbox
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) =>
      handleCheckboxChange(event, chart)
    );
  });
}

function createRadialBarChart(elementId, value) {
  var options = {
    series: [value],
    chart: {
      height: 110,
      width: "100%",
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "50%",
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: true,
            color: "#fff",
            offsetY: 4,
            fontSize: "12px",
          },
        },
      },
    },
    // fill: {
    //   type: 'gradient',
    //   gradient: {
    //     shade: 'dark',
    //     type: 'horizontal',
    //     shadeIntensity: 0.5,
    //     gradientToColors: ['#6e35d4'],
    //     inverseColors: true,
    //     opacityFrom: 1,
    //     opacityTo: 1,
    //     stops: [0, 100]
    //   }
    // },
    labels: [value + "%"],
  };

  var chart = new ApexCharts(document.querySelector(elementId), options);
  chart.render();
}

createRadialBarChart("#chart", 70);
createRadialBarChart("#chart2", 60);
createRadialBarChart("#chart3", 0);
createRadialBarChart("#chart4", 90);
createRadialBarChart("#chart5", 80);
createRadialBarChart("#chart6", 40);
createRadialBarChart("#chart7", 90);
createRadialBarChart("#chart8", 80);

window.addEventListener("load", function () {
  document
    .getElementById("copy-link-button")
    .addEventListener("click", function () {
      var jobLinkInput = document.getElementById("job-link-input");
      jobLinkInput.select();
      document.execCommand("copy");
    });
});

function deleteSkillHandler() {
  var deleteSkill = document.querySelectorAll(".skill-x");

  deleteSkill.forEach(function (skillX) {
    skillX.addEventListener("click", function () {
      var skillO = this.parentNode;
      var deleteSkillO = skillO.parentNode;

      deleteSkillO.removeChild(skillO);
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  deleteSkillHandler();
  initializeSkillsInput();
});

function initializeSkillsInput() {
  const input = document.getElementById("skill");
  const skillsContainer = document.getElementById("skills-container");

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && input.value.trim() !== "") {
      event.preventDefault();

      const skill = document.createElement("span");
      skill.className =
        "skill-o flex flex-wrap pl-4 pr-2 py-2 mr-2 mt-1 mb-1 justify-between items-center text-sm font-medium rounded-xl cursor-pointer bg-purple-500 text-gray-200 hover:bg-purple-600 hover:text-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100";
      skill.innerText = input.value.trim();

      const closeIcon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      closeIcon.classList.add(
        "h-5",
        "w-5",
        "ml-3",
        "hover:text-gray-300",
        "skill-x"
      );
      closeIcon.setAttribute("viewBox", "0 0 20 20");
      closeIcon.setAttribute("fill", "currentColor");
      closeIcon.setAttribute("width", "20");
      closeIcon.setAttribute("height", "20");

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("fill-rule", "evenodd");
      path.setAttribute(
        "d",
        "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      );

      closeIcon.appendChild(path);
      skill.appendChild(closeIcon);
      skillsContainer.appendChild(skill);

      input.value = "";

      deleteSkillHandler(); // Re-attach event listeners to the newly added skills
    }
  });
}

// Call the function when the page is fully loaded
window.addEventListener("load", initializeSkillsInput);

jQuery(document).ready(function ($) {
  $(".applic-row").click(function () {
    window.location = $(this).data("href");
  });
});

// Question in page 3 deletion
function initializeQuestionSection() {
  var deleteQuestionIcons = document.querySelectorAll(".deleteQuestionIcon");

  deleteQuestionIcons.forEach(function (deleteQuestionIcon, index) {
    deleteQuestionIcon.addEventListener("click", function () {
      var questionInput = this.parentNode.querySelector(".questionInput");
      var deleteIconContainer = this.parentNode;

      questionInput.parentNode.removeChild(questionInput);
      deleteIconContainer.parentNode.removeChild(deleteIconContainer);

      updateQuestionNumbers();
    });
  });

  let questionCount = 4;
  const addQuestionButton = document.getElementById("add-question");
  const questionContainer = document.getElementById("question-container");

  if (addQuestionButton) {
    addQuestionButton.addEventListener("click", addQuestion);
  } else {
    console.error('Button element with ID "add-question" not found.');
  }

  function addQuestion() {
    const newQuestionDiv = document.createElement("div");
    newQuestionDiv.className = "flex items-end";

    const questionInputDiv = document.createElement("div");
    questionInputDiv.className = "pt-6 w-full questionInput";

    const questionLabel = document.createElement("label");
    questionLabel.htmlFor = "question";
    questionLabel.className = "block text-sm font-medium leading-6 text-white";
    questionLabel.textContent = "Question " + (questionCount + 1);

    const questionInputGroup = document.createElement("div");
    questionInputGroup.className = "mt-2 flex rounded-md shadow-sm";

    const questionInputContainer = document.createElement("div");
    questionInputContainer.className =
      "relative flex flex-grow items-stretch focus-within:z-10";

    const questionInput = document.createElement("input");
    questionInput.type = "question";
    questionInput.name = "question";
    questionInput.className =
      "block w-full rounded-none rounded-l-md border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 focus:outline-none bg-gray-900 text-white";
    questionInput.placeholder = "How you see yourself in 5 years?";
    questionInput.value = "How you see yourself in 5 years?";

    const rewriteButton = document.createElement("button");
    rewriteButton.type = "button";
    rewriteButton.className =
      "relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
    rewriteButton.textContent = "Rewrite with AI";

    const questionInputI = document.createElement("i");
    questionInputI.className = "fa-light fa-wand-magic-sparkles";

    const deleteQuestionIcon = document.createElement("i");
    deleteQuestionIcon.className =
      "fa-solid fa-xmark text-[#ff6666] p-2.5 cursor-pointer deleteQuestionIcon";

    newQuestionDiv.appendChild(questionInputDiv);
    questionInputDiv.appendChild(questionLabel);
    questionInputDiv.appendChild(questionInputGroup);
    questionInputGroup.appendChild(questionInputContainer);
    questionInputContainer.appendChild(questionInput);
    questionInputGroup.appendChild(rewriteButton);
    rewriteButton.appendChild(questionInputI);
    newQuestionDiv.appendChild(deleteQuestionIcon);

    questionContainer.appendChild(newQuestionDiv);

    // Add event listener to delete question when delete icon is clicked
    deleteQuestionIcon.addEventListener("click", function () {
      const questionInput = this.parentNode.querySelector(".questionInput");
      const deleteIconContainer = this.parentNode;

      questionInput.parentNode.removeChild(questionInput);
      deleteIconContainer.parentNode.removeChild(deleteIconContainer);

      updateQuestionNumbers();
    });

    questionCount++;

    updateQuestionNumbers();
  }

  function updateQuestionNumbers() {
    const questionLabels = document.querySelectorAll(".questionInput label");
    questionLabels.forEach(function (questionLabel, index) {
      questionLabel.textContent = "Question " + (index + 1);
    });
  }
}

// Call the function when the page is fully loaded
window.addEventListener("load", initializeQuestionSection);
