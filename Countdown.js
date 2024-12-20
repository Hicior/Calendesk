(function () {
  // Set the date and time of the webinar
  var webinarDate = new Date("2024-11-05T18:00:00");

  // Variable for 30 minutes in milliseconds
  var thirtyMinutes = 30 * 60 * 1000;

  // Variables to hold elements
  var liveLabel;
  var countdownMessage;
  var timerElement;

  // Function to update the countdown
  function updateCountdown() {
    var now = new Date();
    var timeRemaining = webinarDate - now;

    // Get elements if not already retrieved
    if (!liveLabel) {
      liveLabel = document.querySelector(".live-label");
    }
    if (!countdownMessage) {
      countdownMessage = document.getElementById("countdown-message");
    }
    if (!timerElement) {
      timerElement = document.getElementById("timer");
    }

    if (timeRemaining > 0) {
      // Hide the live label
      if (liveLabel) liveLabel.style.display = "none";
      if (countdownMessage)
        countdownMessage.innerText = "Do rozpoczęcia webinaru pozostało:";

      // Calculate time components
      var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      // Add a zero before single-digit numbers
      days = days < 10 ? "0" + days : days;
      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      // Update the countdown elements
      var daysElement = document.getElementById("days");
      var hoursElement = document.getElementById("hours");
      var minutesElement = document.getElementById("minutes");
      var secondsElement = document.getElementById("seconds");

      if (daysElement && hoursElement && minutesElement && secondsElement) {
        daysElement.innerHTML = days;
        hoursElement.innerHTML = hours;
        minutesElement.innerHTML = minutes;
        secondsElement.innerHTML = seconds;
      }

      // Ensure the timer is visible
      if (timerElement) timerElement.style.display = "flex";
    } else if (timeRemaining > -thirtyMinutes) {
      // Show the live label
      if (liveLabel) liveLabel.style.display = "block";
      if (countdownMessage)
        countdownMessage.innerText = "Webinar się rozpoczął!";

      // Hide the timer if you don't want to display zeros
      if (timerElement) timerElement.style.display = "none";
    } else {
      // More than 30 minutes have passed since webinarDate
      clearInterval(countdownInterval);
      var countdownContainers = document.getElementsByClassName(
        "Countdown-Container"
      );
      for (var i = 0; i < countdownContainers.length; i++) {
        countdownContainers[i].style.display = "none";
      }
    }
  }

  // Variable to hold the interval ID
  var countdownInterval;

  // Function to initialize the countdown once elements are available
  function initializeCountdown() {
    var countdownElement = document.getElementById("countdown");
    var daysElement = document.getElementById("days");
    var hoursElement = document.getElementById("hours");
    var minutesElement = document.getElementById("minutes");
    var secondsElement = document.getElementById("seconds");

    if (
      countdownElement &&
      daysElement &&
      hoursElement &&
      minutesElement &&
      secondsElement
    ) {
      // Start the countdown interval
      updateCountdown(); // Update immediately
      countdownInterval = setInterval(updateCountdown, 1000);

      // Disconnect the observer since we found the elements
      observer.disconnect();
    }
  }

  // Observe changes in the body to detect when elements are added
  var observer = new MutationObserver(function (mutations, observer) {
    initializeCountdown();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // In case the elements are already present
  initializeCountdown();
})();
