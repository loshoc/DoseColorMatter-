//test.js
function parseNoGroup(raw) {
  const data = raw.map((d) => ({ //inside loop
    manufacturer: d.Manufacturer,
    model: d.Model,
    color: d.color,
    condition: d["Avg Condition "] * 1,
    refPrice: d["Avg. Reference Price"] * 1,
    price: d["Avg Selling Price (Used)"] * 1,
    year: d.Year
  }));

  data.forEach((d) => {
    d.priceDiff = d.price - d.refPrice;
    d.priceDiffRate = d.priceDiff / d.refPrice;
  });

    d3.select("body")
    .selectAll("p")
    .data(raw[1])
    .enter()
    .append("p")
      .text('new things')

  const groupedScatter0 = d3
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
          year:f.year
        };
      },

      (d) => [d.manufacturer, d.model].join(","),
      // (d) => console.log(d),
    )
    .map((d) => (d[1])); //console.log(d[1]).price this is the average price of each model
    // (d) => console.log(d)
    // console.log(groupedScatter0[1].price)

  const groupedScatter1 = d3
    .rollups(
      groupedScatter0,
      (v) => {
        v.sort((a, b) => a.condition - b.condition);
        return v;
      },
      (d) => d.manufacturer,
      // (a) => a.price
    )
    // console.log(groupedScatter1[1][1])
    .map((d) => ({manufacturer: d[0], modelCnt: d[1].length, models: d[1],price:d[1][0].price}));
    groupedScatter1.sort((a, b) => b.modelCnt - a.modelCnt)
    console.log(groupedScatter1)


  return groupedScatter1.slice(0, 20);
}

function parse(raw) {
  const data = raw.map((d) => ({
    manufacturer: d.Manufacturer,
    model: d.Model,
    color: d.color,
    condition: d["Avg Condition "] * 1,
    refPrice: d["Avg. Reference Price"] * 1,
    price: d["Avg Selling Price (Used)"] * 1,
    year: d.Year
  }));

  data.forEach((d) => {
    d.priceDiff = d.price - d.refPrice;
    d.priceDiffRate = d.priceDiff / d.refPrice;
  });

    d3.select("body")
    .selectAll("p")
    .data(raw[1])
    .enter()
    .append("p")
      .text('new things')

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
          year:f.year
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