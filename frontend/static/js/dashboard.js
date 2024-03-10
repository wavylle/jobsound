var applicantsGraphData = { "": 0 };
function fetchApplicantsData() {
  fetch("/panel/getapplications")
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        var dateVal = new Date(data[i]["createdAt"]).toLocaleDateString(
          "en-US",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
        if (!applicantsGraphData[dateVal]) {
          applicantsGraphData[dateVal] = 1;
        } else {
          applicantsGraphData[dateVal] = applicantsGraphData[dateVal] + 1;
        }
      }

      var slicedData = data.slice(-10).reverse()

      const tableBody = document.querySelector(".applicantsTable");
        tableBody.innerHTML = ""; // Clear existing table rows
        for (let i = 0; i < slicedData.length; i++) {
          tableBody.innerHTML += `<tr class="">
									<td class="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
									<div class="flex items-center gap-x-4">
										<div class="truncate text-sm font-medium leading-6 text-white"><img class="h-8 w-8 rounded-full bg-gray-800" src="${
                      slicedData[i]["profileImagePath"]
                        ? "/panel/uploads/" + slicedData[i]["profileImagePath"]
                        : "../static/images/profile.jpg"
                    }" alt="Profile Image" id="profileImage"></div>
										<div class="truncate text-sm font-medium leading-6 text-white">${
                      slicedData[i]["first_name"]
                    } ${slicedData[i]["last_name"]}</div>
									</div>
									</td>
									<td class="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
									<div class="flex items-center gap-x-4">
										<div class="truncate text-sm font-medium leading-6 text-white">${
                      slicedData[i]["job_title"]
                    }</div>
									</div>
									</td>
									<td class="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
									<div class="flex items-center justify-end gap-x-2 sm:justify-start">
									<time class="text-gray-400 sm:hidden" datetime="2023-01-23T11:00">21/2/2024</time>
									<div class="flex-none rounded-full p-1 text-${
                    slicedData[i]["interview_status"] ? "green" : "red"
                  }-400 bg-${
            slicedData[i]["interview_status"] ? "green" : "red"
          }-400/10">
										<div class="h-1.5 w-1.5 rounded-full bg-current"></div>
										</div>
										<div class="hidden text-white sm:block">${
                      slicedData[i]["interview_status"] ? "Complete" : "Pending"
                    }</div>
									</div>
									</td>
									<td class="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8 text-gray-400">
										<div class="flex items-center gap-x-4">
											<time datetime="2023-01-23T11:00">${new Date(
                        slicedData[i]["createdAt"]
                      ).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}</time>
										</div>
									</td>
									`;
        }

      for(let j = 0; j < slicedData.length; j++) {
        console.log(slicedData);
      }
      console.log(applicantsGraphData);

      console.log(Object.keys(applicantsGraphData));
      console.log(Object.values(applicantsGraphData));

      loadApplicantsChart(
        Object.keys(applicantsGraphData),
        Object.values(applicantsGraphData)
      );
      document.querySelector(".totalApplicantsCount").textContent = data.length;
    });
}

function loadApplicantsChart(xAxisArray, yAxisArray) {
  const options = {
    chart: {
      height: 250,
      maxWidth: "100%",
      type: "area",
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
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: "#1C64F2",
        gradientToColors: ["#1C64F2"],
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
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: 0,
      },
    },
    series: [
      {
        name: "Applicants",
        data: yAxisArray,
        color: "#1A56DB",
      },
    ],
    xaxis: {
      categories: xAxisArray,
      labels: {
        show: false,
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
    document.getElementById("applicant-chart") &&
    typeof ApexCharts !== "undefined"
  ) {
    const chart = new ApexCharts(
      document.getElementById("applicant-chart"),
      options
    );
    chart.render();
  }
}

fetchApplicantsData();
