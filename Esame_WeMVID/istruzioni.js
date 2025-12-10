"use strict"
const http = "http";
const uri = "dati.istat.it";
document.getElementById("fonte").href = http + "://" + uri; //concatenazione

const grafico = {
    h: Math.round(window.innerHeight * 0.9),
    w: Math.round(window.innerWidth * 0.9)
};
let dati;
let datiIniziali;
let territori;
let italia;
let anni;
let datiTemporali;
let altezzaAsseX = grafico.h * 0.2;

d3.csv("disoccupatiISTAT.csv", function (dataset) {
    dati = dataset;
    console.log(dati);
    const svg = d3.select("svg");
    svg.attr("width", grafico.w)
        .attr("height", grafico.h)
        .attr("class", "svg");

    const padding = 5;

    datiIniziali = dataset.filter(function (d) {
        if
            (d.TIME == "2023") return d
    });

    console.log(datiIniziali);

    territori = datiIniziali.map(function (d) { return d.Territorio });
    console.log(territori);

    const scalaY = d3.scaleBand()
        .domain(territori.sort(d3.ascending))
        .rangeRound([50, grafico.h - altezzaAsseX])

    const altezzaFasce = scalaY.bandwidth();
    const altezzaFont = Math.round(altezzaFasce / 2);
    const larghezzaFont = Math.round(altezzaFont / 2);
    const legenda = d3.max(territori, function (d) { return d.length }) * larghezzaFont;

    const scalaX = d3.scaleLinear()
        .domain([0, d3.max(datiIniziali, function (d) { return Math.trunc(Number(d.Value)) })])
        .rangeRound([0, grafico.w - legenda * 2]); // posizionato verso sx
    // scala Temporale
    italia = dataset.filter(function (d) { if (d.ITTER107 == "IT") return d })
    console.log(italia);
    anni = ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"];
    datiTemporali = italia.filter(function (d) { return anni.includes(d.TIME); })
    console.log(datiTemporali);

    const rettangoli = svg.selectAll("rect")
        .data(datiIniziali)
        .enter()
        .append("rect");

    rettangoli
        .attr("x", legenda)
        .attr("y", function (d) { return scalaY(d.Territorio) + padding * 3 }) //rect e text centrati
        .attr("height", Math.round(altezzaFasce * 2 / 3))
        .attr("width", "0")
        .attr("fill", "teal")
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .delay(function (d, i) { return i * 100 })
        .attr("width", function (d) { return Math.trunc(scalaX(d.Value)) }) //estensione barre
        ;

    svg.selectAll("text") // a destra delle barre
        .data(datiIniziali)
        .enter()
        .append("text")
        .attr("id", "testi1")
        .attr("class", "testi")
        .attr("style", "opacity:0")
        .attr("x", function (d) { return Math.trunc(scalaX(d.Value) + legenda + padding) })
        .attr("y", function (d) { return Math.round(scalaY(d.Territorio) + altezzaFasce * 5 / 9) }) //ancoraggio del testo
        .text(function (d) { return Math.trunc(Number(d.Value)).toLocaleString() })
        .attr("font-size", `${Math.round(altezzaFont / 3)}px`)
        .attr("font-family", 'Courier New, Courier, monospace')
        .attr("font-weight", "bold")
        .transition()
        .duration(1000)
        .attr("style", "opacity:1");

    const asseX = d3.axisBottom()
        .scale(scalaX);

    svg.append("g")
        .attr("class", "assi")
        .attr("id", "asseX")
        .attr("transform", `translate(${legenda}, ${Math.round(grafico.h * 0.8)})`)
        .attr("style", `font-size: ${Math.round(altezzaFont / 3)}px`)
        .call(asseX);

    let asseY = d3.axisLeft()
        .scale(scalaY);

    svg.append("g")
        .attr("class", "assi")
        .attr("id", "asseY")
        .attr("transform", `translate(${legenda},0)`)
        .attr("style", `font-size: ${Math.round(altezzaFont / 3)}px`) //grandezza territori
        .call(asseY);

    d3.selectAll("#asseY .tick text")
        .on("mouseover", function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("style", `font-size: ${Math.round(altezzaFont / 2)}px`)
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("style", `font-size: ${Math.round(altezzaFont / 3)}px`)
        });
    d3.select("body")
        .append("ul")
        .attr("class", "lista")
        .selectAll("li")
        .data(datiIniziali)
        .enter()
        .append("li")
        .text(function (d) {
            return d.Territorio
                + ": " + Number(d.Value).toLocaleString()
        });

    function aggiornaScalaY(datiTemporali) {
        altezzaAsseX = grafico.h * 0.1;
        scalaY.domain(datiTemporali.map(function (d) { return d.TIME }))
            .range([50, grafico.h - altezzaAsseX])
            .paddingInner(0.1);

        scalaX.domain([0, d3.max(datiTemporali, function (d) { return Math.trunc(Number(d.Value)) })])


        svg.select("#asseY")
            .call(asseY);
        svg.select("#asseX")

            .transition()
            .duration(1000)
            .attr("transform", `translate(${legenda}, ${Math.round(grafico.h * 0.9)})`)
            .call(asseX);

        let rettangoliAnni = svg.selectAll("rect")
            .data(datiTemporali);

        //elementi esistenti e aggiornamento
        rettangoliAnni
            .attr("x", legenda)
            .attr("y", function (d) { return scalaY(d.TIME) + padding; })
            .attr("height", Math.round(altezzaFasce / 2))
            .attr("width", "0")
            .attr("fill", "lightblue")

            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .delay(function (d, i) { return i * 100; })
            .attr("width", function (d) { return Math.trunc(scalaX(d.Value)); });

        // nuovi elementi
        rettangoliAnni.enter()
            .append("rect")
            .attr("x", legenda)
            .attr("y", function (d) { return scalaY(d.TIME) + padding; })
            .attr("height", Math.round(altezzaFasce / 2))
            .attr("width", "0")
            .attr("fill", "lightblue")
            .merge(rettangoliAnni)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .delay(function (d, i) { return i * 100; })
            .attr("width", function (d) { return Math.trunc(scalaX(d.Value)); });

        svg.selectAll(".assi").raise();
        //testi 
        let testiAnni = svg.selectAll(".testi")
            .data(datiTemporali);


        testiAnni
            .attr("x", function (d) { return Math.trunc(scalaX(d.Value)) + legenda + padding; })
            .attr("y", function (d) { return Math.round(scalaY(d.TIME) + altezzaFasce * 2 / 6) })
            .text(function (d) { return Math.trunc(Number(d.Value)).toLocaleString(); })
            .attr("style", "opacity:0")
            .attr("font-size", `${Math.round(altezzaFont / 3)}px`)
            .attr("font-family", 'Courier New, Courier, monospace')
            .attr("font-weight", "bold")
            .transition()
            .duration(1000)
            .attr("style", "opacity:1");

        testiAnni.enter()
            .append("text")
            .attr("id", "testi2")
            .attr("class", "testi")
            .attr("x", function (d) { return Math.trunc(scalaX(d.Value)) + legenda + padding; })
            .attr("y", function (d) { return Math.round(scalaY(d.TIME) + altezzaFasce * 2 / 6) })
            .text(function (d) { return Math.trunc(Number(d.Value)).toLocaleString(); })
            .attr("style", "opacity:0")
            .attr("font-size", `${Math.round(altezzaFont / 3)}px`)
            .attr("font-family", 'Courier New, Courier, monospace')
            .attr("font-weight", "bold")
            .merge(testiAnni)
            .transition()
            .duration(1000)
            .attr("style", "opacity:1");

        const listaTempo = d3.select(".lista")
            .selectAll("li") //seleziona li dentro .lista
            .data(datiTemporali);

        listaTempo.text(function (d) {
            return d.TIME
                + ": " + Number(d.Value).toLocaleString();

        })
            .attr("class", "listaTempo")
            .attr("style", "opacity:0")
            .transition()
            .duration(500)
            .attr("style", "opacity:1");
        listaTempo.enter()
            .append("li")
            .text(function (d) {
                return d.TIME
                    + ": " + Number(d.Value).toLocaleString();

            })
            .attr("class", "listaTempo")
            .attr("style", "opacity:0")
            .merge(listaTempo)
            .transition()
            .duration(500)
            .attr("style", "opacity:1");
    }

    d3.select("#scalaAnni")
        .on("click", function () {
            aggiornaScalaY(datiTemporali);
        });
    d3.select("#datiIniziali")
        .on("click", function () {
            altezzaAsseX = grafico.h * 0.2;
            scalaY.domain(datiIniziali.map(function (d) { return d.Territorio }))
                .range([50, grafico.h - altezzaAsseX])
                .paddingInner(0);
            scalaX.domain([0, d3.max(datiIniziali, function (d) { return Math.trunc(Number(d.Value)) })])


            svg.select("#asseY")
                .call(asseY);
            svg.select("#asseX")
                .transition()
                .duration(1000)
                .attr("transform", `translate(${legenda}, ${Math.round(grafico.h * 0.8)})`)
                .call(asseX);

            let rettangoliIniziali = svg.selectAll("rect")
                .data(datiIniziali);

            rettangoliIniziali
                .attr("x", legenda)
                .attr("y", function (d) { return scalaY(d.Territorio) + padding * 3; })
                .attr("height", Math.round(altezzaFasce * 2 / 3))
                .attr("width", "0")
                .attr("fill", "teal")
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .delay(function (d, i) { return i * 100; })
                .attr("width", function (d) { return Math.trunc(scalaX(d.Value)); });

            rettangoliIniziali.exit().remove();


            //testi 
            let testiIniziali = svg.selectAll(".testi")
                .data(datiIniziali);

            testiIniziali
                .attr("x", function (d) { return Math.trunc(scalaX(d.Value)) + legenda + padding; })
                .attr("y", function (d) { return Math.round(scalaY(d.Territorio) + altezzaFasce * 5 / 9) })
                .text(function (d) { return Math.trunc(Number(d.Value)).toLocaleString(); })
                .attr("style", "opacity:0")
                .attr("font-size", `${Math.round(altezzaFont / 3)}px`)
                .attr("font-family", 'Courier New, Courier, monospace')
                .attr("font-weight", "bold")
                .transition()
                .duration(1000)
                .attr("style", "opacity:1");
            testiIniziali.exit().remove();
            const listaIniziale = d3.select(".lista")
                .selectAll("li")
                .data(datiIniziali);

            listaIniziale.text(function (d) {
                return d.Territorio
                    + ": " + Number(d.Value).toLocaleString();
            })
            listaIniziale.exit().remove();
        });
});
