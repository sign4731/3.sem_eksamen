import "../../sass/index.scss";

window.addEventListener("DOMContentLoaded", init);

let settings = {
    url: "https://hold-kaeft-vi-har-det-godt.herokuapp.com/",
    hooks: {
        beerStockStatusList: document.querySelector(
            ".js-beer-stock-status-list"
        ),
        beerTapChart: document.querySelector(".js-beer-tap-chart"),
        beerTapXAxis: document.querySelector(".js-beer-tap-x-axis"),
        bartenderStatusList: document.querySelector(
            ".js-bartender-status-list"
        ),
    },
    templates: {
        beerStock: document.querySelector(".t-beer-stock").content,
        beerTankBar: document.querySelector(".t-beer-tap").content,
        beerBubble: document.querySelector(".t-beer-bubble").content,
        chartXAxisItem: document.querySelector(".t-chart-x-axis-item").content,
        bartender: document.querySelector(".t-bartender").content,
    },
    beerColors: {
        "Ruined Childhood": "#75b2ff",
        "El Hefe": "#ffda58",
        GitHop: "#553333",
        "Row 26": " #f85229",
        "Hollaback Lager": "#e8d2ae",
        "Hoppily Ever After": "#3ccb75",
        Sleighride: "#e072a4",
        Mowintime: "#3454d1",
        Steampunk: "#ff912d",
        "Fairy Tale Ale": "#ace365",
    },
    beerBubbles: {
        minBubbles: 5,
        maxBubbles: 10,
        minDuration: 2000,
        maxDuration: 8000,
        rangeDuration: 200,
        minDelay: 0,
        maxDelay: 15000,
        rangeDelay: 100,
    },
};

let data = {};

async function init() {
    await getData();

    prepareBeerStockStatusObjects(data.storage);
    prepareBeerTapChartObjects(data.taps);
    prepareBartenderStatusObjects(data.bartenders);

    setInterval(function () {
        updateBeerTapStatus(data.taps);
    }, 5000);
}

async function getData() {
    let response = await fetch(settings.url);

    if (response.status == 502) {
        // Connection timeout, let's reconnect
        await getData();
    } else if (response.status != 200) {
        // An error - show it in the console
        console.log(response.statusText);

        // reconnect after 1 second
        await getData();
    } else {
        const json = await response.json();
        // updateData(data);

        data = json;

        console.log(data);

        // updateBeerTapStatus(data.taps);

        // Call getQueue again, to wait for the next update to the queue
        await setTimeout(await getData, 5000);
    }
}

function prepareBeerTapChartObjects(beerTaps) {
    // Resets the chart
    settings.hooks.beerTapChart.innerHTML = "";

    // Set amount of beers available from the bar
    settings.hooks.beerTapChart.style.setProperty("--beers", beerTaps.length);
    settings.hooks.beerTapXAxis.style.setProperty("--beers", beerTaps.length);

    // Show updated chart
    beerTaps.forEach((beerTap) => {
        showBeerTapLiquid(beerTap);
        showBeerTapStatus(beerTap);
    });
}

function showBeerTapLiquid(beerTapObject) {
    const beerTapChart = settings.hooks.beerTapChart;
    const templateClone = settings.templates.beerTankBar.cloneNode(true);
    const percentage = (beerTapObject.level / beerTapObject.capacity) * 100;

    templateClone
        .querySelector(".beer-tap")
        .style.setProperty("--bar-percentage", percentage.toFixed(2));

    templateClone
        .querySelector(".beer-tap")
        .setAttribute("data-beer", beerTapObject.beer);

    const beerWithBubbles = makeBeerBubbles(templateClone);

    beerTapChart.append(beerWithBubbles);
}

function showBeerTapStatus(beerTapObject) {
    const templateClone = settings.templates.chartXAxisItem.cloneNode(true);
    const percentage = (beerTapObject.level / beerTapObject.capacity) * 100;
    const xAxis = settings.hooks.beerTapXAxis;

    templateClone
        .querySelector(".chart__x-axis-item")
        .style.setProperty("--bar-percentage", parseInt(percentage));

    templateClone.querySelector(".chart__x-axis-name").textContent =
        beerTapObject.beer;
    templateClone.querySelector(
        ".chart__x-axis-percent"
    ).textContent = `${parseInt(percentage)}%`;

    templateClone
        .querySelector(".chart__x-axis-item")
        .setAttribute("data-beer", beerTapObject.beer);

    xAxis.append(templateClone);
}

function prepareBartenderStatusObjects(bartenders) {
    // Resets the list
    settings.hooks.beerStockStatusList.innerHTML = "";

    // Show updated list
    bartenders.forEach(showBartenderStatus);
}

function showBartenderStatus(bartenderObject) {
    const templateClone = settings.templates.bartender.cloneNode(true);
    const bartenderStatusList = settings.hooks.bartenderStatusList;

    templateClone.querySelector(
        ".bartender__name"
    ).textContent = `${bartenderObject.name} ${bartenderObject.status} ${bartenderObject.statusDetail}`;

    bartenderStatusList.append(templateClone);
}

function updateBeerTapStatus(beerTaps) {
    console.log(beerTaps);

    beerTaps.forEach((tap) => {
        const percentage = (tap.level / tap.capacity) * 100;

        const dataHooks = document.querySelectorAll(
            `[data-beer="${tap.beer}"]`
        );

        dataHooks.forEach((hook) =>
            hook.style.setProperty("--bar-percentage", parseInt(percentage))
        );

        document.querySelector(
            `.chart__x-axis-item[data-beer="${tap.beer}"] .chart__x-axis-percent`
        ).textContent = `${parseInt(percentage)}%`;
    });
}

function prepareBeerStockStatusObjects(beersInStock) {
    // Resets the list
    settings.hooks.beerStockStatusList.innerHTML = "";

    // Show updated list
    beersInStock.forEach((beer) => {
        showBeerStockStatus(beer);
    });
}

function showBeerStockStatus(beerObject) {
    const templateClone = settings.templates.beerStock.cloneNode(true);

    templateClone
        .querySelector(".beer-stock__icon")
        .style.setProperty("--keg-color", settings.beerColors[beerObject.name]);
    templateClone.querySelector(".beer-stock__amount").innerHTML =
        beerObject.amount;
    templateClone.querySelector(".beer-stock__name").innerHTML =
        beerObject.name;

    settings.hooks.beerStockStatusList.append(templateClone);
}

function makeBeerBubbles(beerTapBar) {
    // Destructoring
    const {
        minBubbles,
        maxBubbles,
        minDuration,
        maxDuration,
        rangeDuration,
        minDelay,
        maxDelay,
        rangeDelay,
    } = settings.beerBubbles;

    const randomAmountOfBubbles = getRandomInteger(minBubbles, maxBubbles);
    console.log(randomAmountOfBubbles);

    const beerTapBarWithBubbles = generateBeerBubbles(
        beerTapBar,
        randomAmountOfBubbles
    );

    return beerTapBarWithBubbles;
}

function generateBeerBubbles(beerTapBar, numberOfBubbles) {
    // Destructoring
    const {
        minBubbles,
        maxBubbles,
        minDuration,
        maxDuration,
        rangeDuration,
        minDelay,
        maxDelay,
        rangeDelay,
    } = settings.beerBubbles;

    // for number of bubbles... make a bubble
    for (let index = 1; index <= numberOfBubbles; index++) {
        const templateClone = settings.templates.beerBubble.cloneNode(true);
        const delay = getRandomInteger(minDelay, maxDelay, rangeDelay);
        const duration = getRandomInteger(
            minDuration,
            maxDuration,
            rangeDuration
        );

        templateClone
            .querySelector(".beer-tap__bubble-container")
            .style.setProperty("--beer-bubble-delay", delay);
        templateClone
            .querySelector(".beer-tap__bubble-container")
            .style.setProperty("--beer-bubble-duration", duration);
        templateClone
            .querySelector(".beer-tap__bubble-container")
            .style.setProperty("--beer-bubble-x", getRandomInteger(1, 100));

        beerTapBar.querySelector(".beer-tap__liquid").append(templateClone);
    }

    return beerTapBar;
}

function getRandomInteger(min, max, range = null) {
    if (range) {
        // Return random integer with steps / range
        const steps = (max - min) / range + 1;
        return Math.floor(Math.random() * steps) * range + min;
    }
    // Return a random integer between min max parameters including min max
    return Math.floor(Math.random() * (max - min + 1) + min);
}
