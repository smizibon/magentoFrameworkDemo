module.exports = {
  reporter: "mochawesome",
  "reporter-option": [
    "reportDir=test/reports",
    "reportFilename=[status]_[datetime]-report",
    "html=true",
    "json=true",
    "overwrite=false",
    "timestamp=true",
  ],
};
