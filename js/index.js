// "Avg Condition ": "1"
// Avg Selling Price (Used): "500"
// Avg. Car Width: ""
// Avg. Reference Price: "200"
// Car Length: ""
// Count of interior: "1"
// Manufacturer: "Acura"
// Model: "Legend"
// Num of Car Sales for each model (in thousands: ""
// Power Performance factor: ""
// Year: "1993"
// color: "gold"
// percentage price difference from reference price: "1.5"
var dataScatter;

// var drag = d3.drag()
//     .origin(function(d) { return d; })
//     .on("dragstart", dragstarted)
//     .on("drag", dragged)
//     .on("dragend", dragended);
// var slider = d3.select("body").append("p").append("input")
//   .datum({})
//   .attr("type", "range")
//   .attr("value", zoom.scaleExtent()[0])
//   .attr("min", zoom.scaleExtent()[0])
//   .attr("max", zoom.scaleExtent()[1])
//   .attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100)
//   .on("input", slided);

var dataBarchart;
d3.csv("../data/carPrice2EditAll.csv").then((raw) => {
  dataScatter = parseColor(raw);
  dataBarchart = parse(raw);
  // console.log(dataScatter)

  d3.select(".containerScatter").append("div").attr("id", "dropDownMenuColor");
  d3.select(".containerScatter").append("div").attr("id", "dropDownMenuManu");

  initialiseColor(dataScatter);
  initialiseManu(dataScatter);
  makeChart(dataScatter);

  d3.select(".container").call(chart, raw);
  // d3.select(".containerScatter").call(scatterPlot,raw);
});

function chart(container, raw) {
  const data = parse(raw);
  const arcs = d3.pie().value((d) => d.modelCnt)(data);
  arcs.forEach((d, i) => {
    d.i = i;
  });

  //size
  const width = 900;
  const height = width;
  const pieMaxRadius = 700 * 0.5 * 0.7; // the first layer
  const barRadius = 750 * 0.5 * 0.85; // the second layer
  const lineRadius = 700 * 0.5 * 0.93;

  // mapping the condition to 100
  const conditionScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data.map((d) => d.models.map((dd) => dd.condition)).flat()),
    ])
    .nice()
    .range([0, 100]);

  const pieRadius = d3
    .scaleSqrt()
    .domain([0, d3.max(data, (d) => d.models.length)])
    .nice()
    .range([0, pieMaxRadius]);

  const absMaxDiffRate = d3.max(
    [
      ...data
        .map((d) =>
          d.models.map((dd) => dd.colors.map((ddd) => ddd.priceDiffRate))
        )
        .flat()
        .flat(),
      ...data.map((d) => d.models.map((dd) => dd.priceDiffRate)).flat(),
    ],
    (d) => Math.abs(d)
  );
  const offset = 150; // orginal is 70
  const diffRateScale = d3
    .scaleSqrt()
    .domain([-1 * absMaxDiffRate, absMaxDiffRate])
    .nice()
    .range([lineRadius - offset, lineRadius + offset]);

  //svg
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("overflow", "visible");

  const gInner = svg.append("g");

  gInner
    .append("g")
    .call(pie)
    .attr("transform", (d) => `translate(${width / 2},${height / 2})`);

  gInner
    .append("g")
    .call(bar)
    .attr("transform", (d) => `translate(${width / 2},${height / 2})`);

  const gTooltip = gInner.append("g").call(tooltip);
  const barTooltip = gInner.append("g").call(tooltip);
  const pieTooltip = gInner.append("g").call(tooltip);

  svg.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([1, 8])
      .on("zoom", zoomed)
  );

  gInner.call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  );

  function dragstarted() {
    d3.select(this).raise();
    // gInner.attr("cursor", "grabbing");
    // gInner.attr("transform", `translate(0,1000)`);
  }

  function dragged(event, d) {
    d3.select(this).attr("cx", event.x).attr("cy", event.y);
  }

  function dragended() {
    gInner.attr("cursor", "grab");
  }

  function zoomed({ transform }) {
    gInner.attr("transform", transform);
  }

  return svg.node();

  function tooltip(g) {
    g.attr("visibility", "hidden");
    g.append("foreignObject")
      .attr("width", 400)
      .attr("height", 220)
      .append("xhtml:div")
      .attr("class", "container")
      .style("background-color", "#dcdcdc")
      .style("font-size", 14)
      .style("font-family", "DIN")
      .style("padding", "5px 8px 5px 8px");

  }

  function pie(g) {
    const arcGenerator = d3
      .arc()
      .outerRadius((d) => pieRadius(d.data.modelCnt));

    const arcGenText = d3
    .arc()
    .innerRadius((d) => pieRadius(d.data.modelCnt))


    // color of the pie chart

    const color = d3
      .scaleSqrt()
      .domain(d3.extent(arcs, (d) => d.data.modelCnt))
      .range(["#FFD990", "#FD995B"]);

    const fontSizeAd = d3
    .scaleSqrt()
    .domain(d3.extent(arcs, (d) => d.data.modelCnt))
    .range([100,700])

    g.selectAll("path.fill")
      .data(arcs)
      .join("path")
      .attr("class", "fill")
      .attr("stroke", "none")
      .attr("fill", (d) => color(d.data.modelCnt))
      .attr("d", (d) => arcGenerator.innerRadius(0)(d))
      .on("mouseover", function (e, d) {
        d3.select(this).attr("fill", "#E22523");
      })
      .on("mouseout", function (e, d) {
        d3.select(this).attr("fill", color(d.data.modelCnt));
      })
      .on("click", function (e, d) {
        d3.select("#dropDownMenuManu")
          .select("select")
          .property("value", d.data.manufacturer);
        console.log(d.data.manufacturer);
        filteredData = filterDataManu(dataScatter, d.data.manufacturer);
        makeChart(filteredData);
      });


    g.selectAll("path.stroke")
      .data(arcs)
      .join("path")
      .attr("class", "stroke")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("d", (d) =>
        arcGenerator.innerRadius((d) => pieRadius(d.data.modelCnt))(d)
      );

    
    g.selectAll("circle")
      .data(pieRadius.ticks())
      .join("circle")
      .attr("fill", "none")
      .attr("stroke", "lightgrey")
      .attr("opacity", 0.3)
      .attr("r", (d) => pieRadius(d));
      g.selectAll("text")
      .data(arcs)
      .enter()
      .append("text")
      .style("font-size", 9.5)
      .attr("font-family", "DIN")
      .attr("font-weight", (d) => fontSizeAd(d.data.modelCnt))      
      .style("text-anchor", "middle")
      .attr("fill", "black")
      .attr(
        "transform",
        (d) => `translate(${arcGenerator.centroid(d)}) rotate(${angle(d)})`
      )
      .text(function (d) {
        return d.data.manufacturer;
      });

    function angle(d) {
      var a = ((d.startAngle + d.endAngle) * 90) / Math.PI - 90;
      return a > 90 ? a - 180 : a;
    }
  }
  

  // second layer of bar chart
  function bar(g) {
    const bandScales = arcs.map((d) =>
      d3
        .scaleBand()
        .domain(d.data.models.map((d) => d.id))
        .range([d.startAngle, d.endAngle])
    );

    const arcGenerator = d3
      .arc()
      .startAngle(
        (d) => bandScales[d.iArc](d.id) - bandScales[d.iArc].bandwidth() / 2
      )
      .endAngle(
        (d) => bandScales[d.iArc](d.id) + bandScales[d.iArc].bandwidth() / 2
      )
      .innerRadius((d) => barRadius - conditionScale(d.condition))
      .outerRadius(barRadius)

    const item = g.selectAll("g").data(arcs).enter().append("g");

    item
      .selectAll("path.area")
      .data((d) => d.data.models.map((dd) => ({ ...dd, iArc: d.i })))
      .join("path")
      .attr("class", "area")
      .attr("fill", "#f5f5f5") // the color of the radial line background
      .attr("stroke", "#f5f5f5")
      .attr("d", arcGenerator.outerRadius(barRadius + 150));

    item
      .selectAll("path.mark")
      .data((d) => d.data.models.map((dd) => ({ ...dd, iArc: d.i })))
      .join("path")
      .attr("class", "mark")
      .attr("fill", "#D3D3D3")
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("d", arcGenerator.outerRadius(barRadius));

    item
      .selectAll("circle.mark")
      .data((d) => {
        return d.data.models
          .map((dd) =>
            dd.colors.map((ddd) => ({ ...ddd, id: dd.id, iArc: d.i }))
          )
          .flat();
      })
      .join("circle")
      .attr("class", "mark")
      .attr("fill", (d) => d.color)
      .attr("stroke", "none")
      .attr("cx", (d) =>
        polarToCartesianX(
          diffRateScale(d.priceDiffRate),
          bandScales[d.iArc](d.id)
        )
      )
      .attr("cy", (d) =>
        polarToCartesianY(
          diffRateScale(d.priceDiffRate),
          bandScales[d.iArc](d.id)
        )
      )
      .attr("r", 1.5);

    //
    g.selectAll("circle.mark")
      .on("mouseover", function (e, dd) {
        handlemouseover(e, dd);

        const [x, y] = d3.pointer(e);
        gTooltip
          .attr("visibility", "visible")
          .attr(
            "transform",
            `translate(${width / 2 + x + 40},${height / 2 + y + 5})`
          );

        gTooltip
          .select(".container")
          .selectAll("div")

          .data([
            { label: "Manufacturer", value: dd.manufacturer },
            { label: "Model", value: dd.model },
            { label: "Color", value: dd.color },
            { label: "Ref. Price", value: d3.format(".1f")(dd.refPrice) },
            { label: "Price", value: d3.format(".1f")(dd.price) },
            {
              label: "Price growth rate",
              value: d3.format(".0%")(dd.priceDiffRate),
            },
          ])
          .join("div")
          .text((d) => d.label + ":  " + d.value);
      })
      .on("mouseout", function (e, dd) {
        handlemouseout(e, dd);
        gTooltip.attr("visibility", "hidden");
      });

    g.selectAll("path.mark")
      // .on("mouseover", handlemouseover)
      // .on("mouseout", handlemouseout);
      .on("mouseover", function (e, dd) {
        handlemouseover(e, dd);

        const [x, y] = d3.pointer(e);
        gTooltip
          .attr("visibility", "visible")
          .attr(
            "transform",
            `translate(${width / 2 + x + 40},${height / 2 + y + 5})`
          );
        
          const f = d3.format(".1f");
        gTooltip
          .select(".container")

          .selectAll("div")
          .data([
            { label: "Manufacturer", value: dd.manufacturer },
            { label: "Model", value: dd.model },

            { label: "Ref. Price", value: d3.format(".1f")(dd.refPrice) },
            { label: "Price", value: d3.format(".1f")(dd.price) },
            {
              label: "Price growth rate",
              value: d3.format(".0%")(dd.priceDiffRate),
            },
          ])
          .join("div")
          .text((d) => d.label + ":  " + d.value);
      })
      .on("mouseout", function (e, dd) {
        handlemouseout(e, dd);
        gTooltip.attr("visibility", "hidden");
      });
    /**
     * click to show the scatter plot
     */
    // .on("mouseclick")
    // show the scatter plot

    g.selectAll(".area")
      .on("mouseover", handlemouseover)
      .on("mouseout", handlemouseout);

    function handlemouseover(e, dd) {
      g.selectAll(".mark")
        .filter((d) => d.manufacturer == dd.manufacturer && d.model == dd.model)
        .attr(
          "transform",
          (d) =>
            `translate(${polarToCartesianX(
              30,
              bandScales[d.iArc](d.id)
            )},${polarToCartesianY(30, bandScales[d.iArc](d.id))})`
        );

      g.selectAll("circle.mark")
        .filter((d) => d.manufacturer == dd.manufacturer && d.model == dd.model)
        .attr("r", 3);
    }

    function handlemouseout(e, dd) {
      g.selectAll(".mark")
        .filter((d) => d.manufacturer == dd.manufacturer && d.model == dd.model)
        .attr("transform", (d) => `translate(${0},${0})`);

      g.selectAll("circle.mark")
        .filter((d) => d.manufacturer == dd.manufacturer && d.model == dd.model)
        .attr("r", 1.5);
    }
  }

  function polarToCartesianX(dist, angle) {
    return dist * Math.sin(angle);
  }

  function polarToCartesianY(dist, angle) {
    return dist * Math.cos(angle) * -1;
  }
}

var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 40,
};

function makeChart(dataScatter) {
  d3.select(".containerScatter svg").remove();
  let margin = 50;
  let width = 1350;
  let height = 350;
  let extent_year = d3.extent(dataScatter, (d) => parseFloat(d.year));
  let extent_price = d3.extent(dataScatter, (d) => parseFloat(d.price));
  // console.log(extent_year);

  let x_scale = d3
    .scaleLinear()
    .range([margin, width - margin])
    .domain([1980, extent_year[1]]);
  let y_scale = d3
    .scaleLinear()
    .range([height - margin, margin])
    .domain([0, extent_price[1]]);
  let x_axis = d3.axisBottom(x_scale);
  let y_axis = d3.axisLeft(y_scale);
  let scatterplot_SVG = d3
    .select(".containerScatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  scatterplot_SVG
    .selectAll("circle")
    .data(dataScatter)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("cx", (d) => x_scale(parseFloat(d.year)))
    .attr("cy", (d) => y_scale(parseFloat(d.price)))
    .attr("r", (d) => d.condition)
    .style("fill", (d) => d.color)
    .on("mouseover", (e, d) => {
      console.log(d.price);
      d3.select(".containerScatter svg")
        .append("text")
        .attr("class", "scatterTooltip")
        .text(d.manufacturer)
        .attr("x", x_scale(parseFloat(d.year)) + 10)
        .attr("y", y_scale(parseFloat(d.price)) + 10);
    })
    .on("mouseout", (e, d) => {
      d3.selectAll(".scatterTooltip").remove();
    });
  d3.select(".containerScatter svg")
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height - margin})`)
    .style("font-family", "DIN")
    .call(x_axis);
  d3.select(".containerScatter svg")
    .append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin},0)`)
    .style("font-family", "DIN")
    .call(y_axis);
  d3.select(".x.axis") //styling
    .append("text")
    //.text("year")
    .style("fill", "black")
    .style("font-family", "DIN")
    .attr("x", (width - margin) / 2)
    .attr("y", margin - 10);
  d3.select(".y.axis")
    .append("text")
    .style("font-family", "DIN")
    //.text("Average price of the color in the year")
    .style("fill", "black")
    .attr("transform", `rotate(-90,0,${margin - 10}) translate(${-margin},0)`);
}

function initialiseColor(dataScatter) {
  // console.log(dataScatter)
  dataScatter = dataScatter.filter(function (a) {
    return a.color != "";
  });
  let nestByColor = d3.group(dataScatter, (d) => d.color).entries(dataScatter);
  // console.log(dataScatter)

  console.log(nestByColor);
  let dropDownMenuColor = d3.select("#dropDownMenuColor");
  dropDownMenuColor
    .append("select")
    .selectAll("option")
    .data(nestByColor)
    .enter()
    .append("option")
    .attr("value", (d) => d[0])
    .text((d) => d[0]);
  dropDownMenuColor.on("change", function (e, d) {
    let menuItemColor = d3.select(this).select("select").property("value");
    console.log(menuItemColor);
    filteredDataColor = filterDataColor(dataScatter, menuItemColor);
    makeChart(filteredDataColor);
  });
  dropDownMenuColor
    .select("select")
    .append("option")
    .attr("value", "All")
    .text("All");
  dropDownMenuColor.select("select").property("value", "All");
}

function filterDataColor(dataScatter, color) {
  let filteredDataColor = JSON.parse(JSON.stringify(dataScatter));
  console.log(filteredDataColor);
  if (color != "All") {
    filteredDataColor = filteredDataColor.filter((d) => d.color == color);
  }

  console.log(filteredDataColor);
  return filteredDataColor;
}

function filterDataManu(dataScatter, make) {
  let filteredDataManu = JSON.parse(JSON.stringify(dataScatter));
  console.log(filteredDataManu);
  if (make != "All") {
    filteredDataManu = filteredDataManu.filter((d) => d.manufacturer == make);
  }
  console.log(filteredDataManu);
  return filteredDataManu;
}

function parseColor(raw) {
  const data = raw.map((d) => ({
    manufacturer: d.Manufacturer,
    model: d.Model,
    color: d.color,
    condition: d["Avg Condition "] * 1,
    refPrice: d["Avg. Reference Price"] * 1,
    price: d["Avg Selling Price (Used)"] * 1,
    year: d.Year,
  }));
  data.forEach((d) => {
    d.priceDiff = d.price - d.refPrice;
    d.priceDiffRate = d.priceDiff / d.refPrice;
  });
  const grouped0 = d3
    .rollups(
      data.filter((d) => d.refPrice < 50000 && Math.abs(d.priceDiffRate) <= 5),
      (v) => {
        const f = v[0];
        const refPrice = d3.mean(v, (d) => d.refPrice);
        const price = d3.mean(v, (d) => d.price);
        return {
          color: f.color,
          condition: d3.mean(v, (d) => d.condition),
          refPrice: refPrice,
          price: price,
          priceDiff: price - refPrice,
          priceDiffRate: (price - refPrice) / refPrice,
          year: f.year,
          manufacturer: f.manufacturer,
          model: f.model,
        };
      },
      (d) => [d.color, d.year, d.manufacturer].join(",")
    )
    .map((d) => d[1]);
  // console.log(grouped0);
  const grouped1 = d3
    .rollups(grouped0, (v) => {
      v.sort((a, b) => d3.ascending(a.color, b.color));
      v.splice(0, 23);
      return v;
    })
    .map((d) => ({
      year: d.year,
      color: d.color,
      price: d.price,
      manufacturer: d.manufacturer,
      condition: d.condition,
    }));
  // console.log(grouped1);
  // console.log(grouped1)

  return grouped1;
}

function initialiseManu(dataScatter) {
  // console.log(dataScatter)
  dataScatter = dataScatter.filter(function (a) {
    return a.manufacturer != "";
  });
  let nestByManu = d3
    .group(dataScatter, (d) => d.manufacturer)
    .entries(dataScatter);
  // console.log(dataScatter)

  console.log(nestByManu);
  let dropDownMenuManu = d3.select("#dropDownMenuManu");

  dropDownMenuManu
    .append("select")
    .selectAll("option")
    .data(nestByManu)
    .enter()
    .append("option")
    .attr("value", (d) => d[0])
    .text((d) => d[0]);

  dropDownMenuManu.on("change", function (e, d) {
    let menuItem = d3.select(this).select("select").property("value");
    console.log(menuItem);
    filteredDataColor = filterDataManu(dataScatter, menuItem);
    makeChart(filteredDataColor);
  });
  dropDownMenuManu
    .select("select")
    .append("option")
    .attr("value", "All")
    .text("All");
  dropDownMenuManu.select("select").property("value", "All");
}

function parse(raw) {
  const data = raw.map((d) => ({
    manufacturer: d.Manufacturer,
    model: d.Model,
    color: d.color,
    condition: d["Avg Condition "] * 1,
    refPrice: d["Avg. Reference Price"] * 1,
    price: d["Avg Selling Price (Used)"] * 1,
    year: d.Year,
    nums: d["Num of Car Sales for each model (in thousands"] * 1,
  }));

  data.forEach((d) => {
    d.priceDiff = d.price - d.refPrice;
    d.priceDiffRate = d.priceDiff / d.refPrice;
  });

  const grouped0 = d3
    .rollups(
      data.filter((d) => d.refPrice < 50000 && Math.abs(d.priceDiffRate) <= 5),
      (v) => {
        const f = v[0];

        const refPrice = d3.mean(v, (d) => d.refPrice);
        const price = d3.mean(v, (d) => d.price);

        return {
          id: f.manufacturer + f.model,
          manufacturer: f.manufacturer,
          model: f.model,
          condition: d3.mean(v, (d) => d.condition),
          refPrice: refPrice,
          price: price,
          priceDiff: price - refPrice,
          priceDiffRate: (price - refPrice) / refPrice,
          colors: v,
        };
      },
      (d) => [d.manufacturer, d.model].join(",")
    )
    .map((d) => d[1]);

  const grouped1 = d3
    .rollups(
      grouped0,
      (v) => {
        v.sort((a, b) => a.condition - b.condition);
        return v;
      },
      (d) => d.manufacturer
    )
    .map((d) => ({ manufacturer: d[0], modelCnt: d[1].length, models: d[1] }));

  grouped1.sort((a, b) => b.modelCnt - a.modelCnt);

  return grouped1.slice(0, 20);
}
