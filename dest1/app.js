const clientId = "qAe8hq0vNtUuwgBSS3oy1VH100Q6XLW8";
const clientSecret = "EABxyzR1LrnkJvDI";


// Step 1: Get access token
async function getAccessToken() {
  const response = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  const data = await response.json();
  return data.access_token;
}

// Step 2: Call Amadeus flight offers endpoint
async function getFlightOffers(token, origin, destination, departureDate) {
  const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=1&max=3`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });


  return await response.json();
}

// Step 3: Handle form submit
document.getElementById("travelForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const output = document.getElementById("output");
  output.innerHTML = "Loading recommendations...";


  const startDate = document.getElementById("startDate").value;
  const budget = document.getElementById("budget").value;
  const activity = document.getElementById("activity").value;
  const distance = document.getElementById("distance").value;
  const weather = document.getElementById("weather").value;


  const token = await getAccessToken();
  const origin = "NYC"; // Placeholder
  const destination = "LAX"; // Placeholder


  try {
    const data = await getFlightOffers(token, origin, destination, startDate);


    if (data && data.data && data.data.length > 0) {
      output.innerHTML = "<h5>Recommended Flights:</h5>";
      data.data.forEach((offer) => {
        const price = offer.price.total;
        const airline = offer.validatingAirlineCodes[0];
        const dep = offer.itineraries[0].segments[0].departure.iataCode;
        const arr = offer.itineraries[0].segments.slice(-1)[0].arrival.iataCode;
        const date = offer.itineraries[0].segments[0].departure.at;


        output.innerHTML += `
          <div class="destination-card">
            <strong>Airline:</strong> ${airline}<br>
            <strong>From:</strong> ${dep} → <strong>To:</strong> ${arr}<br>
            <strong>Date:</strong> ${new Date(date).toLocaleDateString()}<br>
            <strong>Price:</strong> $${price}
          </div>`;
      });
    } else {
      output.innerHTML = `<div class="destination-card">No flights found.</div>`;
    }
  } catch (err) {
    output.innerHTML = `<div class="destination-card text-danger">Error fetching data. Please try again.</div>`;
    console.error(err);
  }
});

// Step 3: Get weather at destination using OpenWeatherMap
async function checkWeather(cityCode, weatherPref) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityCode}&appid=${weatherApiKey}&units=metric`);
  const data = await response.json();
  const temp = data.main.temp;

  if (weatherPref === "warm" && temp >= 18) return true;
  if (weatherPref === "cold" && temp < 18) return true;
  return false;
}
