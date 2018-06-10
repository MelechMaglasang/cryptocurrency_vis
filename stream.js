var y_1st,
        x_1st,
        z,
        svg_1st;

var area_1st;

var layers,
        layers1,
        layers0;

var parse = d3.timeParse("%b %d, %Y"),
        parseTrend = d3.timeParse("%m/%d/%Y"),
        parseProblems = d3.timeParse("%d-%b-%Y"),
        parseProblems2 = d3.timeParse("%Y-%m-%d"),
        parseProblems3 = d3.timeParse("%d-%b-%y");

var toggle = false;

var count = -1,
        count2 = -1;

var masterArray = [],
        masterArray2 = [];
var max;
var currIndex = 7;

var currencyNames = ["Ethereum Classic", "Ripple", "Litecoin", "Dash", "Iota",
    "Ethereum", "Bitcoin Cash", "Bitcoin"];

var dataColumns,
        dataNames;

//value holder for radio buttons
var chosenMetric = "Open",
        current;


d3.queue()
//Pricing Data CSVs
        .defer(d3.csv, "bitcoin_price.csv")
        .defer(d3.csv, "bitcoin_cash_price.csv")
        .defer(d3.csv, "ethereum_price.csv")
        .defer(d3.csv, "iota_price.csv")
        .defer(d3.csv, "dash_price.csv")
        .defer(d3.csv, "litecoin_price.csv")
        .defer(d3.csv, "ripple_price.csv")
        .defer(d3.csv, "ethereum_classic_price.csv")
//Google Search Trend CSVs
        .defer(d3.csv, "bitcoinTrend.csv")
        .defer(d3.csv, "bitcoin_cashTrend.csv")
        .defer(d3.csv, "ethereumTrend.csv")
        .defer(d3.csv, "iotaTrend.csv")
        .defer(d3.csv, "dashTrend.csv")
        .defer(d3.csv, "litecoinTrend.csv")
        .defer(d3.csv, "rippleTrend.csv")
        .defer(d3.csv, "ethereum_classicTrend.csv")

        .await(function (error, bitcoinData, bitcoincashData, ethereumData,
                iotaData, dashData, litecoinData, rippleData, ethereumclassicData,
                bitcoinTrendData, bitcoincashTrendData, ethereumTrendData,
                iotaTrendData, dashTrendData, litecoinTrendData,
                rippleTrendData, ethereumclassicTrendData) {
            if (error)
                throw error;

//Parse pricing data for streamgraph

            [bitcoinData, ethereumData, iotaData, dashData, litecoinData].forEach(function (d) {
                d.forEach(function (b) {
                    b.Date = parse(b.Date);
                    b.Open = +b.Open,
                            b.High = +b.High,
                            b.Low = +b.Low,
                            b.Close = +b.Close,
                            b.Volume = +(b.Volume.replace(/,/g, "")),
                            b.Market_Cap = +(b.Market_Cap.replace(/,/g, ""));
                    return b;
                });
            });

            [bitcoincashData, ethereumclassicData, rippleData].forEach(function (d) {
                d.forEach(function (b) {
                    b.Date = parseProblems3(b.Date);
                    b.Open = +b.Open,
                            b.High = +b.High,
                            b.Low = +b.Low,
                            b.Close = +b.Close,
                            b.Volume = +(b.Volume.replace(/,/g, "")),
                            b.Market_Cap = +(b.Market_Cap.replace(/,/g, ""));
                    return b;
                });
            });

//Parse Google Trend data for multi-line graph (Weeks instead of days); has
            [bitcoinTrendData, ethereumTrendData, iotaTrendData,
                dashTrendData, rippleTrendData, litecoinTrendData,
                ethereumclassicTrendData].forEach(function (d) {
                d.forEach(function (b) {
                    b.Date = parseTrend(b.Week),
                            b.popIndex = +b.popIndex;
                    return b;
                });
            });

            [bitcoincashTrendData].forEach(function (d) {
                d.forEach(function (b) {
                    b.Date = parseProblems2(b.Week),
                            b.popIndex = +b.popIndex;
                    return b;
                });
            });

            var n = 8, // number of layers
                    m = 500, // number of samples per layer
                    k = 500; // number of bumps per layer
            [bitcoinData, bitcoincashData, ethereumData, iotaData, dashData, litecoinData, rippleData, ethereumclassicData].forEach(function (d) {

                for (i = 0; i < m; i++) {
                    if (d.length <= i) {
                        masterArray.push(0);
                        masterArray2.push(0);
                    } else {
                        masterArray.push(d[i].Market_Cap);
                        if (d === bitcoinData) {
                            masterArray2.push(0);
                        } else {
                            masterArray2.push(d[i].Market_Cap);
                        }
                    }

                }
            });

            dataColumns = bitcoinData.columns.splice(1, 7);

            dataNames = ["Opening Price", "24-Hour High Price", "24-Hour Low Price", "Closing Price",
                "Volume", "Market Cap"];

//for redrawing 2nd graph
            var priceNames = [ethereumclassicData, rippleData, litecoinData, dashData,
                iotaData, ethereumData, bitcoincashData, bitcoinData],
                    searchNames = [ethereumclassicTrendData, rippleTrendData,
                        litecoinTrendData, dashTrendData, iotaTrendData,
                        ethereumTrendData, bitcoincashTrendData, bitcoinTrendData];

            max = d3.max(masterArray2);

            var stack = d3.stack().keys(d3.range(n)).offset(d3.stackOffsetWiggle);
            layers0 = stack(d3.transpose(d3.range(n).map(function () {
                return bumps(m, k);
            })));
            layers1 = stack(d3.transpose(d3.range(n).map(function () {
                return bumps2(m, k);
            })));

            svg_1st = d3.select("#svg_1st");

            var margin = {top: 80, right: 80, bottom: 80, left: 80},
                    width_1st = +svg_1st.attr("width") - margin.left - margin.right,
                    height_1st = +svg_1st.attr("height") - margin.top - margin.bottom;

            svg_1st = d3.select("#svg_1st")
                    .attr("width", width_1st + margin.left + margin.right)
                    .attr("height", height_1st + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            x_1st = d3.scaleLinear()
                    .domain([0, m - 1]) //m-1
                    .range([0, width_1st]);

            x_dates = d3.scaleTime().domain(d3.extent(bitcoinData, function (d) {
                return d.Date;
            })).range([0, width_1st]);
            xdatesAxis = d3.axisBottom(x_dates).tickSize(-height_1st);


            y_1st = d3.scaleLinear()
                    .domain([d3.min(layers0, stackMin), d3.max(layers0, stackMax)])
                    .range([height_1st, 0]);

            z = d3.scaleOrdinal(d3.schemeDark2).domain(currencyNames);

            area_1st = d3.area()

                    .x(function (d, i) {
                        return x_1st(i);
                    })
                    .y0(function (d) {
                        return (y_1st(d[0]));
                    })
                    .y1(function (d) {
                        return (y_1st(d[1]));
                    });

            svg_1st.selectAll("path")
                    .data(layers0)
                    .enter().append("path")
                    .attr("d", area_1st)
                    .attr("fill", function () {
                        count += 1;
                        return z(currencyNames[count]);
                    })
                    .on("click", function (d) {
                        current = currencyNames[d.index];
                        currIndex = d.index;
                        updateData(d.index);
                    })
                    .append("title")
                    .text(function () {
                        count2 += 1;
                        return currencyNames[count2];
                    });


            svg_1st.append("g")
                    .attr("class", "x axis")
                    //.attr('transform', "translate(0," + width_1st + ")rotate(90)")
                    .attr("transform", "translate(0," + height_1st + ")")
                    .style("fill", "#fff")
                    .call(xdatesAxis);

            d3.select("button")
                    .on("click", toggleBitcoin);
            updateData(currIndex);

//Radio Buttons
            d3.select("#CryptoDiv").selectAll("input")
                    .data(dataColumns)
                    .enter()
                    .append("label")
                    .text(function (d) {
                        return dataNames[dataColumns.indexOf(d)];
                    })
                    .insert("input")
                    .attr("type", "radio")
                    .attr("value", function (d) {
                        return d;
                    })
                    .attr("name", "cryptoRadio")
                    .on("change", function (d) {
                        chosenMetric = d;
                        updateData(currIndex);
                        
                    });

            function bumps(n, m) {
                var a = [], i;

                for (i = 0; i < n; ++i) {
                    a[i] = 0;
                }
                ;
                for (i = 0; i < m; ++i) {
                    a[i] = masterArray.pop(0);
                }
                ;

                return a;
            }

            function bumps2(n, m) {
                var a = [], i;

                for (i = 0; i < n; ++i) {
                    a[i] = 0;
                }
                ;
                for (i = 0; i < m; ++i) {
                    a[i] = masterArray2.pop(0);
                }
                ;

                return a;
            }

//ON CLICK DATA
            function updateData(index) {

                var svg_2nd = d3.select("#svg_2nd"),
                        width_2nd = +svg_2nd.attr("width") - margin.left - margin.right,
                        height_2nd = +svg_2nd.attr("height") - margin.top - margin.bottom;
                svg_2nd.selectAll('*').remove();

                var x_2nd = d3.scaleTime().range([0, width_2nd]),
                        y_2nd = d3.scaleLinear().range([height_2nd, 0]),
                        y2_2nd = d3.scaleLinear().range([height_2nd, 0]),
                        xAxis = d3.axisBottom(x_2nd).tickSize(-height_2nd),
                        yAxis = d3.axisRight(y_2nd).tickArguments(4),
                        y2Axis = d3.axisLeft(y2_2nd).tickArguments(4);

                var line = d3.line()
                        .curve(d3.curveMonotoneX)
                        .x(function (d) {
                            return x_2nd(d.Date);
                        })
                        .y(function (d) {
                            return y_2nd(d[chosenMetric]);
                        });

                var line2 = d3.line()
                        .curve(d3.curveMonotoneX)
                        .x(function (d) {
                            return x_2nd(d.Date);
                        })
                        .y(function (d) {
                            return y2_2nd(d.popIndex);
                        });


                var values = priceNames[index].filter(function (d) {
                    return d;
                });


                var searchPop = searchNames[index].filter(function (d) {
                    return d;
                });



                // Compute the minimum and maximum date, and the maximum price.
                x_2nd.domain([values[values.length - 1].Date, values[0].Date]);

                y_2nd.domain([0, d3.max(values, function (d) {
                        return d[chosenMetric];
                    })]).nice();
                y2_2nd.domain([0, d3.max(searchPop, function (d) {
                        return d.popIndex;
                    })]).nice();

                // Add an SVG element with the desired dimensions and margin.
                var svg_2nd = d3.select("#svg_2nd")
                        .attr("width", width_2nd + margin.left + margin.right)
                        .attr("height", height_2nd + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // Add the clip path.
                svg_2nd.append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("width", width_2nd)
                        .attr("height", height_2nd);

                // Add the x-axis.
                svg_2nd.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height_2nd + ")")
                        .call(xAxis);

                // Add the y-axis.
                svg_2nd.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + width_2nd + ",0)")
                        .call(yAxis);

                //Add second y-axis     
                svg_2nd.append("g")
                        .attr("class", "y axis")
                        //.attr("transform", "translate(" + width + width_2nd + ",0)")
                        .call(y2Axis);

                svg_2nd.selectAll("text")//title
                        .attr("fill", "#fff");
                svg_2nd.selectAll('.line')
                        .data([values, searchPop])
                        .enter()
                        .append('path')
                        .attr('class', 'line')
                        .style('stroke',
                                function (d) {
                                    if (d === values) {
                                        return '#ee6047';
                                    } else {
                                        return '#e5f948';
                                    }
                                }
                        )
                        .attr('clip-path', 'url(#clip)')
                        .attr('d', function (d) {
                            if (Object.keys(d[0]).length === 3) {
                                return line2(d);
                            } else {
                                return line(d);
                            }
                        })
                        .append("title")
                        .text(function (d) {
                            if (Object.keys(d[0]).length === 3) {
                                return "Google Trends";
                            } else {
                                return current;
                            }
                        });
                svg_2nd.append("g")
                        .append("text")
                        .attr("transform",
                                "translate(" + (width_2nd / 2) + " ," +
                                (margin.bottom + 185) + ")")
                        .style("text-anchor", "middle")
                        .attr("fill", "#fff")
                        .attr("font-weight", "bold")
                        .attr("font-size", "18px")
                        .text("Time");

                svg_2nd.append("g")
                        .append("text")
                        .attr("transform",
                                "translate(" + (width_2nd - 60) + " ," +
                                (margin.top - 93) + ")")
                        .style("text-anchor", "right")
                        .attr("fill", "#fff")
                        .attr("font-weight", "bold")
                        .attr("font-size", "18px")
                        .text(function () {
                            if (chosenMetric === "Volume") {
                                return "Coins or Tokens";
                            } else if (chosenMetric === "Market_Cap") {
                                return "Market Cap";
                            } else {
                                return "Price (USD)";
                            }
                            ;
                        });

                svg_2nd.append("g")
                        .append("text")
                        .attr("transform",
                                "translate(" + (-20) + " ," +
                                (margin.top - 93) + ")")
                        .style("text-anchor", "left")
                        .attr("fill", "#fff")
                        .attr("font-weight", "bold")
                        .attr("font-size", "18px")
                        .text("Google Popularity Index");

                svg_2nd.append("g")
                        .append("text")
                        .attr("transform",
                                "translate(" + (width_2nd / 2) + " ," +
                                (margin.top - 120) + ")")
                        .style("text-anchor", "middle")
                        .attr("fill", "#fff")
                        .attr("font-weight", "bold")
                        .attr("font-size", "26px")
                        .text(`${currencyNames[index]}: Popularity vs ${dataNames[dataColumns.indexOf(chosenMetric)]}`);


                /* Add 'curtain' rectangle to hide entire graph */
                var curtain = svg_2nd.append('rect')
                        .attr('x', -1 * width_2nd)
                        .attr('y', -1 * height_2nd)
                        .attr('height', height_2nd)
                        .attr('width', width_2nd)
                        .attr('class', 'curtain')
                        .attr('transform', 'rotate(180)')
                        .style('fill', '#26292E');

                /* Optionally add a guideline */
                var guideline = svg_2nd.append('line')
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 1)
                        .attr('class', 'guide')
                        .attr('x1', 1)
                        .attr('y1', 1)
                        .attr('x2', 1)
                        .attr('y2', height_2nd);

                /* Create a shared transition for anything we're animating */
                var t = svg_2nd.transition()
                        .duration(600)
                        .ease(d3.easeLinear)
                        .on('end', function () {
                            d3.select('line.guide')
                                    .transition()
                                    .style('opacity', 0)
                                    .remove();
                        });

                t.select('rect.curtain')
                        .attr('width', 0);
                t.select('line.guide')
                        .attr('transform', 'translate(' + width_2nd + ', 0)');

                d3.select("#show_guideline").on("change", function (e) {
                    guideline.attr('stroke-width', this.checked ? 1 : 0);
                    curtain.attr("opacity", this.checked ? 0.75 : 1);
                });

            }

            function toggleBitcoin() {
                var t;
                (t = layers1, layers1 = layers0, layers0 = t)
                count = -1;
                count2 = -1;
                svg_1st.selectAll("*").remove();
                y_1st.domain([d3.min(t, stackMin), d3.max(t, stackMax)]);


                svg_1st.selectAll("path")
                        .data(t)

                        .enter().append("path")
                        .attr("d", area_1st)
                        .attr("fill", function () {
                            count += 1;
                            return z(currencyNames[count]);
                        })
                        .on("click", function (d) {
                            current = currencyNames[d.index];
                            currIndex = (d.index);
                            updateData(d.index);
                        })
                        .append("title")
                        .text(function () {
                            count2 += 1;
                            return currencyNames[count2];
                        });
                svg_1st.append("g")
                        .attr("class", "x axis")

                        .attr("transform", "translate(0," + height_1st + ")")
                        .style("fill", "#fff")
                        .call(xdatesAxis);

            }
            
        });

function stackMax(layer) {
    return d3.max(layer, function (d) {
        return d[1];
    });
}

function stackMin(layer) {
    return d3.min(layer, function (d) {
        return d[0];
    });
}
