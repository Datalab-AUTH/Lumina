import React, { Component } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import CardNer from "./CardNer"
import 'leaflet/dist/leaflet.css'



const dataset1 = `Overall rank,Country or region,Score,GDP capita,Social support,Healthy life expectancy,Freedom to make life choices,Generosity,Perceptions of corruption
1,Finland,7.769,1.340,1.587,0.986,0.596,0.153,0.393
2,Denmark,7.600,1.383,1.573,0.996,0.592,0.252,0.410
3,Norway,7.554,1.488,1.582,1.028,0.603,0.271,0.341
4,Iceland,7.494,1.380,1.624,1.026,0.591,0.354,0.118
5,Netherlands,7.488,1.396,1.522,0.999,0.557,0.322,0.298
6,Switzerland,7.480,1.452,1.526,1.052,0.572,0.263,0.343
7,Sweden,7.343,1.387,1.487,1.009,0.574,0.267,0.373
8,New Zealand,7.307,1.303,1.557,1.026,0.585,0.330,0.380
9,Canada,7.278,1.365,1.505,1.039,0.584,0.285,0.308
10,Austria,7.246,1.376,1.475,1.016,0.532,0.244,0.226
11,Australia,7.228,1.372,1.548,1.036,0.557,0.332,0.290
12,Costa Rica,7.167,1.034,1.441,0.963,0.558,0.144,0.093
13,Israel,7.139,1.276,1.455,1.029,0.371,0.261,0.082
14,Luxembourg,7.090,1.609,1.479,1.012,0.526,0.194,0.316
15,United Kingdom,7.054,1.333,1.538,0.996,0.450,0.348,0.278
16,Ireland,7.021,1.499,1.553,0.999,0.516,0.298,0.310
17,Germany,6.985,1.373,1.454,0.987,0.495,0.261,0.265
18,Belgium,6.923,1.356,1.504,0.986,0.473,0.160,0.210
19,United States,6.892,1.433,1.457,0.874,0.454,0.280,0.128
20,Czech Republic,6.852,1.269,1.487,0.920,0.457,0.046,0.036
21,United Arab Emirates,6.825,1.503,1.310,0.825,0.598,0.262,0.182
22,Malta,6.726,1.300,1.520,0.999,0.564,0.375,0.151
23,Mexico,6.595,1.070,1.323,0.861,0.433,0.074,0.073
24,France,6.592,1.324,1.472,1.045,0.436,0.111,0.183
25,Taiwan,6.446,1.368,1.430,0.914,0.351,0.242,0.097
26,Chile,6.444,1.159,1.369,0.920,0.357,0.187,0.056
27,Guatemala,6.436,0.800,1.269,0.746,0.535,0.175,0.078
28,Saudi Arabia,6.375,1.403,1.357,0.795,0.439,0.080,0.132
29,Qatar,6.374,1.684,1.313,0.871,0.555,0.220,0.167
30,Spain,6.354,1.286,1.484,1.062,0.362,0.153,0.079
31,Panama,6.321,1.149,1.442,0.910,0.516,0.109,0.054
32,Brazil,6.300,1.004,1.439,0.802,0.390,0.099,0.086
33,Uruguay,6.293,1.124,1.465,0.891,0.523,0.127,0.150
34,Singapore,6.262,1.572,1.463,1.141,0.556,0.271,0.453
35,El Salvador,6.253,0.794,1.242,0.789,0.430,0.093,0.074
36,Italy,6.223,1.294,1.488,1.039,0.231,0.158,0.030
37,Bahrain,6.199,1.362,1.368,0.871,0.536,0.255,0.110
38,Slovakia,6.198,1.246,1.504,0.881,0.334,0.121,0.014
39,Trinidad & Tobago,6.192,1.231,1.477,0.713,0.489,0.185,0.016
40,Poland,6.182,1.206,1.438,0.884,0.483,0.117,0.050
41,Uzbekistan,6.174,0.745,1.529,0.756,0.631,0.322,0.240
42,Lithuania,6.149,1.238,1.515,0.818,0.291,0.043,0.042
43,Colombia,6.125,0.985,1.410,0.841,0.470,0.099,0.034
44,Slovenia,6.118,1.258,1.523,0.953,0.564,0.144,0.057
45,Nicaragua,6.105,0.694,1.325,0.835,0.435,0.200,0.127
46,Kosovo,6.100,0.882,1.232,0.758,0.489,0.262,0.006
47,Argentina,6.086,1.092,1.432,0.881,0.471,0.066,0.050
48,Romania,6.070,1.162,1.232,0.825,0.462,0.083,0.005
49,Cyprus,6.046,1.263,1.223,1.042,0.406,0.190,0.041
50,Ecuador,6.028,0.912,1.312,0.868,0.498,0.126,0.087
51,Kuwait,6.021,1.500,1.319,0.808,0.493,0.142,0.097
52,Thailand,6.008,1.050,1.409,0.828,0.557,0.359,0.028
53,Latvia,5.940,1.187,1.465,0.812,0.264,0.075,0.064
54,South Korea,5.895,1.301,1.219,1.036,0.159,0.175,0.056
55,Estonia,5.893,1.237,1.528,0.874,0.495,0.103,0.161
56,Jamaica,5.890,0.831,1.478,0.831,0.490,0.107,0.028
57,Mauritius,5.888,1.120,1.402,0.798,0.498,0.215,0.060
58,Japan,5.886,1.327,1.419,1.088,0.445,0.069,0.140
59,Honduras,5.860,0.642,1.236,0.828,0.507,0.246,0.078
60,Kazakhstan,5.809,1.173,1.508,0.729,0.410,0.146,0.096
61,Bolivia,5.779,0.776,1.209,0.706,0.511,0.137,0.064
62,Hungary,5.758,1.201,1.410,0.828,0.199,0.081,0.020
63,Paraguay,5.743,0.855,1.475,0.777,0.514,0.184,0.080
64,Northern Cyprus,5.718,1.263,1.252,1.042,0.417,0.191,0.162
65,Peru,5.697,0.960,1.274,0.854,0.455,0.083,0.027
66,Portugal,5.693,1.221,1.431,0.999,0.508,0.047,0.025
67,Pakistan,5.653,0.677,0.886,0.535,0.313,0.220,0.098
68,Russia,5.648,1.183,1.452,0.726,0.334,0.082,0.031
69,Philippines,5.631,0.807,1.293,0.657,0.558,0.117,0.107
70,Serbia,5.603,1.004,1.383,0.854,0.282,0.137,0.039
71,Moldova,5.529,0.685,1.328,0.739,0.245,0.181,0.000
72,Libya,5.525,1.044,1.303,0.673,0.416,0.133,0.152
73,Montenegro,5.523,1.051,1.361,0.871,0.197,0.142,0.080
74,Tajikistan,5.467,0.493,1.098,0.718,0.389,0.230,0.144
75,Croatia,5.432,1.155,1.266,0.914,0.296,0.119,0.022
76,Hong Kong,5.430,1.438,1.277,1.122,0.440,0.258,0.287
77,Dominican Republic,5.425,1.015,1.401,0.779,0.497,0.113,0.101
78,Bosnia and Herzegovina,5.386,0.945,1.212,0.845,0.212,0.263,0.006
79,Turkey,5.373,1.183,1.360,0.808,0.195,0.083,0.106
80,Malaysia,5.339,1.221,1.171,0.828,0.508,0.260,0.024
81,Belarus,5.323,1.067,1.465,0.789,0.235,0.094,0.142
82,Greece,5.287,1.181,1.156,0.999,0.067,0.000,0.034
83,Mongolia,5.285,0.948,1.531,0.667,0.317,0.235,0.038
84,North Macedonia,5.274,0.983,1.294,0.838,0.345,0.185,0.034
85,Nigeria,5.265,0.696,1.111,0.245,0.426,0.215,0.041
86,Kyrgyzstan,5.261,0.551,1.438,0.723,0.508,0.300,0.023
87,Turkmenistan,5.247,1.052,1.538,0.657,0.394,0.244,0.028
88,Algeria,5.211,1.002,1.160,0.785,0.086,0.073,0.114
89,Morocco,5.208,0.801,0.782,0.782,0.418,0.036,0.076
90,Azerbaijan,5.208,1.043,1.147,0.769,0.351,0.035,0.182
91,Lebanon,5.197,0.987,1.224,0.815,0.216,0.166,0.027
92,Indonesia,5.192,0.931,1.203,0.660,0.491,0.498,0.028
93,China,5.191,1.029,1.125,0.893,0.521,0.058,0.100
94,Vietnam,5.175,0.741,1.346,0.851,0.543,0.147,0.073
95,Bhutan,5.082,0.813,1.321,0.604,0.457,0.370,0.167
96,Cameroon,5.044,0.549,0.910,0.331,0.381,0.187,0.037
97,Bulgaria,5.011,1.092,1.513,0.815,0.311,0.081,0.004
98,Ghana,4.996,0.611,0.868,0.486,0.381,0.245,0.040
99,Ivory Coast,4.944,0.569,0.808,0.232,0.352,0.154,0.090
100,Nepal,4.913,0.446,1.226,0.677,0.439,0.285,0.089
101,Jordan,4.906,0.837,1.225,0.815,0.383,0.110,0.130
102,Benin,4.883,0.393,0.437,0.397,0.349,0.175,0.082
103,Congo (Brazzaville),4.812,0.673,0.799,0.508,0.372,0.105,0.093
104,Gabon,4.799,1.057,1.183,0.571,0.295,0.043,0.055
105,Laos,4.796,0.764,1.030,0.551,0.547,0.266,0.164
106,South Africa,4.722,0.960,1.351,0.469,0.389,0.130,0.055
107,Albania,4.719,0.947,0.848,0.874,0.383,0.178,0.027
108,Venezuela,4.707,0.960,1.427,0.805,0.154,0.064,0.047
109,Cambodia,4.700,0.574,1.122,0.637,0.609,0.232,0.062
110,Palestinian Territories,4.696,0.657,1.247,0.672,0.225,0.103,0.066
111,Senegal,4.681,0.450,1.134,0.571,0.292,0.153,0.072
112,Somalia,4.668,0.000,0.698,0.268,0.559,0.243,0.270
113,Namibia,4.639,0.879,1.313,0.477,0.401,0.070,0.056
114,Niger,4.628,0.138,0.774,0.366,0.318,0.188,0.102
115,Burkina Faso,4.587,0.331,1.056,0.380,0.255,0.177,0.113
116,Armenia,4.559,0.850,1.055,0.815,0.283,0.095,0.064
117,Iran,4.548,1.100,0.842,0.785,0.305,0.270,0.125
118,Guinea,4.534,0.380,0.829,0.375,0.332,0.207,0.086
119,Georgia,4.519,0.886,0.666,0.752,0.346,0.043,0.164
120,Gambia,4.516,0.308,0.939,0.428,0.382,0.269,0.167
121,Kenya,4.509,0.512,0.983,0.581,0.431,0.372,0.053
122,Mauritania,4.490,0.570,1.167,0.489,0.066,0.106,0.088
123,Mozambique,4.466,0.204,0.986,0.390,0.494,0.197,0.138
124,Tunisia,4.461,0.921,1.000,0.815,0.167,0.059,0.055
125,Bangladesh,4.456,0.562,0.928,0.723,0.527,0.166,0.143
126,Iraq,4.437,1.043,0.980,0.574,0.241,0.148,0.089
127,Congo (Kinshasa),4.418,0.094,1.125,0.357,0.269,0.212,0.053
128,Mali,4.390,0.385,1.105,0.308,0.327,0.153,0.052
129,Sierra Leone,4.374,0.268,0.841,0.242,0.309,0.252,0.045
130,Sri Lanka,4.366,0.949,1.265,0.831,0.470,0.244,0.047
131,Myanmar,4.360,0.710,1.181,0.555,0.525,0.566,0.172
132,Chad,4.350,0.350,0.766,0.192,0.174,0.198,0.078
133,Ukraine,4.332,0.820,1.390,0.739,0.178,0.187,0.010
134,Ethiopia,4.286,0.336,1.033,0.532,0.344,0.209,0.100
135,Swaziland,4.212,0.811,1.149,0.000,0.313,0.074,0.135
136,Uganda,4.189,0.332,1.069,0.443,0.356,0.252,0.060
137,Egypt,4.166,0.913,1.039,0.644,0.241,0.076,0.067
138,Zambia,4.107,0.578,1.058,0.426,0.431,0.247,0.087
139,Togo,4.085,0.275,0.572,0.410,0.293,0.177,0.085
140,India,4.015,0.755,0.765,0.588,0.498,0.200,0.085
141,Liberia,3.975,0.073,0.922,0.443,0.370,0.233,0.033
142,Comoros,3.973,0.274,0.757,0.505,0.142,0.275,0.078
143,Madagascar,3.933,0.274,0.916,0.555,0.148,0.169,0.041
144,Lesotho,3.802,0.489,1.169,0.168,0.359,0.107,0.093
145,Burundi,3.775,0.046,0.447,0.380,0.220,0.176,0.180
146,Zimbabwe,3.663,0.366,1.114,0.433,0.361,0.151,0.089
147,Haiti,3.597,0.323,0.688,0.449,0.026,0.419,0.110
148,Botswana,3.488,1.041,1.145,0.538,0.455,0.025,0.100
149,Syria,3.462,0.619,0.378,0.440,0.013,0.331,0.141
150,Malawi,3.410,0.191,0.560,0.495,0.443,0.218,0.089
151,Yemen,3.380,0.287,1.163,0.463,0.143,0.108,0.077
152,Rwanda,3.334,0.359,0.711,0.614,0.555,0.217,0.411
153,Tanzania,3.231,0.476,0.885,0.499,0.417,0.276,0.147
154,Afghanistan,3.203,0.350,0.517,0.361,0.000,0.158,0.025
155,Central African Republic,3.083,0.026,0.000,0.105,0.225,0.235,0.035
156,South Sudan,2.853,0.306,0.575,0.295,0.010,0.202,0.091`


const dataset2 = `name,networth,country,company
Jeff Bezos,131,United States,Amazon
Bill Gates,96.5,United States,Microsoft
Larry Ellison,62.5,United States,Oracle
Mark Zuckerberg,62.3,United States,Facebook
Larry Page,50.8,United States,Alphabet
Lisa Su,1,Taiwan,AMD
Jack Dorsey,7.4,United States,Twitter
Marissa Mayer,1,United States,Yahoo!
Oprah Winfrey,30,United States,HARPO
Susan Wojcicki,1,United States,YouTube`


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      format: "TEXT",
      rows: 0,
      fields: 0,
      field_order: [],
      tabular: [],
      field_info: {},
      terms: {},
      categorical: [],
      sfields : "",
      viz_type: "unknown",
      extra_fields: [],
      enrich: false,
      metrics: {
        width:0,
        height:0,
        colors:0,
        colorContrast:0,
        dataInkRatio:1,
        dataDensity:1
      }
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleEnrich = this.handleEnrich.bind(this);
    this.handleSfields = this.handleSfields.bind(this);

  }


  getSVGURL(base64) {
    return "data:image/svg+xml;base64," + base64
  }

  // handleSfields = function(e){
  //   let lumi = window.Lumina;
  //   this.setState({sfields: e.target.value})
  //   let toks = e.target.value.split(" ")
  //   let drawn = false
  //   if (toks.length ==1) {
      
  //     let nFields = toks[0].split(",")
  //     let gFields = []
  //     console.log(nFields,gFields)
  //     lumi.data.grouped(nFields,gFields)
  //     let viz_type=lumi.viz.suggest_viz(nFields.concat(gFields))
  //     this.setState({viz_type: viz_type})
  //     lumi.viz.plot("#lumina",nFields.concat(gFields))
  //     drawn=true
      
  //   } else if (toks.length ==2){
  //     let nFields = toks[0].split(",")
  //     let gFields = toks[1].split(",")
  //     console.log(nFields,gFields)
  //     lumi.data.grouped(nFields,gFields)
  //     let viz_type=lumi.viz.suggest_viz(nFields.concat(gFields))
  //     this.setState({viz_type: viz_type})
  //     lumi.viz.plot("#lumina",nFields.concat(gFields))
  //     drawn=true
     
  //   }

  //   if (drawn){
  //     let cc =lumi.viz.metrics.checkColorContrast()
  //     let di =lumi.viz.metrics.calcDataDensity()
  //     let dd =lumi.viz.metrics.calcDataInkRatio()
  //     this.setState( {metrics: {
  //       width:lumi.viz.metrics.width,
  //       height:lumi.viz.metrics.height,
  //       colors:Array.from(lumi.viz.metrics.colors),
  //       colorContrast:cc,
  //       dataInkRatio:di,
  //       dataDensity:dd
  //     }})
  //     return
  //   }

  //   this.setState({viz_type: "unknown"})


    
  // }


  handleEnrich = function(e) {
    this.setState({enrich: e.target.value})
  }

  handleSfields = function(e){
    let lumi = window.Lumina;
    this.setState({sfields: e.target.value})

    let phrase = e.target.value
    
    // extract color information

    let colF = ""
    let colS = ""

    let tp = ""

    if (phrase.endsWith(", vertical")) {
      tp = "vbar"
      phrase = phrase.replace(", vertical","")
    } else if (phrase.endsWith(", radial")) {
      tp = "radial"
      phrase = phrase.replace(", radial","")
    }

    console.log("does include", phrase.includes(", color "))

    if (phrase.includes(", color ")){
      
      let phrases = phrase.split(", color ")
      phrase = phrases[0]
      console.log(phrase[1])
      let colTok=phrases[1].split(" ")
      if (colTok.length === 1 ) {
        if (colTok[0] === "random") {
          colS = "random"
        } else {
          colS = "field"
          colF = colTok[0]
        }
      } else if (colTok.length === 2 && ( colTok[0] === "single" || colTok[0] == "flat")){
        colS = "single"
        colF = colTok[1]
      } else if (colTok.length === 2 && ( colTok[0] === "intensity" || colTok[0] == "var")){
        colS = "intensity"
        colF = colTok[1]
      }
    }

    console.log("colorS",colF,colS)

    let toks = phrase.split(" ")

    
   

    let drawn = false
    if (toks.length ==1) {
      let nFields = toks[0].split(",")
      let gFields = []
      lumi.data.grouped(nFields,gFields)
      let viz_type=lumi.viz.suggest_viz(nFields.concat(gFields))
      this.setState({viz_type: viz_type})
      lumi.viz.plot("#lumina",nFields.concat(gFields),colF,colS)
      drawn=true
      
    } else if (toks.length > 2){
      
      let stage = 1
      let field = 0
      let field_sub = 0
      let nFieldAction = 1 
      let nFieldNumber = 0
      let nFieldExpect = false
      let nFieldSort = false
      let nFields = []
      let gFields = []

     

     
      for (let tok of toks) {
        console.log(tok)
        if (nFieldExpect && !isNaN(tok)) {
            nFieldNumber = Number(tok)
            nFieldExpect = false
            
        }
        else if (tok === "top" || tok === "top" || tok === "biggest" || tok === "largest" || tok === "upper" || tok === "most") {
            nFieldAction = 1
            nFieldExpect = true
            nFieldSort = true 

        } else if (tok === "bottom" || tok === "smallest" || tok === "lower" || tok === "least" ) {
            nFieldAction = -1
            nFieldExpect = true
            nFieldSort = true
        }
        else if (tok === "and" || tok === "vs" || tok == "versus") {
          field = field + 1
          field_sub = 0
        } else if (tok==="by" || tok==="per") {
          stage = 2
          field_sub = 0
          field = 0
        } else {
          if (nFieldExpect){
              nFieldExpect = false;
              field_sub = 0;
          }
          if (field_sub === 0) {
            if (stage==1){
              nFields[field] = tok 
            } else {
              gFields[field] = tok
            }
            field_sub = 1
          } else {
            if (stage==1){
              nFields[field] = nFields[field] + " " + tok
              console.log(tok,field,nFields[field])
            } else {
              gFields[field] = gFields[field] + " " + tok
              console.log(tok,field,gFields[field])
            }
            
          } 
        }
      }

      console.log(nFields,gFields)

      // check the fields
      for (let i=0; i<nFields.length; i++) {
        console.log(">",nFields[i])
        let checkField = lumi.data.checkField(nFields[i])
        if (checkField === "") {
          drawn=false
          this.setState({viz_type: "unknown field: " + nFields[i]})
          return
        } else {
          nFields[i] = checkField
        }
      }

      // check the fields
      for (let i=0; i<gFields.length; i++) {
        console.log(">",gFields[i])
        let checkField = lumi.data.checkField(gFields[i])
        if (checkField === "") {
          drawn=false
          this.setState({viz_type: "unknown field: " + gFields[i]})
          return
        } else {
          gFields[i] = checkField
        }
      }
      
      if (nFieldSort) {
        lumi.data.grouped(nFields,gFields,"sum",nFields[0],nFieldNumber,nFieldAction)
      } else {
        lumi.data.grouped(nFields,gFields)
      }
     
      let viz_type=lumi.viz.suggest_viz(nFields.concat(gFields))
      this.setState({viz_type: viz_type})
      lumi.viz.plot("#lumina",nFields.concat(gFields),colF,colS,tp)
      drawn=true
     
    }

    if (drawn){
      // let cc =lumi.viz.metrics.checkColorContrast()
      // let di =lumi.viz.metrics.calcDataDensity()
      // let dd =lumi.viz.metrics.calcDataInkRatio()
      // this.setState( {metrics: {
      //   width:lumi.viz.metrics.width,
      //   height:lumi.viz.metrics.height,
      //   colors:Array.from(lumi.viz.metrics.colors),
      //   colorContrast:cc,
      //   dataInkRatio:di,
      //   dataDensity:dd
      // }})
      return
    }

    this.setState({viz_type: "unknown"})


    
  }

  handleInput = function (e) {
    let lumi = window.Lumina;
    
    if (lumi) {
      lumi.data.parse(e.target.value);
      this.setState({ format: lumi.data.format });
      this.setState({ rows: lumi.data.tabular.length });
      this.setState({ fields: lumi.data.field_order.length });
      this.setState({ field_info: lumi.data.fields });
      this.setState({ field_order: lumi.data.field_order });
      this.setState({ tabular: lumi.data.tabular });

      // lumi.sem.getTermsRemote(lumi.data.field_order).then(t=>{this.setState({ terms: lumi.sem.terms })});
      lumi.discover("lumina.dev:5000").then(t => {
        lumi.sem.getTermsRemote(lumi.data.field_order.concat(lumi.data.categorical)).then(t => {
          lumi.sem.getSymbolsRemote(lumi.sem.hyp).then(t => {
            lumi.sem.getColorsRemote(lumi.sem.hyp).then(t => {
              
              this.setState({ terms: lumi.sem.terms, symbols: lumi.sem.symbols, colors: lumi.sem.colors, categorical: lumi.data.categorical })
            }).then(t=>{
              if (this.state.enrich) {
                lumi.data.enrich(lumi.sem.terms);
                lumi.sem.getTermsRemote(lumi.data.field_order.concat(lumi.data.categorical)).then(t => {
                  lumi.sem.getSymbolsRemote(lumi.sem.hyp).then(t => {
                    lumi.sem.getColorsRemote(lumi.sem.hyp).then(t => {
                      
                      this.setState({ terms: lumi.sem.terms, symbols: lumi.sem.symbols, colors: lumi.sem.colors, categorical: lumi.data.categorical })
                    }).then(t=>{
                        this.setState({ format: lumi.data.format });
                        this.setState({ rows: lumi.data.tabular.length });
                        this.setState({ fields: lumi.data.field_order.length });
                        this.setState({ field_info: lumi.data.fields });
                        this.setState({ field_order: lumi.data.field_order });
                        this.setState({ tabular: lumi.data.tabular });
                        this.setState({ extra_fields: lumi.data.extra_fields})
                    })
                  })
                })
              }
             
            })  
          })
      })
    });
  }
};

  render() {


    let tableHead = [];
    let tableRows = [];
    if (this.state.format !== "TEXT") {
      for (let item of this.state.field_order) {
        tableHead.push(<td key={item}>{item}</td>);
      }

      let indx = 0;

      for (let row of this.state.tabular) {
        let tableRow = [];
        for (let field in row) {
          tableRow.push(<td key={field}>{row[field]}</td>);
        }
        tableRows.push(<tr key={indx}>{tableRow}</tr>);
        indx++;
      }
    }

    let smallFieldList = []

    for (let field of this.state.field_order) {
      let f = this.state.field_info[field]
      
      if (this.state.extra_fields.indexOf(field) >=0) {
        if (f != undefined && f.field_type === "qualitative") {
          smallFieldList.push(<span className="small-field3">🏷 {f.name}</span>)
        } else {
          smallFieldList.push(<span className="small-field3"><em><strong>#</strong></em> {f.name}</span>)
        }
      } else  {
        if (f != undefined && f.field_type === "qualitative") {
          smallFieldList.push(<span className="small-field">🏷 {f.name}</span>)
        } else {
          smallFieldList.push(<span className="small-field2"><em><strong>#</strong></em> {f.name}</span>)
        }
      }
      
      
    }

    let fieldList = []
    // render fields
    for (let field of this.state.field_order) {
      let f = this.state.field_info[field]

      fieldList.push(<div key={field} className="card m-2 col-2">
        <div className="card-header"><h4>{field}</h4></div>
        <div className="card-body">
          {f.field_type} {"  "} {f.value_type}
          <hr />
          {f.categories && <div><span>categories:</span><br /><span>{JSON.stringify(f.categories)}</span></div>}
        </div>


      </div>)
    }

    let termList = []
    if (this.state.terms) {
      for (let term in this.state.terms) {
        let item = this.state.terms[term]
        let hyperList = []
        for (let h of item.hypernyms) {
          hyperList.push(<span className="m-2 p-2 border" key={h}>{h}</span>)
        }

        let extras = null
        if ("extras" in item) {
          extras = (<div>
            <span><CardNer data={item.extras} /></span>
          </div>)
        }

        termList.push(<div className="card pt-2 m-4" key={item.name}>
          <div className="card-header"><span className="m-2" style={{ fontWeight: "bold" }}>{item.name}</span><code>{item.semantic}</code></div>
          {extras}
          <div className="card-body"><div>{hyperList}</div></div>



        </div>)
      }



    }

    let symList = []
    if (this.state.symbols) {
      for (let term in this.state.symbols) {
        symList.push(<div key={term} className="card m-4 text-center"><img alt={"image for term " + term} className="img-small mx-auto" src={this.getSVGURL(this.state.symbols[term])} />
          <div className="card-body p-2 m-2">
            <span>{term}</span>
          </div>
        </div>)
      }
    }


    let colList = []
    if (this.state.colors) {
      for (let term in this.state.colors) {
        let color = this.state.colors[term]
        colList.push(<div key={term} className="card m-4 text-center"><div alt={"color " + color} className="swatch" style={{ backgroundColor: color }}></div>
          <div className="card-body p-2 m-2">
            <span>{term}</span>
            <div className="card-footer">
              {color}
            </div>
          </div>
        </div>)
      }
    }

    let selected = [""]





    return (
      <div className="container-fluid">
        <div className="row">
          <div className="sidebar col-2 stick-top">
             
            <h4 className="logo">Lumina Workflow</h4>
            <br />
            <a href="#insert" className="btn btn-outline-light">
              {" "}
              Insert data
            </a>
            <br />
            <a href="#analyze" className="mt-2 btn btn-outline-light">
              {" "}
              Analyze
            </a>
            <br />
            <a href="#insert" className="mt-2 btn btn-outline-light">
              {" "}
              Fields
            </a>
            <br />
            <a href="#insert" className="mt-2 btn btn-outline-light">
              {" "}
              Semantics
            </a>
            <br />
            <a href="#insert" className="mt-2 btn btn-outline-light">
              {" "}
              Symbols
            </a>
            <br />
            <a href="#insert" className="mt-2 btn btn-outline-light">
              {" "}
              Colors
            </a>
            <br />
            <a href="#select" className="mt-2 btn btn-outline-light">
              {" "}
              Select Fields
            </a>
            <br />
            <a href="#insert" className="mt-2 btn btn-outline-light">
              {" "}
              Visualize
            </a>
            
          </div>

          <div className="col-10">
          

            <br />
            <h3>Welcome to Lumina Workflow</h3>
            <p>
              This ui will enable you to follow the workflow steps of the
              Lumina.js library
            </p>

            <div className="card">
              <div className="card-header">
                1. Insert Data{" "}
                <a href="#insert" name="insert">
                  ¶
                </a>
              </div>

              

              <div className="card-body">
              <div>
                  Ready to use datasets:<br/>
                  <button className="button btn-primary ml-2" onClick={()=>{
            let el = document.getElementById("master-input")
            el.value = dataset1
            el.focus()
        }}>Use World Happiness 2019 Set</button>
        <button className="button btn-primary ml-2" onClick={()=>{
            let el = document.getElementById("master-input")
            el.value = dataset2
            el.focus()
        }}>Use Forbes Billionaires 2019</button>
              </div>
                <textarea
                  onBlur={this.handleInput}
                  className="form-control"
                  rows="4"
                  cols="80"
                  id="master-input"
                />
                <br/>
                       <span>
        <label >
          <input
            type="checkbox"
            checked={this.state.enrich}
            ref="complete"
            onChange={this.handleEnrich}
          />
          Enrich Input Results
        </label>
        <br/>
        <button className="button btn-success" onClick={this.handleInput}>Import</button>
        <br/>
       
      </span>
              </div>
             
            </div>

            <div className="card mt-4">
              <div className="card-header">
                2. Analyze Data{" "}
                <a href="#analyze" name="insert">
                  ¶
                </a>
              </div>

              <div className="card-body">
                <span>Input data Format:</span>{" "}
                <span style={{ fontWeight: "bold" }}>{this.state.format}</span>
                <br />
                <span>Input data Rows:</span>{" "}
                <span style={{ fontWeight: "bold" }}>{this.state.rows}</span>
                <br />
                <span>Input data Fields:</span>{" "}
                <span style={{ fontWeight: "bold" }}>{this.state.fields}</span>
                <br />
                <span>Json Tabular data:</span>
                <br />
                <code>{JSON.stringify(this.state.tabular)}</code>
                <br />
                <h6>Data in tabular form</h6>
                <table className="table table-striped">
                  <thead>
                    <tr>{tableHead}</tr>
                  </thead>
                  <tbody>{tableRows}</tbody>
                </table>
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-header">
                3. Fields{" "}
                <a href="#analyze" name="insert">
                  ¶
                </a>
              </div>

              <div className="card-body">
                <div className="row">
                  {fieldList}
                </div>

              </div>
            </div>

            <div className="card mt-4">
              <div className="card-header">
                4. Semantics{" "}
                <a href="#semantics" name="Semantics">
                  ¶
                </a>
              </div>

              <div className="card-body">
                <h2>Semantic term list:</h2>
                <div className="row">

                  {termList}
                </div>

                <h2>Semantic term symbols:</h2>
                <div className="row p-4">

                  {symList}
                </div>

                <h2>Semantic term colors:</h2>
                <div className="row p-4">
                  {colList}
                </div>

              </div>
            </div>


            <br />

            <br/>

            <div className="col-6">
            <div className="card">
              <div className="card-header text-center">
              5. Select Fields{" "}
                <a href="#fields" name="Fields">
                  ¶
                </a>
              </div>
              <div className="card-body">
              <span>

              </span>
              <div>Available fields</div>
              <div>{smallFieldList}</div>
              <em>Use expressions in style of: "population and income by country" or "population per country" etc...</em>
                <input id="sfields" className="form-control" type="text" defaultValue={this.state.sfields} onBlur={this.handleSfields}></input>
                <strong>Visualization type recognized:</strong><code>{this.state.viz_type}</code>

              </div>
            </div>
            </div>

            <div className="col-12">
            <div className="card">
              <div className="card-header text-center">
              6. Visualization{" "}
                <a href="#fields" name="Fields">
                  ¶
                </a>
              </div>
              <div className="card-body">
                  <div id="lumina-container">
                  <svg id="lumina" width="1280" height="800"></svg>
                  </div>
                

              </div>
            </div>

          </div>

          <br/>
          <br/>
          <div className="col-6">
            <div className="card">
              <div className="card-header text-center">
                Visualization metrics <code>keyboard shortcut 'M'</code>
              </div>
              <div className="card-body">
                <strong>Width:</strong> <code>{this.state.metrics.width}</code>
                <strong className="ml-2">Height:</strong> <code>{this.state.metrics.height}</code>
                
                <hr/>
                <strong>Visualization Type:</strong> <code>{this.state.viz_type}</code>
                <hr/>
                
               
                <hr/>
                <strong>Data ink ratio:</strong> <code>{this.state.metrics.dataInkRatio}</code><br/>
                <hr/>
                <strong>Data desnity:</strong> <code>{this.state.metrics.dataDensity}</code><br/>
                <hr/>
                <strong>Colors used:</strong> <code>{this.state.metrics.colors.length}</code><br/>
                <strong>Colors similarity issue:</strong> <code>{this.state.metrics.colorContrast.toString()}</code>
                <hr/>


              </div>
            </div>
          </div>






          </div>



        </div>
      </div>
    );
  }
}

export default App;
