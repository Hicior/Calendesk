let currentCard = 1;
let cardOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16]; // Removed cards 14 and 15 from default order

let pkListenerAttached = false;
let kpListenerAttached = false;

// Object to store user's selections
let userSelections = {
  accountingPackage: null,
  hrPackage: null,
  accountingTypeSelection: null,
};

document.addEventListener("DOMContentLoaded", function () {
  showCard(currentCard);

  // Event listeners for conditional logic
  const employeesYes = document.getElementById("employeesYes");
  const employeesNo = document.getElementById("employeesNo");

  if (employeesYes) {
    employeesYes.addEventListener("change", function () {
      if (this.checked) {
        addConditionalCards();
      }
    });
  }

  if (employeesNo) {
    employeesNo.addEventListener("change", function () {
      if (this.checked) {
        removeConditionalCards();
      }
    });
  }

  // Handle form submission
  const form = document.getElementById("surveyForm");
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default submission

    // Collect form data
    const formData = new FormData(form);

    // Send form data via AJAX to Formspree
    fetch("https://formspree.io/f/mqazvjvp", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Form submission failed");
        }
      })
      .then((data) => {
        // Display thank-you-message and the buttons
        form.innerHTML =
          '<div class="submission-message">Dziękujemy! Twoja odpowiedź została przesłana.</div>';
        displayPurchaseButtons();
      })
      .catch((error) => {
        // Handle form submission error
        form.innerHTML =
          '<div class="submission-message">Wystąpił problem z przesłaniem formularza. Prosimy spróbować ponownie później lub zgłosić błąd przesyłając wiadomość na czacie w prawym dolnym rogu.</div>';
        console.error(error);
      });
  });
});

function showCard(n) {
  // Retrieve all the form cards
  let cards = document.querySelectorAll(".card");

  // Remove 'card-active' class from all cards to ensure only the current card is visible
  cards.forEach(function (card) {
    card.classList.remove("card-active");
  });

  // Identify the current card based on the index provided and make it active
  let currentCardId = "card-" + cardOrder[n - 1];
  let currentCardElement = document.getElementById(currentCardId);
  if (currentCardElement) {
    currentCardElement.classList.add("card-active");

    // If the user is on Card 3, handle the accounting selection and show the relevant description
    if (currentCardId === "card-3") {
      const accountingOptions = document.getElementsByName("Forma księgowości");

      // Update the selection for accounting type based on user input
      const selectedOption = document.querySelector(
        'input[name="Forma księgowości"]:checked'
      );
      if (selectedOption) {
        userSelections.accountingTypeSelection = selectedOption.value;
      }

      // Display or hide the relevant package description based on the selected accounting type
      updateMentzenBezVatDescription();

      // Add event listeners to accounting options to update selection when the user makes a choice
      accountingOptions.forEach((option) => {
        option.addEventListener("change", function () {
          userSelections.accountingTypeSelection = this.value;
          updateMentzenBezVatDescription(); // Update the description based on the new selection
        });
      });
    }

    // Attach event listeners to Card 14 if it hasn't been done yet, to handle document selection
    if (currentCardId === "card-14" && !pkListenerAttached) {
      const documentsPKSelect = document.getElementById("documents_PK");

      if (documentsPKSelect) {
        // Update the package description when the document count changes
        documentsPKSelect.addEventListener("change", function () {
          updateDescriptionPK(this.value);
          userSelections.accountingPackage = getAccountingPackage(
            "pk",
            this.value
          );
        });
        pkListenerAttached = true; // Ensure the event listener is attached only once
      }
    }

    // Attach event listeners to Card 15 if it hasn't been done yet, for KPIR document selection
    if (currentCardId === "card-15" && !kpListenerAttached) {
      const documentsKPIRSelect = document.getElementById(
        "documents_KPIR_RyczaltzVAT"
      );

      if (documentsKPIRSelect) {
        // Update the package description when the document count changes
        documentsKPIRSelect.addEventListener("change", function () {
          updateDescriptionKPIR(this.value);
          userSelections.accountingPackage = getAccountingPackage(
            "kp",
            this.value
          );
        });
        kpListenerAttached = true; // Ensure the event listener is attached only once
      }
    }

    // Display available HR and payroll packages when on Card 13
    if (currentCardId === "card-13") {
      displayPackages();
    }

    // Add event listeners to handle HR package selection on Card 13
    if (currentCardId === "card-13") {
      const hrOptions = document.getElementsByName("Obsługa kadrowo-płacowa");
      hrOptions.forEach((option) => {
        option.addEventListener("change", function () {
          userSelections.hrPackage = getHRPackage(); // Store the selected HR package based on user choice
        });
      });
    }
  }
}

// Update the description for the "Mentzen bez VAT" package based on the selected accounting type
function updateMentzenBezVatDescription() {
  const descriptionDiv = document.getElementById("description_MentzenBezVat");
  if (
    userSelections.accountingTypeSelection ===
    "Ryczałt od przychodów ewidencjonowanych bez VAT"
  ) {
    displayMentzenBezVatDescription(); // Show the relevant package description
    userSelections.accountingPackage = {
      name: "Mentzen bez VAT",
      subscriptionId: 108,
    };
  } else {
    if (descriptionDiv) {
      descriptionDiv.innerHTML = ""; // Clear the description if this accounting type is not selected
    }
    userSelections.accountingPackage = null; // Reset the accounting package selection
  }
}

// Display the details of the "Mentzen bez VAT" package
function displayMentzenBezVatDescription() {
  const descriptionDiv = document.getElementById("description_MentzenBezVat");
  if (descriptionDiv) {
    descriptionDiv.innerHTML = `
      <h3>Mentzen bez VAT</h3>
      <ul>
        <li>prowadzenie księgowości dla Ryczałtu bez VAT,</li>
        <li>automatyczne płatności,</li>
        <li>dostęp do platformy umożliwiającej przekazywanie dokumentów,</li>
        <li>dostęp do danych raportowych takich jak podatki, wynagrodzenia, ewidencja VAT,</li>
        <li>powiadomienia SMS o zbliżających się terminach płatności podatków itp.,</li>
        <li>dostęp do szablonów umów,</li>
        <li>wsparcie w kontrolach podatkowych,</li>
        <li>newsletter podatkowy,</li>
        <li>dostęp do webinarów.</li>
      </ul>
      <p><strong>Pakiet miesięczny</strong></p>
      <p><strong>250 zł netto</strong></p>
    `;
  }
}

function nextPrev(n) {
  // If moving forward from Card 3, adjust cardOrder based on selection
  if (currentCard === cardOrder.indexOf(3) + 1 && n === 1) {
    adjustCardsAfterAccountingType();
  }
  // If moving backward to Card 3, remove Cards 14 and 15 and reset listeners
  if (currentCard === cardOrder.indexOf(4) + 1 && n === -1) {
    cardOrder = cardOrder.filter((card) => card !== 14 && card !== 15);
    pkListenerAttached = false;
    kpListenerAttached = false;
    userSelections.accountingPackage = null; // Reset selection
  }

  currentCard += n;

  // Prevent going beyond the first and last cards
  if (currentCard < 1) {
    currentCard = 1;
  } else if (currentCard > cardOrder.length) {
    currentCard = cardOrder.length;
  }

  showCard(currentCard);
}

function adjustCardsAfterAccountingType() {
  // Remove Cards 14 and 15 from cardOrder if they exist
  cardOrder = cardOrder.filter((card) => card !== 14 && card !== 15);

  // Get the selected accounting type
  const accountingType = document.querySelector(
    'input[name="Forma księgowości"]:checked'
  )?.value;

  // Determine which card to add based on the selection
  let index = cardOrder.indexOf(3) + 1; // Position after Card 3

  if (accountingType === "Pełna księgowość") {
    cardOrder.splice(index, 0, 14); // Insert Card 14 after Card 3
  } else if (
    accountingType === "KPiR lub Ryczałt od przychodów ewidencjonowanych z VAT"
  ) {
    cardOrder.splice(index, 0, 15); // Insert Card 15 after Card 3
  }
  // For the last option, no action is needed
}

function addConditionalCards() {
  if (!cardOrder.includes(12)) {
    const index = cardOrder.indexOf(11) + 1; // Adjusted index after card 11
    cardOrder.splice(index, 0, 12, 13); // Add cards 12 and 13
  }
}

function removeConditionalCards() {
  cardOrder = cardOrder.filter((card) => card !== 12 && card !== 13);
  if (currentCard > cardOrder.length) {
    currentCard = cardOrder.length;
  }
  showCard(currentCard);
}

// Package Data for Card 14
const pkPackages = {
  "do 20 dokumentów": {
    numberOfDocuments: "20",
    price: "1200 zł netto",
    subscriptionId: 209,
  },
  "21 - 40 dokumentów": {
    numberOfDocuments: "40",
    price: "1500 zł netto",
    subscriptionId: 211,
  },
  "41 - 60 dokumentów": {
    numberOfDocuments: "60",
    price: "1800 zł netto",
    subscriptionId: 99,
  },
  "61 - 80 dokumentów": {
    numberOfDocuments: "80",
    price: "2000 zł netto",
    subscriptionId: 100,
  },
  "81 - 100 dokumentów": {
    numberOfDocuments: "100",
    price: "2200 zł netto",
    subscriptionId: 101,
  },
  "101 - 120 dokumentów": {
    numberOfDocuments: "120",
    price: "2400 zł netto",
    subscriptionId: 265,
  },
  "121 - 140 dokumentów": {
    numberOfDocuments: "140",
    price: "2600 zł netto",
    subscriptionId: 103,
  },
};

// Function to Update Description on Card 14
function updateDescriptionPK(selectedValue) {
  let descriptionText = "";
  const descriptionPK = document.getElementById("description_PK");
  if (selectedValue && pkPackages[selectedValue]) {
    let packageInfo = pkPackages[selectedValue];
    let numberOfDocuments = packageInfo.numberOfDocuments;
    let packagePrice = packageInfo.price;

    descriptionText = `
            <h3>Szeroki Mentzen ${numberOfDocuments}</h3>
            <ul>
                <li>prowadzenie księgowości w formie Ksiąg Rachunkowych,</li>
                <li>pakiet dotyczy max. ${numberOfDocuments} dokumentów miesięcznie,</li>
                <li>nielimitowane konsultacje podatkowe,</li>
                <li>automatyczne płatności,</li>
                <li>dostęp do platformy umożliwiającej przekazywanie dokumentów,</li>
                <li>dostęp do danych raportowych takich jak podatki, wynagrodzenia, ewidencja VAT,</li>
                <li>powiadomienia SMS o zbliżających się terminach płatności podatków itp.,</li>
                <li>dostęp do szablonów umów,</li>
                <li>wsparcie w kontrolach podatkowych,</li>
                <li>newsletter podatkowy,</li>
                <li>dostęp do webinarów.</li>
            </ul>
            <p><strong>Pakiet miesięczny</strong></p>
            <p><strong>${packagePrice}</strong></p>
        `;
  }

  if (descriptionPK) {
    descriptionPK.innerHTML = descriptionText;
  }
}

// Package Data for Card 15
const kpPackages = {
  "do 10 dokumentów": {
    numberOfDocuments: "10",
    price: "350 zł netto",
    subscriptionId: 104,
  },
  "11-30 dokumentów": {
    numberOfDocuments: "30",
    price: "440 zł netto",
    subscriptionId: 105,
  },
  "31-50 dokumentów": {
    numberOfDocuments: "50",
    price: "530 zł netto",
    subscriptionId: 106,
  },
  "51-70 dokumentów": {
    numberOfDocuments: "70",
    price: "620 zł netto",
    subscriptionId: 107,
  },
  "71-90 dokumentów": {
    numberOfDocuments: "90",
    price: "730 zł netto",
    subscriptionId: 247,
  },
  "91-110 dokumentów": {
    numberOfDocuments: "110",
    price: "840 zł netto",
    subscriptionId: 131,
  },
  "111-130 dokumentów": {
    numberOfDocuments: "130",
    price: "950 zł netto",
    subscriptionId: 261,
  },
  "131-150 dokumentów": {
    numberOfDocuments: "150",
    price: "1060 zł netto",
    subscriptionId: 264,
  },
  "151-170 dokumentów": {
    numberOfDocuments: "170",
    price: "1170 zł netto",
    subscriptionId: 263,
  },
  "171-190 dokumentów": {
    numberOfDocuments: "190",
    price: "1280 zł netto",
    subscriptionId: 227,
  },
  "191-210 dokumentów": {
    numberOfDocuments: "210",
    price: "1390 zł netto",
    subscriptionId: 228,
  },
  "211-230 dokumentów": {
    numberOfDocuments: "230",
    price: "1500 zł netto",
    subscriptionId: 229,
  },
  "231-250 dokumentów": {
    numberOfDocuments: "250",
    price: "1610 zł netto",
    subscriptionId: 230,
  },
};

// Function to Update Description on Card 15
function updateDescriptionKPIR(selectedValue) {
  let descriptionText = "";
  const descriptionKPIR = document.getElementById("description_KPIR");
  if (selectedValue && kpPackages[selectedValue]) {
    let packageInfo = kpPackages[selectedValue];
    let numberOfDocuments = packageInfo.numberOfDocuments;
    let packagePrice = packageInfo.price;

    descriptionText = `
            <h3>Uproszczony Mentzen ${numberOfDocuments}</h3>
            <ul>
                <li>prowadzenie księgowości w formie Księgi Przychodów i Rozchodów lub dla Ryczałtu z VATem,</li>
                <li>pakiet dotyczy max. ${numberOfDocuments} dokumentów miesięcznie,</li>
                <li>nielimitowane konsultacje podatkowe,</li>
                <li>dostęp do platformy umożliwiającej przekazywanie dokumentów,</li>
                <li>dostęp do danych raportowych takich jak podatki, wynagrodzenia, ewidencja VAT,</li>
                <li>powiadomienia SMS o zbliżających się terminach płatności podatków itp.,</li>
                <li>dostęp do szablonów umów,</li>
                <li>wsparcie w kontrolach podatkowych,</li>
                <li>newsletter podatkowy,</li>
                <li>dostęp do webinarów.</li>
            </ul>
            <p><strong>Pakiet miesięczny</strong></p>
            <p><strong>${packagePrice}</strong></p>
        `;
  }

  if (descriptionKPIR) {
    descriptionKPIR.innerHTML = descriptionText;
  }
}

// Function to get selected accounting package
function getAccountingPackage(type, selectedValue) {
  if (type === "pk" && pkPackages[selectedValue]) {
    let packageInfo = pkPackages[selectedValue];
    return {
      name: `Szeroki Mentzen ${packageInfo.numberOfDocuments}`,
      subscriptionId: packageInfo.subscriptionId,
    };
  } else if (type === "kp" && kpPackages[selectedValue]) {
    let packageInfo = kpPackages[selectedValue];
    return {
      name: `Uproszczony Mentzen ${packageInfo.numberOfDocuments}`,
      subscriptionId: packageInfo.subscriptionId,
    };
  } else {
    return null;
  }
}

// Function to Display Packages on Card 13
function displayPackages() {
  const employeeCount =
    parseInt(document.getElementById("employeeCount")?.value) || 0;
  const civilContractCount =
    parseInt(document.getElementById("civilContractCount")?.value) || 0;

  // Variant 1 - Kadry i Płace dla każdego pracownika
  const variant1Total = employeeCount * 2 + civilContractCount;

  // Variant 2 - Same Płace dla pracowników (po odrzuceniu kadr)
  const variant2Total = employeeCount + civilContractCount;

  const packagesContainer = document.getElementById("packagesContainer");

  // Determine packages for each variant
  const package1 = getPackageForTotal(variant1Total);
  const package2 = getPackageForTotal(variant2Total);

  // If both packages are null (both totals over 50), display message
  if (!package1 && !package2) {
    // Display message
    packagesContainer.innerHTML =
      '<p style="margin-bottom: 20px;">W celu uzyskania indywidualnej wyceny prosimy o kontakt z działem administracji: <a href="mailto:ksiegowosc@mentzen.pl">ksiegowosc@mentzen.pl</a></p>';
  } else {
    // Collect packages to display
    let packagesToDisplay = [];

    if (package1 && package2 && package1.name === package2.name) {
      // Both packages are the same
      packagesToDisplay.push({
        package: package1,
        labels: ["Pakiet kadrowo-płacowy", "Pakiet płacowy"],
      });
    } else {
      if (package1) {
        packagesToDisplay.push({
          package: package1,
          labels: ["Pakiet kadrowo-płacowy"],
        });
      }
      if (package2) {
        packagesToDisplay.push({
          package: package2,
          labels: ["Pakiet płacowy"],
        });
      }
    }

    // Generate HTML for packages
    let packagesHTML = "";

    packagesHTML += '<div class="packages-row">';

    packagesToDisplay.forEach((item) => {
      let labelsText = item.labels.join(", ");
      packagesHTML += `
              <div class="package-name">
                  <h4>${item.package.name}</h4>
                  <p><strong>${labelsText}</strong></p>
                  <p><strong>Cena netto:</strong> ${item.package.price} zł miesięcznie</p>
              </div>
          `;
    });

    packagesHTML += "</div>";

    // Add common description
    packagesHTML += `
          <div class="common-description">
              <p><strong>Pakiet płacowy obejmuje</strong> przede wszystkim comiesięczne naliczanie wynagrodzeń, przygotowywanie list wynagrodzeń, rozliczanie się z ZUS-em i Urzędem Skarbowym.</p>
              <p><strong>Pakiet kadrowo-płacowy dodatkowo obejmuje</strong> m.in. ewidencjonowanie urlopów, kontrolowanie ważności badań lekarskich i szkoleń BHP, przygotowywanie dokumentów pracowniczych niezbędnych do rozpoczęcia stosunku pracy jak i zakończenia (np. umowa o pracę, świadectwo pracy) oraz prowadzenie akt osobowych (opcjonalnie).</p>
          </div>
      `;

    packagesContainer.innerHTML = packagesHTML;
  }

  // Attach event listener to radio buttons
  const hrOptions = document.getElementsByName("Obsługa kadrowo-płacowa");
  hrOptions.forEach((option) => {
    option.addEventListener("change", function () {
      // Store the selected HR package
      userSelections.hrPackage = getHRPackage();
    });
  });
}

// Packages Data
const packages = [
  { min: 1, max: 1, name: "Kadry Mentzena 1", price: 60, subscriptionId: 109 },
  { min: 2, max: 2, name: "Kadry Mentzena 2", price: 120, subscriptionId: 110 },
  {
    min: 3,
    max: 4,
    name: "Kadry Mentzena 3-4",
    price: 240,
    subscriptionId: 111,
  },
  {
    min: 5,
    max: 6,
    name: "Kadry Mentzena 5-6",
    price: 360,
    subscriptionId: 112,
  },
  {
    min: 7,
    max: 8,
    name: "Kadry Mentzena 7-8",
    price: 480,
    subscriptionId: 113,
  },
  {
    min: 9,
    max: 10,
    name: "Kadry Mentzena 9-10",
    price: 600,
    subscriptionId: 114,
  },
  {
    min: 11,
    max: 20,
    name: "Kadry Mentzena 11-20",
    price: 900,
    subscriptionId: 115,
  },
  {
    min: 21,
    max: 30,
    name: "Kadry Mentzena 21-30",
    price: 1500,
    subscriptionId: 226,
  },
  {
    min: 31,
    max: 40,
    name: "Kadry Mentzena 31-40",
    price: 2100,
    subscriptionId: 248,
  },
  {
    min: 41,
    max: 50,
    name: "Kadry Mentzena 41-50",
    price: 2700,
    subscriptionId: 267,
  },
];

// Function to Get Package Based on Total
function getPackageForTotal(total) {
  for (let pkg of packages) {
    if (total >= pkg.min && total <= pkg.max) {
      return pkg;
    }
  }
  // If total exceeds available packages, return null
  return null;
}

// Function to get selected HR package
function getHRPackage() {
  const selectedOption = document.querySelector(
    'input[name="Obsługa kadrowo-płacowa"]:checked'
  );
  if (!selectedOption) return null;

  const selectedLabel = selectedOption.value;

  // Get the package displayed on Card 13
  const packageElements = document.querySelectorAll(
    "#packagesContainer .package-name h4"
  );
  let packageName = null;
  if (packageElements.length > 0) {
    packageName = packageElements[0].innerText;
  }

  // Find the package in the packages array
  const selectedPackage = packages.find((pkg) => pkg.name === packageName);
  if (!selectedPackage) return null;

  return {
    name: selectedPackage.name,
    subscriptionId: selectedPackage.subscriptionId,
    packageType: selectedLabel, // 'Kadry i płace' or 'Płace'
  };
}

// Function to display purchase buttons after form submission
function displayPurchaseButtons() {
  const formContainer = document.querySelector(".container");
  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container");

  let buttonsHTML = "<h2>Zapraszamy do wykupienia subskrypcji!</h2>";

  if (userSelections.accountingPackage) {
    buttonsHTML += `
      <a href="https://subskrypcje.mentzen.pl/subscription/${userSelections.accountingPackage.subscriptionId}" target="_blank" class="button">
        ${userSelections.accountingPackage.name}
      </a>
    `;
  }

  if (userSelections.hrPackage) {
    buttonsHTML += `
      <a href="https://subskrypcje.mentzen.pl/subscription/${userSelections.hrPackage.subscriptionId}" target="_blank" class="button">
        ${userSelections.hrPackage.name} (${userSelections.hrPackage.packageType})
      </a>
    `;
  }

  buttonsContainer.innerHTML = buttonsHTML;

  formContainer.appendChild(buttonsContainer);
}
