'use strict';

window.addEventListener('load', init);

function init() {
  document.querySelector('#preloader').classList.add('d-none');
  document.querySelector('#search-form').addEventListener('submit', handleSearchSubmit);
  document.querySelector('#content').classList.add('d-flex', 'flex-wrap');
}

var chart;

function handleSearchSubmit(e) {
  //Hindrar sidan från att ladda om
  e.preventDefault();

  // När en sökning har gjorts så plockas ladd-ikonerna bort
  document.querySelector('#preloader').classList.remove('d-none');

  // Hämtar söksträngen och vart resultetet ska presenteras. Utför söken med search()
  search(document.querySelector('#search').value, document.querySelector('#content'));

  // Återställ innehållet vid ny sökning.
  document.querySelector('#content').innerHTML = null;

   // Kollar ifall chart har en instans och isåfall tar vi bort grafens värden vid ny sök
   if (chart) {
    // Återställ värderna i stapeldiagrammet när en ny sökning utförs.
    resetCurrentValues();
  }
}

function search(query) {
  
  // Sparar endpointen i en variabel.
  // Encodar söksträngen så man ersätter specialtecken med siffror som lämpar sig för en söksträng
  // Sätter söksträngen till lowercase för att api:et ger endast träffar på lowercase strängar
  
  let url = 'https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(query).toLowerCase();
  
  window.fetch(url)
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      console.log(error.message);
    })
    .then(function (data) {

      // Gömmer preloaders när man har sökt på ett giltigt resultat
      document.querySelector('#preloader').classList.add('d-none');

      // Hämtar en referens till div:en där innehållet placeras.
      let content = document.querySelector('#content');

      // Skapar kort
      let card = document.createElement('div');
      card.classList.add('card', 'bg-light');
      card.style.width = '400px';
      card.style.borderRadius = '40px';
      card.style.borderTopRightRadius = '0';
      content.appendChild(card);

      // Sätter namnet på Pokemónen
      let cardTitle = document.createElement('h5');
      cardTitle.textContent = data.name.toUpperCase();
      cardTitle.classList.add('card-header', 'bg-dark', 'text-light');
      cardTitle.style.borderBottomRightRadius = '20px';
      cardTitle.style.borderTopLeftRadius = '20px';
      cardTitle.style.width = 'fit-content';
      card.appendChild(cardTitle);

      // Skapar en bild-tagg och sätter den hämtade bilden
      let img = document.createElement('img');
      img.src = data.sprites.other.dream_world.front_default;
      img.style.height = '200px';
      img.style.marginBottom = '50px';

      //eftersom att det på en del ovanligare karaktärer saknas en bild, görs en kontroll
      if (data.sprites.other.dream_world.front_default===null){
        //om bilden inte fanns, tilldelas elementet en annan bild som hämtas
        img.src = data.sprites.other.home.front_default;
      }
      card.appendChild(img);

      // Skapar en body för information om hämtad Pokemón
      let cardBody = document.createElement('div');
      cardBody.classList.add('card-body', 'bg-success');
      card.appendChild(cardBody);

      // Hämtar och sätter typ av Pokemón
      let typeElement = document.createElement('p');
      let pokemonType = data.types[0].type.name;
      typeElement.textContent = 'Type: ' + pokemonType;
      typeElement.classList.add('text-light');
      cardBody.appendChild(typeElement);

      // Hämtar och sätter längd av Pokemón
      let heightElement = document.createElement('p');
      heightElement.textContent = 'Height: ' + data.height + ' dm';
      heightElement.classList.add('text-light');
      cardBody.appendChild(heightElement);

      // Hämtar och sätter vikt av Pokemón 
      let weightElement = document.createElement('p');
      weightElement.textContent = 'Weight: ' + data.weight / 10 + ' kg';
      weightElement.classList.add('text-light');
      cardBody.appendChild(weightElement);

      // Beroende på experience, tilldelas korten styrka
      let xpElement = document.createElement('p');
      if (data.base_experience > 80 && data.base_experience < 150) {
        xpElement.innerHTML = 'Experience: ' + data.base_experience + ', <i>Normal</i>';
      } else if (data.base_experience < 80) {
        xpElement.innerHTML = 'Experience: ' + data.base_experience + ', <i>Weak</i>';
      } else if (data.base_experience > 150) {
        xpElement.innerHTML = 'Experience: ' + data.base_experience + ', <i>Overpowered</i>';
      }
      xpElement.classList.add('text-light');
      cardBody.appendChild(xpElement);

      // Hämtar och definerar stats för samtliga y-värden.
      let hp = data.stats[0].base_stat;
      let attack = data.stats[1].base_stat;
      let defense = data.stats[2].base_stat;
      let sAttack = data.stats[3].base_stat;
      let sDefense = data.stats[4].base_stat;
      let speed = data.stats[5].base_stat;

      // Kallar en funktion som sätter värderna i grafen
      setChartValues(hp, attack, defense, sAttack, sDefense, speed);
    });
}
//mycket av koden för grafen är tagen från W3schools: https://www.w3schools.com/ai/ai_chartjs.asp
//anpassats genom att göra en funktion som uppdaterar värdena emellan sökning.
function setChartValues(hp, attack, defense, sAttack, sDefense, speed) {
  // Från w3schools, rad 135 till 163
  //anpassats genom att ha ett y-värde som alltid är 0, för att grafen ska börja på det värde varje gång.
  let xValues = ["Hp", "Attack", "defense", "special-attack", "special-defense", "speed", ""];
  let yValues = [hp, attack, defense, sAttack, sDefense, speed, 0];
  let barColors = ["skyBlue", "lightGreen", "limeGreen", "orange", "orangeRed", "black"];

  // Hämtar en referens till grafen
  // Skickar in våra stats till instansen
  let chartRef = document.querySelector('#chartRef');
  chart = new Chart(chartRef, {
    type: 'bar',
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Stats"
      }
    }
  });

  chartRef.style.borderRadius = '10px';
  chartRef.classList.add('bg-light');
}

function resetCurrentValues() {
  // Tar bort instansen av grafen vid en ny sökning
  // Annars sparas de gamla värderna i grafen
  chart.destroy();
}
