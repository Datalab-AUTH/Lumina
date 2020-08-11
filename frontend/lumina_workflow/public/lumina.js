
(function ($) {
  var Lumina = {};

  Lumina.ver = "1.0";

  Lumina.info = function () {
    return "Lumina.js -version: " + Lumina.ver;
  };
  Lumina.services = {};
  Lumina.about = function () {
    console.log("📊 Lumina initialized! - version: " + Lumina.ver);
  };

  Lumina.discover = async function (url) {
    let success = true;
    // fetch services
    const r = await fetch("https://" + url + "/services");
    const data = await r.json();
    Lumina.services = data;
    let servList = ["data", "semantic", "info", "visual_lib"];
    for (let serv of servList) {
      if (serv in Lumina.services) {
        console.log("SUCCESS ✔️ - " + serv +
          " service found at: " +
          Lumina.services[serv]);
      }
      else {
        console.log("FAILURE ❌ - could not find " + serv + " service");
        success = false;
      }
    }
  };

  function init($) {
    // Check if D3.js exists
    if (typeof $.d3 === "undefined") {
      console.error(
        "Cannot initialize Lumina.js - D3.js dependency is missing!"
      );
      console.log("Make sure you have included D3.js first in your page");
      return null;
    } else {
      console.log("D3.js found - version: " + $.d3.version);

      Lumina.d3 = $.d3.version;

      var d3maj = parseInt($.d3.version.split(".")[0]);
      if (d3maj < 5) {
        console.error(
          "Cannot initialize Lumina.js - D3.js must be version 5 or higher! (found: " +
          $.d3.version +
          ")"
        );
        return null;
      }
    }

    $.Lumina = Lumina;
    console.log("📊 Lumina initialized!");
  }

  init($);
})(this);

// add data capabilities to lumi.js library

var Lumina = (function ($) {


  var _data = {}


  _data.input = "";
  _data.format = "TEXT";
  _data.tabular = {};
  _data.field_order = [];
  _data.fields = {}
  _data.id_order = []
  _data.filter = {}
  _data.id = ""

  _data.parse = function (input) {
    _data.input = input
    _data.recognize(_data.input)
    if (_data.format != "TEXT") {
      analyze(_data.tabular)
    }

  }



  function getIDs(field_order) {

    let rankList = { 1: [], 2: [], 3: [] }

    for (let f of field_order) {
      if (_data.fields[f]["unique"]) {
        let rank = 1;
        let id = { "field": f, "unique": true, "first": false, "id_in_name": false, "rank": 1 }
        // if first
        if (f === field_order[0]) {
          id["first"] = true
          rank = rank + 1;
        }
        // if id included in name
        if (f.toLowerCase().includes("id")) {
          id["id_in_name"] = true
          rank = rank + 1
        }

        id["rank"] = rank
        rankList[rank].push(id)
      }
    }

    let idList = []
    idList = idList.concat(rankList[3])
    idList = idList.concat(rankList[2])
    idList = idList.concat(rankList[1])
    //console.log(idList)
    //console.log(rankList)
    _data.id_order = idList
    _data.id = idList[0]["field"]

  }

  function fields_further(dobj) {
    for (let field of dobj.field_order) {
      let tokens = field.split(/[\s,]+/)
      dobj.fields[field]["tokens"] = tokens
      //get last token 
      let lastToken = tokens[tokens.length - 1]
      let cur = matchCurrency(lastToken)
      let si = _data.getSI(lastToken)
      if (cur) {
        dobj.fields[field]["unit"] = cur
      }

      if (si.unit != null) {
        dobj.fields[field]["unit"] = si
      }
    }

  }

  function basicID(value) {

    if (typeof (value) === "string") {
      //console.log(">>>", value, isNaN(value))
      // check if number
      if (value == "") {
        return "empty"
      }

      if (value.endsWith("%")) {
        return "percentage"
      }
      if (!isNaN(value)) {

        return "number"
      }
      if (!isNaN(Date.parse(value))) {

        return "date"
      }
      if (value.toLowerCase() === "true" || value.toLowerCase === "false") {
        return "boolean"
      }
      return "string"
    }

    return typeof (value)


  }


  //  _data.grouped = function(numFields,groupField,action="sum"){
  //     let catType = "categories"

  //     realGroupField  = _data.fields[groupField]
  //     if (realGroupField["field_type"] === "quantitative"){
  //         catType = "values"
  //     }
  //     let catList = {}

  //     for (cat in realGroupField[catType]){
  //         let sumItem = {}
  //         for (numField of numFields){
  //             sumItem[numField] = 0
  //         }
  //         catList[cat] = sumItem
  //     }        



  //     for (let row of _data.tabular){
  //         let curCat = row[groupField]
  //         for (numField of numFields){
  //             let val = catList[curCat][numField]
  //             val = val + row[numField]
  //             catList[curCat][numField] = val
  //         }
  //     }

  //     if (action==="avg") {
  //         for (let catName in catList){
  //             let catItem = catList[catName]
  //             // get the category sum
  //             let d = realGroupField[catType][catName]
  //             for (f in catItem){
  //                 catItem[f] = catItem[f] / d

  //             }                
  //         }
  //     }

  //     _data.subset = catList
  // }

  // supports up to 3 groups


  _data.ls = function (field = null, order = 1) {
    return function compare(a, b) {
      console.log(field)
      if (a[field] < b[field])
        return -1 * order;
      if (a[field] > b[field])
        return 1 * order;
      return 0;
    }
  }



  _data.grouped = function (numFields, groupFields = [], action = "sum", sortField = null, sortNum = 0, sortOrd = 1, rest = true) {



    if (groupFields.length == 0) {
      let rows = []
      for (let row of _data.tabular) {
        item = {}
        for (let field of numFields) {
          item[field] = row[field]
        }
        rows.push(item)
      }

      _data.subset = rows
      return rows
    }

    if (rest) {
      let comb = [...numFields, ...groupFields]
      let restFields = Object.keys(_data.fields).filter(x => !comb.includes(x))
      numFields = [...numFields, ...restFields]
    }








    let catTypes = []

    for (let i = 0; i < groupFields.length; i++) {
      let refGroupField = _data.fields[groupFields[i]]
      if (refGroupField["field_type"] === "quantitative") {
        catTypes[i] = "values"
      } else {
        catTypes[i] = "categories"
      }
    }

    //begin
    let catList = {}

    let numOfGroups = groupFields.length

    for (let i = 0; i < groupFields.length; i++) {
      catList
    }

    for (let row of _data.tabular) {
      let node = catList
      for (let i = 0; i < groupFields.length; i++) {
        //console.log(node)
        // check if field cat exists in node
        let groupField = groupFields[i]
        let curCat = row[groupField]
        if (!(curCat in node)) {
          node[curCat] = {}
        }
        node = node[curCat]

        // if last element 
        if (i == groupFields.length - 1) {
          for (let numField of numFields) {
            // check first if numField exists
            if (!(numField in node)) {
              node[numField] = 0
              if (_data.fields[numField]["field_type"] === "qualitative") {
                node[numField] = []
              }
            }
            if (_data.fields[numField]["value_type"] == "date") {
              node[numField] = row[numField];
            } if (_data.fields[numField]["field_type"] === "qualitative") {
              node[numField].push(row[numField])
            } else {
              let val = node[numField]
              val = val + row[numField]
              node[numField] = val
            }

          }
        }
      }


    }

    //    console.log(catList)


    //    console.log("------------------\n\n\n-------")

    //rollout object to flat tabular structure

    let rows = []
    traverse(catList, 0, groupFields.length, {}, groupFields, rows)

    console.log(rows)
    // sort the results 
    if (sortField) {
      console.log(sortField)
      rows = rows.sort(function (a, b) {
        if (a[sortField] < b[sortField])
          return 1 * sortOrd;
        if (a[sortField] > b[sortField])
          return -1 * sortOrd;
        return 0;
      });
      console.log(rows)

      if (sortNum > rows.length || sortNum == 0) {
        sortNum = rows.length
      }

      rows = rows.slice(0, sortNum).reverse()

    }

    _data.subset = rows
    return rows

  }


  function traverse(node, i, max, item, fields, array) {

    if (i == max) {
      let res = {}
      for (let key in item) {
        res[key] = item[key]
      }
      for (let numField in node) {


        res[numField] = node[numField]
        if (Lumina.data.fields[numField]["value_type"] == "date") {
          console.log(node[numField], new Date(node[numField]))
          res[numField] = new Date(node[numField])
        }


      }
      array.push(res)
      return
    }
    for (let groupField in node) {
      item[fields[i]] = groupField
      traverse(node[groupField], i + 1, max, item, fields, array)

    }
  }



  // realGroupField  = _data.fields[groupField]
  // if (realGroupField["field_type"] === "quantitative"){
  //     catType = "values"
  // }
  // let catList = {}

  // for (cat in realGroupField[catType]){
  //     let sumItem = {}
  //     for (numField of numFields){
  //         sumItem[numField] = 0
  //     }
  //     catList[cat] = sumItem
  // }        



  // for (let row of _data.tabular){
  //     let curCat = row[groupField]
  //     for (numField of numFields){
  //         let val = catList[curCat][numField]
  //         val = val + row[numField]
  //         catList[curCat][numField] = val
  //     }
  // }

  // if (action==="avg") {
  //     for (let catName in catList){
  //         let catItem = catList[catName]
  //         // get the category sum
  //         let d = realGroupField[catType][catName]
  //         for (f in catItem){
  //             catItem[f] = catItem[f] / d

  //         }                
  //     }
  // }

  // _data.subset = catList


  function getFields(tabular) {
    let tabularNew = []
    let fields = {}
    let categorical = new Set()
    let setFields = new Set()
    let matchIndex = {}
    let secondMatchIndex = {}
    if (Array.isArray(tabular) && tabular.length > 0) {

      for (let row of tabular) {
        let tabularNewItem = {}
        for (let f in row) {
          // add to ordered set
          setFields.add(f)
          if (!(f in fields)) {
            //console.log("found")
            fields[f] = {}

            //get field type 
            let ftype = basicID(row[f])
            fields[f]["value_type"] = basicID(row[f])
            fields[f]["name"] = f
            matchIndex[f.toUpperCase()] = f
            let tokz = f.toUpperCase().split(" ")
            if (tokz.length > 1) {
              for (tok of tokz) {
                secondMatchIndex[tok] = f.toUpperCase()
              }
            }

            // tokenize field chars and make connections to same field
            if (ftype === "string") {
              fields[f]["field_type"] = "qualitative"
              fields[f]["categories"] = {}
              categorical.add(row[f])
              fields[f]["categories"][row[f]] = 1
              fields[f]["unique"] = true
            } else {
              fields[f]["field_type"] = "quantitative"
              fields[f]["values"] = {}
              fields[f]["values"][row[f]] = 1
              fields[f]["unique"] = true
            }
          } else {

            let foundType = basicID(row[f])
            if (foundType !== fields[f]["value_type"]) {
              fields[f]["value_type"] = "mixed"
            }
            if (foundType === "string" && fields[f]["field_type"] === "qualitative") {
              let prVal = fields[f]["categories"][row[f]]
              //console.log(prVal)
              if (prVal) {
                prVal = prVal + 1
                fields[f]["unique"] = false
                fields[f]["categories"][row[f]] = prVal
              } else {
                fields[f]["categories"][row[f]] = 1
                categorical.add(row[f])
              }
            } else {
              let prVal = fields[f]["values"][row[f]]
              if (prVal) {
                prVal = prVal + 1
                fields[f]["unique"] = false
                fields[f]["values"][row[f]] = prVal
              } else {
                fields[f]["values"][row[f]] = 1
              }
              fields[f]["field_type"] = "quantitative"
            }
          }
          if (fields[f]["field_type"] === "quantitative") {
            if (fields[f]["value_type"] === "date") {
              tabularNewItem[f] = new Date(row[f])
            } else {
              tabularNewItem[f] = parseFloat(row[f])
            }

          } else {
            tabularNewItem[f] = row[f]
          }
        }
        tabularNew.push(tabularNewItem)
      }


    }
    // overwrite tabular with the new data
    _data.tabular = tabularNew
    _data.field_order = Array.from(setFields)
    _data.categorical = Array.from(categorical)
    _data.fieldMatchIndex = matchIndex
    _data.fieldSecondMatchIndex = secondMatchIndex
    return fields
  }

  _data.enrich = function (semterms) {

    let tab = _data.tabular
    qFields = []
    // get qualitative fields first
    for (fieldName of _data.field_order) {
      let f = _data.fields[fieldName]
      if (f.field_type === "qualitative") {
        qFields.push(fieldName)
      }
    }

    console.log(qFields)

    extra_fields = new Set()
    console.log(extra_fields)
    for (i = 0; i < tab.length; i++) {
      row = tab[i]
      for (f of qFields) {
        // get qualitative field value and search for terms
        if (row[f] in semterms) {
          console.log(row[f])
          // modified by kaggis: subude multiple extra fields until we find the usefull ones
          // if ("extras" in semterms[row[f]] && "data" in semterms[row[f]]["extras"]) {
          //   let extraData = semterms[row[f]]["extras"]["data"]


          //   for (key in extraData){

          //     extra_fields.add(key)
          //     tab[i][key] = extraData[key]
          //   }
          // }
          // get person details
          if ("extras" in semterms[row[f]] && "entity_type" in semterms[row[f]]["extras"]) {
            let ext = semterms[row[f]]["extras"]
            if (ext["entity_type"] === "person") {
              extra_fields.add("gender")
              tab[i]["gender"] = ext["gender"]
              extra_fields.add("birthdate")
              tab[i]["birthdate"] = ext["birth_date"]
              extra_fields.add("age")
              let d = new Date()
              let y = d.getFullYear()
              let age = y - ext["birth_date"]
              tab[i]["age"] = age
            }
          }

        }
      }
    }

    extra_fields = Array.from(extra_fields)

    // align tabular data
    for (i = 0; i < tab.length; i++) {

      for (key of extra_fields) {

        if (!(key in tab[i])) {

          tab[i][key] = 0.0
        }
      }

    }

    console.log(tab)
    _data.extra_fields = extra_fields
    analyze(tab)

  }


  _data.checkField = function (fieldName) {
    if (fieldName === undefined) return ""
    if (fieldName.toUpperCase() in _data.fieldMatchIndex) {
      return _data.fieldMatchIndex[fieldName.toUpperCase()]
    }

    // if not found try n-grams
    tokz = fieldName.toUpperCase().split(" ")
    for (tok of tokz) {
      if (tok in _data.fieldSecondMatchIndex) {
        return _data.fieldMatchIndex[_data.fieldSecondMatchIndex[tok]]
      }
    }

    // not found 
    return ""
  }

  _data.recognize = function () {
    if (_data.input === "") return "TEXT"

    let res = {}
    // try to recognize
    res = parseJSON(_data.input)
    if (res) {
      _data.format = "JSON"
      _data.tabular = res

      return;
    }

    // replace parseCSV with papa
    // res = parseCSV(_data.input)
    res = parsePapaCSV(_data.input)
    if (res) {
      _data.format = "CSV"
      _data.tabular = res

      return;
    }

    _data.format = "TEXT"





  }

  function parsePapaCSV(data) {

    var data = Papa.parse(data, { header: true });
    console.log("let papa parse the csv");
    return data.data
  }







  function matchCurrency(input) {
    if (input.endsWith("$")) return { "type": "currency", "unit": "dollar", "symbol": "$" }
    if (input.endsWith("€")) return { "type": "currency", "unit": "euro", "symbol": "€" }
    if (input.endsWith("£")) return { "type": "currency", "unit": "pound", "symbol": "£" }
    if (input.endsWith("¥")) return { "type": "currency", "unit": "yen", "symbol": "¥" }
  }


  _data.getSI = function (input) {
    let prefixes = {
      "Y": { "name": "yotta", "base10": 24 },
      "Z": { "name": "zetta", "base10": 21 },
      "E": { "name": "exa", "base10": 18 },
      "P": { "name": "peta", "base10": 15 },
      "T": { "name": "tera", "base10": 12 },
      "G": { "name": "giga", "base10": 9 },
      "M": { "name": "mega", "base10": 6 },
      "k": { "name": "kilo", "base10": 3 },
      "h": { "name": "hecto", "base10": 2 },
      "da": { "name": "deca", "base10": 1 },
      "d": { "name": "deci", "base10": -1 },
      "c": { "name": "centi", "base10": -2 },
      "m": { "name": "milli", "base10": -3 },
      "μ": { "name": "micro", "base10": -6 },
      "n": { "name": "nano", "base10": -9 },
      "p": { "name": "pico", "base10": -12 },
      "f": { "name": "femto", "base10": -15 },
      "a": { "name": "atto", "base10": -18 },
      "z": { "name": "zepto", "base10": -21 },
      "y": { "name": "yocto", "base10": -24 },
    }


    let units = {
      "m": { "name": "metre", "quantity": "length" },
      "g": { "name": "gram", "quantity": "mass" },
      "s": { "name": "second", "quantity": "time" },
      "A": { "name": "ampere", "quantity": "electric current" },
      "K": { "name": "kelvin", "quantity": "temperature" },
      "mol": { "name": "mole", "quantity": "substance" },
      "cd": { "name": "candela", "quantity": "light" },
      "rad": { "name": "radian", "quantity": "angle" },
      "sr": { "name": "steradian", "quantity": "angle" },
      "Hz": { "name": "hertz", "quantity": "frequency" },
      "N": { "name": "newton", "quantity": "force" },
      "Pa": { "name": "pascal", "quantity": "pressure" },
      "J": { "name": "joule", "quantity": "pressure" },
      "W": { "name": "watt", "quantity": "pressure" },
      "C": { "name": "coulomb", "quantity": "pressure" },
      "V": { "name": "volt", "quantity": "pressure" },
      "F": { "name": "farad", "quantity": "pressure" },
      "Ω": { "name": "ohm", "quantity": "pressure" },
      "S": { "name": "siemens", "quantity": "pressure" },
      "Wb": { "name": "weber", "quantity": "pressure" },
      "T": { "name": "tesla", "quantity": "pressure" },
      "H": { "name": "henry", "quantity": "pressure" },
      "°C": { "name": "celsius", "quantity": "temperature" },
      "lm": { "name": "lumen", "quantity": "luminus flux" },
      "lx": { "name": "lux", "quantity": "illuminance" },
      "Bq": { "name": "becquerel", "quantity": "radioactivity" },
      "Gy": { "name": "grey", "quantity": "radiation" },
      "Sv": { "name": "sievert", "quantity": "radiation" },
      "kat": { "name": "katal", "quantity": "catalytic activity" }
    }


    let selPref = null
    let prefWord = null
    for (let pref in prefixes) {



      if (input.startsWith(pref)) {
        selPref = prefixes[pref];
        prefWord = pref

      }

      if (input.startsWith(prefixes[pref].name)) {
        selPref = prefixes[pref];
        prefWord = prefixes[pref].name
        break;
      }



    }


    if (selPref !== null) {
      //console.log(input)
      //console.log(prefWord.length)
      let modInput = input.substring(1, prefWord.length + 1)
      //console.log(modInput)
      if (modInput.length !== 0) {
        input = modInput
      } else {
        selPref = null
      }
    }

    let selUnit = null
    for (let u in units) {

      if (input.endsWith(u)) {
        selUnit = units[u];
      }
      if (input.endsWith(units[u].name)) {
        selUnit = units[u];
        break;
      }
    }

    return { "type": "si", "prefix": selPref, "unit": selUnit }
  }




  function analyze(input) {
    _data.fields = getFields(input)
    getIDs(_data.field_order = _data.field_order)
    fields_further(_data)

  }

  function parseJSON(data) {
    let result = {}
    try {
      result = JSON.parse(data)
    }
    catch {
      return null
    }

    // check if result is in tabular form
    if (Array.isArray(result)) return result

    let listItems = []

    for (field in result) {
      if (Array.isArray(result[field])) {
        let res = result[field]
        for (let item of res) {
          let i = {}
          if (Array.isArray(item)) {
            i[field + ".item"] = item[0]
            i[field + ".value"] = item[0]
          } else {
            //console.log("$", item)
            for (let subitem in item) {
              i[field + ".item"] = subitem
              i[field + ".value"] = item[subitem]
              break;
            }
          }

          listItems.push(i)
        }
        return listItems;
      }
    }

    return null

  }

  function parseCSV(data) {

    let prefDel = [',', '\t', ';', '\\|', ':']

    let result = []
    // parse the csv
    let lines = data.split(/\r\n|\n|\r/);



    let maxNum = 0
    let del = ""
    for (let item of prefDel) {

      let occ = lines[0].match(new RegExp(item, "g"))
      if (occ === null) continue

      if (occ.length > maxNum) {
        maxNum = occ.length
        del = item
      }

    }

    if (del === "" || lines.length === 1) return null

    if (del === '\\|') {
      del = '|'
    }



    // find headers
    let head = lines[0].split(del)

    for (let i = 1; i < lines.length; i++) {
      let fields = lines[i].split(del)
      let item = {}
      for (let h = 0; h < head.length; h++) {
        if (h < fields.length) {
          item[head[h]] = fields[h]
        } else {
          item[head[h]] = ""
        }
      }
      result.push(item)
    }

    return result;


  }


  $.data = _data;






  return $;
}(Lumina || {}));

// semantic stuff 


var Lumina = (function ($) {


  var _sem = {}

  var _data = $.data


  _sem.terms = {}
  _sem.hyp = []
  _sem.symbols = {}
  _sem.colors = {}

  function getTermsAPI(terms) {
    let sem_api = Lumina.services["semantic"]
    let termsList = terms.join(",")
    termsList = termsList.replace("&", "and").replace("/", " ")
    return fetch("https://" + sem_api + "/terms/" + termsList).then(r => {
      return r.json()
    }).then(json => { return json })

  }

  function getSymAPI(terms) {
    let sym_api = Lumina.services["visual_lib"]
    let termsList = terms.join(",")
    termsList = termsList.replace("&", "and").replace("/", " ")
    return fetch("https://" + sym_api + "/all/" + termsList).then(r => {
      return r.json()
    }).then(json => { return json })

  }

  function getColorAPI(terms) {
    let sym_api = Lumina.services["visual_lib"]
    let termsList = terms.join(",")
    termsList = termsList.replace("&", "and").replace("/", " ")
    return fetch("https://" + sym_api + "/color/" + termsList).then(r => {
      return r.json()
    }).then(json => { return json })

  }

  _sem.clearTerms = function () {
    _sem.terms = {}
  }

  _sem.getColorsRemote = function (terms) {
    if (!terms || terms.length === 0) return
    let r = getColorAPI(terms)
    return r.then(j => {

      for (let item of j) {
        _sem.colors[item.name] = item.color
      }
      return true;
    });
  }


  _sem.getSymbolsRemote = function (terms) {
    if (!terms || terms.length === 0) return
    let r = getSymAPI(terms)
    return r.then(j => {

      for (let item of j) {
        _sem.symbols[item.name] = item.data
      }
      return true;
    });
  }




  _sem.getTermsRemote = function (terms) {
    if (!terms || terms.length === 0) return

    let setHyp = new Set()

    let r = getTermsAPI(terms)
    return r.then(j => {

      for (let item of j) {
        _sem.terms[item.name] = item
        for (let h of item.hypernyms) {
          setHyp.add(h)
        }
        setHyp.add(item.name)
      }
      _sem.hyp = Array.from(setHyp)
      return true;
    });
  }





  $.sem = _sem;



  return $;
}(Lumina || {}));

// visualization stuff 


var Lumina = (function ($) {
  var _sem = $.sem;
  var _data = $.data;

  var _viz = {};

  _viz.metrics = {}
  _viz.metrics.dataInkRatio = 1
  _viz.metrics.dataDensity = 1
  _viz.metrics.colors = new Set()
  _viz.metrics.width = 1
  _viz.metrics.height = 1
  _viz.metrics.margin = []
  _viz.metrics.inkShapes = []
  _viz.metrics.nonInkShapes = []
  _viz.metrics.dpi = 60




  _viz.container = "#lumi";


  _viz.metrics.checkColorContrast = function () {
    // contrast threshold delta-e result under 30
    thr = 30;

    let colorList = Array.from(_viz.metrics.colors)

    for (let i = 0; i < colorList.length; i++) {
      for (let j = i; j < colorList.length; j++) {
        let d = calcDeltaE(d3.lab(colorList[i]), d3.lab(colorList[j]))
        if (d < thr) {
          return false;
        }
      }
    }

    return true;

  }

  function calcDeltaE(col1, col2) {

    return Math.sqrt(
      Math.pow(col2.l - col1.l, 2) +
      Math.pow(col2.a - col1.a, 2) +
      Math.pow(col2.b - col1.b, 2)
    );
  };

  _viz.metrics.calcDataDensity = function () {

    let area = _viz.metrics.width * _viz.metrics.height / _viz.metrics.dpi;

    // count data 
    let nFields = 0
    data = Lumina.data.subset
    for (f in data[0]) {
      nFields++;
    }

    let dens = (nFields * data.length) / area

    _viz.metrics.dataDensity = dens
    return dens


  }


  _viz.metrics.calcDataInkRatio = function () {

    let inkSum = 0
    let nonInkSum = 0

    for (shape of _viz.metrics.inkShapes) {
      let bbox = shape.getBBox()
      let area = bbox.width * bbox.height
      inkSum = inkSum + area
    }

    for (shape of _viz.metrics.nonInkShapes) {
      let bbox = shape.getBBox()
      let area = bbox.width * bbox.height
      nonInkSum = nonInkSum + area
    }

    let ratio = inkSum / (inkSum + nonInkSum)
    _viz.metrics.dataInkRatio = ratio
    return ratio
  }

  _viz.plot = function (container, fields, colF = "", colS = "", tp = "") {

    

    viz_type = _viz.suggest_viz(fields)
    if (viz_type == "unknown") {
      return
    } else if (viz_type == "barchart") {
      if (tp === "vbar") {
        _viz.vbar(container, fields, colF, colS)
      } else if (tp == "radial") {
        _viz.radial(container, fields, colF, colS)
      } else {
        _viz.bar(container, fields, colF, colS)
      }

    } else if (viz_type == "scatterplot") {
      _viz.splot(container, fields, colF, colS)
    } else if (viz_type == "grouped_scatterplot") {
      _viz.gsplot(container, fields)
    } else if (viz_type == "timeline") {
      _viz.timeline(container, fields)
    } else if (viz_type == "wordcloud") {
      _viz.wordcloud(container, fields)
    }
  }

  _viz.suggest_viz = function (fields) {
    // check for barchart

    if (fields.length == 2) {
      aField = Lumina.data.fields[fields[0]];
      bField = Lumina.data.fields[fields[1]];

      if (
        aField["field_type"] == "quantitative" &&
        bField["field_type"] == "qualitative"
      ) {
        if (aField["value_type"] == "date") {
          return "timeline";
        }

        if (
          bField["name"].includes("term") ||
          bField["name"].includes("word")
        ) {
          return "wordcloud";
        }
        return "barchart";
      }
      if (
        aField["field_type"] == "quantitative" &&
        bField["field_type"] == "quantitative"
      )
        return "scatterplot";
    } else if (fields.length == 3) {
      aField = Lumina.data.fields[fields[0]];
      bField = Lumina.data.fields[fields[1]];
      cField = Lumina.data.fields[fields[2]];
      if (
        aField["field_type"] == "quantitative" &&
        bField["field_type"] == "quantitative" &&
        cField["field_type"] == "qualitative"
      ) {
        return "grouped_scatterplot"
      }

    }
    return "unknown";
  };

  _viz.getCat20 = function () {
    arr = [
      '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'
    ]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      const temp = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
    }
    return arr
  }

  _viz.colorNameHex = function (str) {

    var ctx = document.createElement('canvas').getContext("2d");
    ctx.fillStyle = str;
    return ctx.fillStyle;

  }

  _viz.getFaceOpts = function(term){

  }

  _viz.radial = function (container, fields, colF = "", colS = "") {
  

    console.log("creating a radial chart")
    console.log("colors:", colF, colS)
    _viz.metrics.colors = new Set()
    _viz.metrics.inkShapes = []
    _viz.metrics.nonInkShapes = []

    d3.select(container)
      .selectAll("*")
      .remove();

    let idF = fields[1];
    let nF = fields[0];

    if (colS === "") {
      colS = "field",
        colF = idF;
    }

    let colist = []
    let colIndx = 0;

    if (colS == "random") {
      colist = _viz.getCat20()
    }


    let data = Lumina.data.subset;

    // enrich data with face_app

    for (datum of data) {

      if (datum[idF] in Lumina.sem.terms) {
        let term = Lumina.sem.terms[datum[idF]];
        datum["_extras"] = {}
        if ("extras" in term && "image" in term["extras"]) {
          datum["_extras"]["image"] = term["extras"]["image"];
          datum["_extras"]["image_type"] = "image"
          if ("face_detect" in term["extras"]){
            datum["_extras"]["face"]=term["extras"]["face_detect"]
          } else {
            datum["_extras"]["face"] = {'x':10,'y':10,'w':10,'h':10}
          }
        } else if (term["name"] in Lumina.sem.symbols) {
          let img_str =
            "data:image/svg+xml;base64," + Lumina.sem.symbols[term["name"]];
          datum["_extras"]["image_type"] = "symbol"
          datum["_extras"]["image"]=img_str
          datum["_extras"]["face"] = {'x':0,'y':0,'w':0,'h':0}
        }
      }
    }

    

    let margin = { top: 120, right: 20, bottom: 120, left: 80 };



    let svg = d3.select(container)
    
    svg.attr("viewBox", [0, 0, svg.attr("width"),svg.attr("height") ])
    
    

   
   
   

    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom;

    _viz.metrics.width = width
    _viz.metrics.height = height
    _viz.metrics.margin = margin



    var tp = d3
      .select("body")
      .append("div")
      .attr("class", "tool-tip");

    var x = d3.scaleBand().range([width, 0]);
    x.domain(
      data.map(function (d) {
        return d[idF];
      })
    ).padding(0.1);


  
    

    var cc = d3.scaleLinear().range([0, 100]);


    var y = d3.scaleLinear().range([0, 100]);
    y.domain([
      0,
      d3.max(data, function (d) {
        return d[nF];
      })
    ]);


    cc.domain([
      0,
      d3.max(data, function (d) {
        return d[nF];
      })
    ]);

    // var y = d3.scaleLinear().range([height, 0]);
    // y.domain([
    //   0,
    //   d3.max(data, function (d) {
    //     return d[nF];
    //   })
    // ]);

    let ww = x.bandwidth()/2
    let std = 0.80*ww;
    let stw = 0.20*ww;
    


    var g0 = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g0.append("g")
      .attr("class", "axis-x")
      .attr("transform", "translate(0," + ((height/2)+(2*ww)) + ")")
      .call(d3.axisBottom(x));

   


    let zoom = d3.zoom().on("zoom",function () {
      g0.attr("transform", d3.event.transform)
   })

      svg.call(zoom)


     d3.select(window).on("keypress", function() {
      console.log("this was pressed")
     if(d3.event.keyCode === 27 || d3.event.keyCode === 13){
       svg.transition()
       .duration(750)
       .call(zoom.transform, d3.zoomIdentity.scale(1)); 
     }
   })
 

    var g = g0.selectAll()
      .data(data)
      .enter()
      .append("g").attr(
        "transform", function (d, i) {
          let dd = std / 2;
          // let dx = dd + (std * 3 * i) + pad + 20
          let dx = x(d[idF]) + ww
          let dy = dd + (height / 2)
          return `translate(${dx},${dy})`
        }
      )

    var g2 = g.append("g")
      .attr("transform", function (d) { return "scale(" + std / (d["_extras"]["face"].h * 0.7) + ")" })


    var defs = g2.append("defs")

    var clip = defs.append("clipPath").attr("id", function (d, i) {
      return "clip_" + i

    }).append("circle")
      .attr("cx", function (d) { return d["_extras"]["face"].x + d["_extras"]["face"].w / 2 })
      .attr("cy", function (d) { return d["_extras"]["face"].y + d["_extras"]["face"].h / 2 })
      .attr("r", function (d) { return d["_extras"]["face"].h * 0.7 })




    var img = g2.append("image").attr("href", function (d) { 
      return d["_extras"]["image"]
    })
      .attr("clip-path", function (d, i) {
        return "url(#clip_" + i + ")"
      }).attr("transform", function (d) {
        let dx = -(d["_extras"]["face"].x + d["_extras"]["face"].w / 2)
        let dy = -(d["_extras"]["face"].y + d["_extras"]["face"].h / 2)
        return "translate(" + dx + "," + dy + ")"

      })


  

    var circle = g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", std + stw / 2)
      .attr("stroke-width", stw)
      .attr("stroke", "white")
      .attr("fill", "transparent")

    var circle2 = g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", std + stw / 2)
      .attr("stroke-width", stw)
      .attr("stroke", function(d) {
        if (colS == "field") {
          let colName = d[colF]
          if (Array.isArray(d[colF])) {
            colName = d[colF][0]
          }
          console.log(colName);
          if (colName in Lumina.sem.colors) {
            // add color to metrics colors
            _viz.metrics.colors.add(Lumina.sem.colors[d[idF]]);
            return Lumina.sem.colors[colName];
          }
        } else if (colS == "random") {
          colIndx++;
          if (colIndx >= 20) colIndx = 0;
          return colist[colIndx];

        } else if (colS == "single") {
          return colF;
        } else if (colS == "intensity") {

          let adjustment = 50 - cc(d[nF]);
          console.log(adjustment, d[nF], cc(d[nF]));
          if (!colF.startsWith("#")) {
            colF = _viz.colorNameHex(colF)
          }
          console.log(_viz.adjust(colF, adjustment))
          return _viz.adjust(colF, -(adjustment * 3))

        }

        return "grey";
      })
      .attr("fill", "transparent")
      .attr("opacity", "0.2")

    g.append("text")
    .attr("x",0)
    .attr("y",-(std+stw*2))
    .attr("text-anchor","middle")
    .text(function(d){return d[nF]})
    .attr("fill", function(d) {
        if (colS == "field") {
          let colName = d[colF]
          if (Array.isArray(d[colF])) {
            colName = d[colF][0]
          }
          console.log(colName);
          if (colName in Lumina.sem.colors) {
            // add color to metrics colors
            _viz.metrics.colors.add(Lumina.sem.colors[d[idF]]);
            return Lumina.sem.colors[colName];
          }
        } else if (colS == "random") {
          colIndx++;
          if (colIndx >= 20) colIndx = 0;
          return colist[colIndx];

        } else if (colS == "single") {
          return colF;
        } else if (colS == "intensity") {

          let adjustment = 50 - cc(d[nF]);
          console.log(adjustment, d[nF], cc(d[nF]));
          if (!colF.startsWith("#")) {
            colF = _viz.colorNameHex(colF)
          }
          console.log(_viz.adjust(colF, adjustment))
          return _viz.adjust(colF, -(adjustment * 3))

        }

        return "grey";
      })
    


    var circle3 = g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", std + stw / 2)
      .attr("stroke-width", stw * 0.9)
      .attr("stroke", function(d){
        console.log(colF)
        if (colS == "field") {
          let colName = d[colF]
          if (Array.isArray(d[colF])) {
            colName = d[colF][0]
          }
          console.log(colName);
          if (colName in Lumina.sem.colors) {
            // add color to metrics colors
            _viz.metrics.colors.add(Lumina.sem.colors[d[idF]]);
            return Lumina.sem.colors[colName];
          }
        } else if (colS == "random") {
          colIndx++;
          if (colIndx >= 20) colIndx = 0;
          return colist[colIndx];

        } else if (colS == "single") {
          return colF;
        } else if (colS == "intensity") {

          let adjustment = 50 - cc(d[nF]);
          console.log(adjustment, d[nF], cc(d[nF]));
          if (!colF.startsWith("#")) {
            colF = _viz.colorNameHex(colF)
          }
          console.log(_viz.adjust(colF, adjustment))
          return _viz.adjust(colF, -(adjustment * 3))

        }

        return "grey"
      })
      .attr("fill", "transparent")
      .attr("stroke-dasharray", function (d, i) {
        let rad = std + stw / 2
        let circ = 2 * Math.PI * rad
        let z1 = y(d[nF]) * (circ / 100)
        let z2 = circ
        return z1 + " " + z2

      })
      .attr("transform", "rotate(-90)")
      .attr("stroke-linecap", "round")

   


    // g.append("g")
    //   .attr("class", "axis-y")
    //   .call(
    //     d3
    //       .axisLeft(y)
    //       .ticks(10)
    //       .tickFormat(function (d) {
    //         return parseInt(d);
    //       })
    //       .tickSizeInner([-width])
    //   );




    // g.selectAll(".bar")
    //   .data(data)
    //   .enter()
    //   .append("rect")
    //   .attr("fill", function (d) {
    //     if (colS == "field"){
    //       let colName = d[colF]
    //       if (Array.isArray(d[colF])) {
    //         colName = d[colF][0]
    //       } 
    //       console.log(colName);
    //       if (colName in Lumina.sem.colors) {
    //         // add color to metrics colors
    //         _viz.metrics.colors.add(Lumina.sem.colors[d[idF]]);
    //         return Lumina.sem.colors[colName];
    //       }
    //     } else if (colS == "random") {
    //       colIndx++; // g.append("g")
    //       //   .attr("class", "axis-y")
    //       //   .call(
    //       //     d3
    //       //       .axisLeft(y)
    //       //       .ticks(10)
    //       //       .tickFormat(function (d) {
    //       //         return parseInt(d);
    //       //       })
    //       //       .tickSizeInner([-width])
    //       //   );
    //       if (colIndx>=20) colIndx=0;
    //       return colist[colIndx];

    //     } else if (colS == "single"){
    //       return colF; 
    //     } else if (colS == "intensity") {

    //       let adjustment = 50 - cc(d[nF]);
    //       console.log(adjustment,d[nF],cc(d[nF]));
    //       if (!colF.startsWith("#")){
    //         colF= _viz.colorNameHex(colF)
    //       }
    //       console.log(_viz.adjust(colF,adjustment))
    //       return _viz.adjust(colF,-(adjustment*3))

    //     }

    //     return "grey";
    //   })
    //   .attr("class", "bar")
    //   .attr("y", function (d) {
    //     return y(d[nF]);
    //   })
    //   .attr("width", x.bandwidth())
    //   .attr("x", function (d) {
    //     return x(d[idF]);
    //   })
    //   .attr("height", function (d) {
    //     return height-y(d[nF]);
    //     //return 10;
    //   })
    //   .on("mousemove", function (d) {
    //     let cx = d3.event.pageX + 20;
    //     let cy = d3.event.pageY - 50;
    //     tp.style("position", "absolute")
    //       .style("display", "inline-block")
    //       .style("left", cx + "px")
    //       .style("top", cy + "px")
    //       .style("background-color", "white")
    //       .style("pointer-events", "none")
    //       .style("border", "1px solid black")
    //       .style("padding", "10px")

    //       .html(genToolTipContents(d[idF], d[nF], nF));
    //   })
    //   .on("mouseout", function (d) {
    //     tp.style("display", "none");
    //   });

    // g.selectAll(".sym")
    //   .data(data)
    //   .enter()
    //   .append("image")
    //   .attr('class', 'sym')
    //   .attr("href", function (d) {
    //     if (d[idF] in Lumina.sem.terms) {
    //       let term = Lumina.sem.terms[d[idF]];

    //       if ("extras" in term && "image" in term["extras"]) {
    //         return term["extras"]["image"];
    //       } else if (term["name"] in Lumina.sem.symbols) {
    //         let img_str =
    //           "data:image/svg+xml;base64," + Lumina.sem.symbols[term["name"]];
    //         return img_str;
    //       }
    //     }
    //   })
    //   .attr("x", function (d) {
    //     return x(d[idF]);
    //   })
    //   .attr("y", function (d) {
    //     if (x.bandwidth() > 100) return y(d[nF]) - 100;
    //     return y(d[nF])-x.bandwidth();
    //   })
    //   .attr("width", function (d) {
    //     if (x.bandwidth() > 100) return 100;
    //     return x.bandwidth();
    //   })
    //   .attr("height", function (d) {
    //     if (x.bandwidth() > 100) return 100;
    //     return x.bandwidth();
    //   });

    // g.selectAll(".tick line").attr("stroke", "grey");
    // g.select(".axis-x .domain").attr("stroke", "none");

    // // text label for the x axis
    // g.append("text")
    //   .attr(
    //     "transform",
    //     "translate(" + width / 2 + " ," + (height + margin.top + 40) + ")"
    //   )
    //   .style("text-anchor", "middle")
    //   .text(idF);

    // // text label for the y axis
    // g.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 0 - margin.left)
    //   .attr("x", 0 - height / 2)
    //   .attr("dy", "1em")
    //   .style("text-anchor", "middle")
    //   .text(nF);


    // _viz.metrics.inkShapes = _viz.metrics.inkShapes.concat(d3.selectAll(".bar").nodes())
    // _viz.metrics.nonInkShapes = _viz.metrics.nonInkShapes.concat(d3.selectAll(".sym").nodes())


  };

  _viz.vbar = function (container, fields, colF = "", colS = "") {


    console.log("creating vertical bar chart")
    console.log("colors:", colF, colS)
    _viz.metrics.colors = new Set()
    _viz.metrics.inkShapes = []
    _viz.metrics.nonInkShapes = []

    d3.select(container)
      .selectAll("*")
      .remove();

    let idF = fields[1];
    let nF = fields[0];

    if (colS === "") {
      colS = "field",
        colF = idF;
    }

    let colist = []
    let colIndx = 0;

    if (colS == "random") {
      colist = _viz.getCat20()
    }


    let data = Lumina.data.subset;

    let margin = { top: 120, right: 20, bottom: 120, left: 80 };

    let svg = d3.select(container);

    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom;

    _viz.metrics.width = width
    _viz.metrics.height = height
    _viz.metrics.margin = margin



    var tp = d3
      .select("body")
      .append("div")
      .attr("class", "tool-tip");

    var x = d3.scaleBand().range([width, 0]);
    x.domain(
      data.map(function (d) {
        return d[idF];
      })
    ).padding(0.1);

    var cc = d3.scaleLinear().range([0, 100]);


    cc.domain([
      0,
      d3.max(data, function (d) {
        return d[nF];
      })
    ]);

    var y = d3.scaleLinear().range([height, 0]);
    y.domain([
      0,
      d3.max(data, function (d) {
        return d[nF];
      })
    ]);

    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
      .attr("class", "axis-x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));




    g.append("g")
      .attr("class", "axis-y")
      .call(
        d3
          .axisLeft(y)
          .ticks(10)
          .tickFormat(function (d) {
            return parseInt(d);
          })
          .tickSizeInner([-width])
      );


    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("fill", function (d) {
        if (colS == "field") {
          let colName = d[colF]
          if (Array.isArray(d[colF])) {
            colName = d[colF][0]
          }
          console.log(colName);
          if (colName in Lumina.sem.colors) {
            // add color to metrics colors
            _viz.metrics.colors.add(Lumina.sem.colors[d[idF]]);
            return Lumina.sem.colors[colName];
          }
        } else if (colS == "random") {
          colIndx++;
          if (colIndx >= 20) colIndx = 0;
          return colist[colIndx];

        } else if (colS == "single") {
          return colF;
        } else if (colS == "intensity") {

          let adjustment = 50 - cc(d[nF]);
          console.log(adjustment, d[nF], cc(d[nF]));
          if (!colF.startsWith("#")) {
            colF = _viz.colorNameHex(colF)
          }
          console.log(_viz.adjust(colF, adjustment))
          return _viz.adjust(colF, -(adjustment * 3))

        }

        return "grey";
      })
      .attr("class", "bar")
      .attr("y", function (d) {
        return y(d[nF]);
      })
      .attr("width", x.bandwidth())
      .attr("x", function (d) {
        return x(d[idF]);
      })
      .attr("height", function (d) {
        return height - y(d[nF]);
        //return 10;
      })
      .on("mousemove", function (d) {
        let cx = d3.event.pageX + 20;
        let cy = d3.event.pageY - 50;
        tp.style("position", "absolute")
          .style("display", "inline-block")
          .style("left", cx + "px")
          .style("top", cy + "px")
          .style("background-color", "white")
          .style("pointer-events", "none")
          .style("border", "1px solid black")
          .style("padding", "10px")

          .html(genToolTipContents(d[idF], d[nF], nF));
      })
      .on("mouseout", function (d) {
        tp.style("display", "none");
      });

    g.selectAll(".sym")
      .data(data)
      .enter()
      .append("image")
      .attr('class', 'sym')
      .attr("href", function (d) {
        if (d[idF] in Lumina.sem.terms) {
          let term = Lumina.sem.terms[d[idF]];

          if ("extras" in term && "image" in term["extras"]) {
            return term["extras"]["image"];
          } else if (term["name"] in Lumina.sem.symbols) {
            let img_str =
              "data:image/svg+xml;base64," + Lumina.sem.symbols[term["name"]];
            return img_str;
          }
        }
      })
      .attr("x", function (d) {
        return x(d[idF]);
      })
      .attr("y", function (d) {
        if (x.bandwidth() > 100) return y(d[nF]) - 100;
        return y(d[nF]) - x.bandwidth();
      })
      .attr("width", function (d) {
        if (x.bandwidth() > 100) return 100;
        return x.bandwidth();
      })
      .attr("height", function (d) {
        if (x.bandwidth() > 100) return 100;
        return x.bandwidth();
      });

    g.selectAll(".tick line").attr("stroke", "grey");
    g.select(".axis-x .domain").attr("stroke", "none");

    // text label for the x axis
    g.append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 40) + ")"
      )
      .style("text-anchor", "middle")
      .text(idF);

    // text label for the y axis
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(nF);


    _viz.metrics.inkShapes = _viz.metrics.inkShapes.concat(d3.selectAll(".bar").nodes())
    _viz.metrics.nonInkShapes = _viz.metrics.nonInkShapes.concat(d3.selectAll(".sym").nodes())


  };

  _viz.bar = function (container, fields, colF = "", colS = "") {


    console.log("creating bar chart")
    console.log("colors:", colF, colS)
    _viz.metrics.colors = new Set()
    _viz.metrics.inkShapes = []
    _viz.metrics.nonInkShapes = []

    d3.select(container)
      .selectAll("*")
      .remove();

    let idF = fields[1];
    let nF = fields[0];

    if (colS === "") {
      colS = "field",
        colF = idF;
    }

    let colist = []
    let colIndx = 0;

    if (colS == "random") {
      colist = _viz.getCat20()
    }


    let data = Lumina.data.subset;

    let margin = { top: 20, right: 20, bottom: 80, left: 220 };

    let svg = d3.select(container);

    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom;

    _viz.metrics.width = width
    _viz.metrics.height = height
    _viz.metrics.margin = margin



    var tp = d3
      .select("body")
      .append("div")
      .attr("class", "tool-tip");

    var y = d3.scaleBand().range([height, 0]);
    y.domain(
      data.map(function (d) {
        return d[idF];
      })
    ).padding(0.1);

    var cc = d3.scaleLinear().range([0, 100]);


    cc.domain([
      0,
      d3.max(data, function (d) {
        return d[nF];
      })
    ]);

    var x = d3.scaleLinear().range([0, width]);
    x.domain([
      0,
      d3.max(data, function (d) {
        return d[nF];
      })
    ]);

    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
      .attr("class", "axis-x")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(x)
          .ticks(10)
          .tickFormat(function (d) {
            return parseInt(d);
          })
          .tickSizeInner([-height])
      );




    g.append("g")
      .attr("class", "axis-y")
      .call(d3.axisLeft(y));

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("fill", function (d) {
        if (colS == "field") {
          let colName = d[colF]
          if (Array.isArray(d[colF])) {
            colName = d[colF][0]
          }
          console.log(colName);
          if (colName in Lumina.sem.colors) {
            // add color to metrics colors
            _viz.metrics.colors.add(Lumina.sem.colors[d[idF]]);
            return Lumina.sem.colors[colName];
          }
        } else if (colS == "random") {
          colIndx++;
          if (colIndx >= 20) colIndx = 0;
          return colist[colIndx];

        } else if (colS == "single") {
          return colF;
        } else if (colS == "intensity") {

          let adjustment = 50 - cc(d[nF]);
          console.log(adjustment, d[nF], cc(d[nF]));
          if (!colF.startsWith("#")) {
            colF = _viz.colorNameHex(colF)
          }
          console.log(_viz.adjust(colF, adjustment))
          return _viz.adjust(colF, -(adjustment * 3))

        }

        return "grey";
      })
      .attr("class", "bar")
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("y", function (d) {
        return y(d[idF]);
      })
      .attr("width", function (d) {
        return x(d[nF]);
      })
      .on("mousemove", function (d) {
        let cx = d3.event.pageX + 20;
        let cy = d3.event.pageY - 50;
        tp.style("position", "absolute")
          .style("display", "inline-block")
          .style("left", cx + "px")
          .style("top", cy + "px")
          .style("background-color", "white")
          .style("pointer-events", "none")
          .style("border", "1px solid black")
          .style("padding", "10px")

          .html(genToolTipContents(d[idF], d[nF], nF));
      })
      .on("mouseout", function (d) {
        tp.style("display", "none");
      });

    g.selectAll(".sym")
      .data(data)
      .enter()
      .append("image")
      .attr('class', 'sym')
      .attr("href", function (d) {
        if (d[idF] in Lumina.sem.terms) {
          let term = Lumina.sem.terms[d[idF]];

          if ("extras" in term && "image" in term["extras"]) {
            return term["extras"]["image"];
          } else if (term["name"] in Lumina.sem.symbols) {
            let img_str =
              "data:image/svg+xml;base64," + Lumina.sem.symbols[term["name"]];
            return img_str;
          }
        }
      })
      .attr("x", function (d) {
        if (y.bandwidth() > 50) {
          return -200;
        }
        return -(100 + y.bandwidth());
      })
      .attr("y", function (d) {
        if (y.bandwidth() > 50) {
          return y(d[idF]) + y.bandwidth() / 4;
        }
        return y(d[idF]);
      })
      .attr("width", function (d) {
        if (y.bandwidth() > 50) return 50;
        return y.bandwidth();
      })
      .attr("height", function (d) {
        if (y.bandwidth() > 50) return 50;
        return y.bandwidth();
      });

    g.selectAll(".tick line").attr("stroke", "grey");
    g.select(".axis-x .domain").attr("stroke", "none");

    // text label for the x axis
    g.append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 40) + ")"
      )
      .style("text-anchor", "middle")
      .text(nF);

    // text label for the y axis
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(idF);


    _viz.metrics.inkShapes = _viz.metrics.inkShapes.concat(d3.selectAll(".bar").nodes())
    _viz.metrics.nonInkShapes = _viz.metrics.nonInkShapes.concat(d3.selectAll(".sym").nodes())


  };

  _viz.adjust = function (colorCode, amount) {
    var usePound = false;

    if (colorCode[0] == "#") {
      colorCode = colorCode.slice(1);
      usePound = true;
    }

    var num = parseInt(colorCode, 16);

    var r = (num >> 16) + amount;

    if (r > 255) {
      r = 255;
    } else if (r < 0) {
      r = 0;
    }

    var b = ((num >> 8) & 0x00FF) + amount;

    if (b > 255) {
      b = 255;
    } else if (b < 0) {
      b = 0;
    }

    var g = (num & 0x0000FF) + amount;

    if (g > 255) {
      g = 255;
    } else if (g < 0) {
      g = 0;
    }

    var string = "000000" + (g | (b << 8) | (r << 16)).toString(16);
    return (usePound ? "#" : "") + string.substr(string.length - 6);

  }

  _viz.splot = function (container, fields, colF = "", colS = "") {

    _viz.metrics.colors = new Set()
    _viz.metrics.inkShapes = []
    _viz.metrics.nonInkShapes = []

    d3.select(container)
      .selectAll("*")
      .remove();

    let nF2 = fields[1];
    let nF1 = fields[0];

    let data = Lumina.data.subset;

    let margin = { top: 20, right: 20, bottom: 80, left: 220 };

    let svg = d3.select(container);

    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom;

    var tp = d3
      .select("body")
      .append("div")
      .attr("class", "tool-tip");



    // var y = d3.scaleLinear().range([height, 0]);
    // y.domain([
    //   0,
    //   d3.max(data, function(d) {
    //     return d[nF2];
    //   })
    // ]);


    // var x = d3.scaleLinear().range([0, width]);
    // x.domain([
    //   0,
    //   d3.max(data, function(d) {
    //     return d[nF1];
    //   })
    // ]);
    var cc = d3.scaleLinear().range([0, 100]);

    let colist = []
    let colIndx = 0;

    if (colS == "random") {
      colist = _viz.getCat20()
    }

    cc.domain([
      0,
      d3.max(data, function (d) {
        return d[nF1];
      })
    ]);


    var y = null
    if (Lumina.data.fields[nF2]["value_type"] == "date") {
      y = d3.scaleTime().range([height, 0])
      y.domain([
        d3.min(data, function (d) { return d[nF2] }),
        d3.max(data, function (d) {
          return d[nF2];
        })
      ]);

    } else {
      y = d3.scaleLinear().range([height, 0]);
      y.domain([
        0,
        d3.max(data, function (d) {
          return d[nF2];
        })
      ]);

    }


    var x = null
    if (Lumina.data.fields[nF1]["value_type"] == "date") {
      x = d3.scaleTime().range([0, width]);
      x.domain([
        d3.min(data, function (d) { return d[nF1] }),
        d3.max(data, function (d) {
          return d[nF1];
        })
      ]);
    }
    else {
      x = d3.scaleLinear().range([0, width]);
      x.domain([
        0,
        d3.max(data, function (d) {
          return d[nF1];
        })
      ]);
    }

    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
      .attr("class", "axis-x")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(x)
          .ticks(10)
          .tickFormat(function (d) {
            return parseInt(d);
          })
          .tickSizeInner([-height])
      );

    g.append("g")
      .attr("class", "axis-y")
      .call(d3.axisLeft(y).ticks(10).tickSizeInner([-width]));


    g.selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("r", 5)
      .attr("cx", function (d) { console.log(nF1, d[nF1], x(d[nF1])); return x(d[nF1]); })
      .attr("cy", function (d) { console.log(nF2, d[nF2], y(d[nF2])); return y(d[nF2]); })
      .attr("fill", function (d) {

        if (colS == "field") {
          let colName = d[colF]
          if (Array.isArray(d[colF])) {
            colName = d[colF][0]
          }
          console.log(colName);
          if (colName in Lumina.sem.colors) {
            // add color to metrics colors
            _viz.metrics.colors.add(Lumina.sem.colors[d[idF]]);
            return Lumina.sem.colors[colName];
          }
        } else if (colS == "random") {
          colIndx++;
          if (colIndx >= 20) colIndx = 0;
          return colist[colIndx];

        } else if (colS == "single") {
          return colF;
        } else if (colS == "intensity") {

          let adjustment = 50 - cc(d[nF1]);
          console.log(adjustment, d[nF1], cc(d[nF1]));
          if (!colF.startsWith("#")) {
            colF = _viz.colorNameHex(colF)
          }
          console.log(_viz.adjust(colF, adjustment))
          return _viz.adjust(colF, -(adjustment * 3))

        }

        return "grey";

      })

      .on("mousemove", function (d) {
        let cx = d3.event.pageX + 20;
        let cy = d3.event.pageY - 50;
        tp.style("position", "absolute")
          .style("display", "inline-block")
          .style("left", cx + "px")
          .style("top", cy + "px")
          .style("background-color", "white")
          .style("pointer-events", "none")
          .style("border", "1px solid black")
          .style("padding", "10px")

          .html(function () {
            return "<div>" + nF2 + ":" + d[nF2] + "<br/>" +
              nF1 + ": " + d[nF1] + "</div>"
          });
      })
      .on("mouseout", function (d) {
        tp.style("display", "none");
      });



    g.selectAll(".tick line").attr("stroke", "grey");
    g.select(".axis-x .domain").attr("stroke", "none");

    // text label for the x axis
    g.append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 40) + ")"
      )
      .style("text-anchor", "middle")
      .text(nF1);

    // text label for the y axis
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(nF2);

    //   var zoom = d3.zoom()
    //   .scaleExtent([1, 40])
    //   .translateExtent([[-100, -100], [width +100, height +100]])
    //   .on("zoom", function(){
    //     svg.attr("transform", d3.event.transform);
    //   });

    //   svg.call(zoom);





    _viz.metrics.inkShapes = _viz.metrics.inkShapes.concat(d3.selectAll(".point").nodes())
    _viz.metrics.nonInkShapes = _viz.metrics.nonInkShapes.concat(d3.selectAll(".sym").nodes())
  };



  _viz.gsplot = function (container, fields) {

    _viz.metrics.colors = new Set()
    _viz.metrics.inkShapes = []
    _viz.metrics.nonInkShapes = []


    d3.select(container)
      .selectAll("*")
      .remove();


    let idF = fields[2];
    let nF2 = fields[1];
    let nF1 = fields[0];


    let data = Lumina.data.subset;

    let margin = { top: 20, right: 20, bottom: 80, left: 220 };

    let svg = d3.select(container);

    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom;

    var tp = d3
      .select("body")
      .append("div")
      .attr("class", "tool-tip");



    var y = null
    if (Lumina.data.fields[nF2]["value_type"] == "date") {
      y = d3.scaleTime().range([height, 0])
      y.domain([
        d3.min(data, function (d) { return d[nF2] }),
        d3.max(data, function (d) {
          return d[nF2];
        })
      ]);

    } else {
      y = d3.scaleLinear().range([height, 0]);
      y.domain([
        0,
        d3.max(data, function (d) {
          return d[nF2];
        })
      ]);

    }


    var x = null
    if (Lumina.data.fields[nF1]["value_type"] == "date") {
      x = d3.scaleTime().range([0, width]);
      x.domain([
        d3.min(data, function (d) { return d[nF1] }),
        d3.max(data, function (d) {
          return d[nF1];
        })
      ]);
    }
    else {
      x = d3.scaleLinear().range([0, width]);
      x.domain([
        0,
        d3.max(data, function (d) {
          return d[nF1];
        })
      ]);
    }



    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
      .attr("class", "axis-x")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(x)
          .ticks(10)
          .tickFormat(function (d) {
            if (typeof (d) == "date") {
              return d.toLocaleDateString()
            }
            return parseInt(d);
          })
          .tickSizeInner([-height])
      );

    g.append("g")
      .attr("class", "axis-y")
      .call(d3.axisLeft(y).ticks(10).tickFormat(function (d) {

        if (d instanceof Date) {
          return d.toLocaleDateString()
        }
        return parseInt(d);

      }).tickSizeInner([-width]));

    g.selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("r", 6)
      .attr("cx", function (d) { return x(d[nF1]); })
      .attr("cy", function (d) { return y(d[nF2]); })
      .attr("fill", function (d) {
        if (d[idF] in Lumina.sem.colors) {
          // add color to metrics colors
          _viz.metrics.colors.add(Lumina.sem.colors[d[idF]]);
          return Lumina.sem.colors[d[idF]];
        }
        return "grey";
      })

      .on("mousemove", function (d) {
        let cx = d3.event.pageX + 20;
        let cy = d3.event.pageY - 50;
        tp.style("position", "absolute")
          .style("display", "inline-block")
          .style("left", cx + "px")
          .style("top", cy + "px")
          .style("background-color", "white")
          .style("pointer-events", "none")
          .style("border", "1px solid black")
          .style("padding", "10px")

          .html(function () {
            return "<div>" + nF2 + ":" + d[nF2] + "<br/>" +
              nF1 + ": " + d[nF1] + "<br/>" +
              genToolTipContents(d[idF], d[nF1], nF1)
            "</div>"
          });
      })
      .on("mouseout", function (d) {
        tp.style("display", "none");
      });

    g.selectAll(".sym")
      .data(data)
      .enter()
      .append("image")
      .attr("href", function (d) {
        if (d[idF] in Lumina.sem.terms) {
          let term = Lumina.sem.terms[d[idF]];

          if ("extras" in term && "image" in term["extras"]) {
            return term["extras"]["image"];
          } else if (term["name"] in Lumina.sem.symbols) {
            let img_str =
              "data:image/svg+xml;base64," + Lumina.sem.symbols[term["name"]];
            return img_str;
          }
        }
      }).style("pointer-events", "none")
      .attr("x", function (d) { return x(d[nF1]) - 32 / 2; })
      .attr("y", function (d) { if (y(d[nF2]) - 36 < 0) return y(d[nF2]) + 8; return y(d[nF2]) - 42; })
      .attr("width", "32")
      .attr("height", "32")


    g.selectAll(".tick line").attr("stroke", "grey");
    g.select(".axis-x .domain").attr("stroke", "none");

    // text label for the x axis
    g.append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 40) + ")"
      )
      .style("text-anchor", "middle")
      .text(nF1);

    // text label for the y axis
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(nF2);

    _viz.metrics.inkShapes = _viz.metrics.inkShapes.concat(d3.selectAll(".point").nodes())
    _viz.metrics.nonInkShapes = _viz.metrics.nonInkShapes.concat(d3.selectAll(".sym").nodes())
  };

  _viz.timeline = function (container, fields) {

    _viz.metrics.colors = new Set()
    _viz.metrics.inkShapes = []
    _viz.metrics.nonInkShapes = []

    d3.select(container)
      .selectAll("*")
      .remove();


    let idF = fields[1];
    let nF1 = fields[0];


    let data = Lumina.data.subset;

    let margin = { top: 20, right: 20, bottom: 80, left: 220 };

    let svg = d3.select(container);

    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom;

    var tp = d3
      .select("body")
      .append("div")
      .attr("class", "tool-tip");



    var y = d3.scaleBand().range([height, 0]);
    y.domain(
      data.map(function (d) {
        return d[idF];
      })
    ).padding(0.1);



    var x = d3.scaleTime().range([0, width]);
    x.domain([
      d3.min(data, function (d) { return d[nF1] }),
      d3.max(data, function (d) {
        return d[nF1];
      })
    ]);





    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
      .attr("class", "axis-x")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(x)
          .ticks(10)
          .tickFormat(function (d) {
            return d.toLocaleDateString()
          })
          .tickSizeInner([-height])
      );

    g.append("g")
      .attr("class", "axis-y")
      .call(d3.axisLeft(y).ticks(10).tickFormat(function (d) {

        if (d instanceof Date) {
          return d.toLocaleDateString()
        }
        return d;

      }).tickSizeInner([-width]));

    g.selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("r", 6)
      .attr("cx", function (d) { return x(d[nF1]); })
      .attr("cy", function (d) { return y(d[idF]) + y.bandwidth() / 2; })
      .attr("fill", function (d) {
        if (d[idF] in Lumina.sem.colors) {
          // add color to metrics colors
          _viz.metrics.colors.add(Lumina.sem.colors[d[idF]]);
          return Lumina.sem.colors[d[idF]];
        }
        return "grey";
      })

      .on("mousemove", function (d) {
        let cx = d3.event.pageX + 20;
        let cy = d3.event.pageY - 50;
        tp.style("position", "absolute")
          .style("display", "inline-block")
          .style("left", cx + "px")
          .style("top", cy + "px")
          .style("background-color", "white")
          .style("pointer-events", "none")
          .style("border", "1px solid black")
          .style("padding", "10px")

          .html(function () {
            return genToolTipContents(d[idF], d[nF1], nF1)

          });
      })
      .on("mouseout", function (d) {
        tp.style("display", "none");
      });

    g.selectAll(".sym")
      .data(data)
      .enter()
      .append("image")
      .attr("href", function (d) {
        if (d[idF] in Lumina.sem.terms) {
          let term = Lumina.sem.terms[d[idF]];

          if ("extras" in term && "image" in term["extras"]) {
            return term["extras"]["image"];
          } else if (term["name"] in Lumina.sem.symbols) {
            let img_str =
              "data:image/svg+xml;base64," + Lumina.sem.symbols[term["name"]];
            return img_str;
          }
        }
      }).style("pointer-events", "none")
      .attr("x", function (d) { return x(d[nF1]) - 32 / 2; })
      .attr("y", function (d) { if ((y(d[idF]) + y.bandwidth() / 2) - 36 < 0) return (y(d[idF]) + y.bandwidth() / 2) + 8; return y(d[idF]) + y.bandwidth() / 2 - 42; })
      .attr("width", "32")
      .attr("height", "32")


    g.selectAll(".tick line").attr("stroke", "grey");
    g.select(".axis-x .domain").attr("stroke", "none");
    g.select(".axis-y .domain").attr("stroke", "none");
    g.selectAll(".axis-x .tick line").attr("stroke-dasharray", 4);
    g.selectAll(".axis-y .tick line").attr("stroke-width", 2);

    // text label for the x axis
    g.append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 40) + ")"
      )
      .style("text-anchor", "middle")
      .text(nF1);

    // text label for the y axis
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(idF);


    _viz.metrics.inkShapes = _viz.metrics.inkShapes.concat(d3.selectAll(".point").nodes())
    _viz.metrics.nonInkShapes = _viz.metrics.nonInkShapes.concat(d3.selectAll(".sym").nodes())
  };

  _viz.wordcloud = function (container, fields) {

    _viz.metrics.colors = new Set()
    _viz.metrics.inkShapes = []
    _viz.metrics.nonInkShapes = []


    d3.select(container)
      .selectAll("*")
      .remove();


    let idF = fields[1];
    let nF1 = fields[0];


    let data = { name: "root", children: Lumina.data.subset };

    let margin = { top: 20, right: 20, bottom: 80, left: 220 };

    let svg = d3.select(container);

    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom;

    var tp = d3
      .select("body")
      .append("div")
      .attr("class", "tool-tip");

    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    const root = d3.hierarchy(data)
      .sum(function (d) { return d[nF1] })
      .sort(function (a, b) { return b[nF1] - a[nF1] })
    const nodes = root.descendants()

    const layout = d3.pack()
      .size([width - 2, height - 2])
      .padding(6)



    nodes2 = nodes.shift()

    g.selectAll('circle').data(nodes2)
      .enter().append('circle')
      .attr('cx', function (d) { return data.d.x; })
      .attr('cy', function (d) { return data.d.y; })
      .attr('r', function (d) { return data.d.r; })
      .attr('fill', 'white')
      .attr('stroke', 'grey')


      .on("mousemove", function (d) {
        let cx = d3.event.pageX + 20;
        let cy = d3.event.pageY - 50;
        tp.style("position", "absolute")
          .style("display", "inline-block")
          .style("left", cx + "px")
          .style("top", cy + "px")
          .style("background-color", "white")
          .style("pointer-events", "none")
          .style("border", "1px solid black")
          .style("padding", "10px")

          .html(function () {
            return genToolTipContents(d[idF], d[nF1], nF1)

          });
      })
      .on("mouseout", function (d) {
        tp.style("display", "none");
      });

    //   g.selectAll(".sym")
    //   .data(data)
    //   .enter()
    //   .append("image")
    //   .attr("href", function(d) {
    //     if (d[idF] in Lumina.sem.terms) {
    //       let term = Lumina.sem.terms[d[idF]];

    //       if ("extras" in term && "image" in term["extras"]) {
    //         return term["extras"]["image"];
    //       } else if (term["name"] in Lumina.sem.symbols) {
    //         let img_str =
    //           "data:image/svg+xml;base64," + Lumina.sem.symbols[term["name"]];
    //         return img_str;
    //       }
    //     }
    //   }).style("pointer-events","none")
    //   .attr("x", function(d) {  return x(d[nF1])-32/2; })
    //   .attr("y", function(d) {  if ((y(d[idF]) +y.bandwidth()/2) -36 < 0) return (y(d[idF])+y.bandwidth()/2)+8; return y(d[idF])+y.bandwidth()/2-42; })
    //   .attr("width","32")
    //   .attr("height","32")


    // g.selectAll(".tick line").attr("stroke", "grey");
    // g.select(".axis-x .domain").attr("stroke", "none");
    // g.select(".axis-y .domain").attr("stroke", "none");
    // g.selectAll(".axis-x .tick line").attr("stroke-dasharray",4);
    // g.selectAll(".axis-y .tick line").attr("stroke-width",2);

    // // text label for the x axis
    // g.append("text")
    //   .attr(
    //     "transform",
    //     "translate(" + width / 2 + " ," + (height + margin.top + 40) + ")"
    //   )
    //   .style("text-anchor", "middle")
    //   .text(nF1);

    // // text label for the y axis
    // g.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 0 - margin.left)
    //   .attr("x", 0 - height / 2)
    //   .attr("dy", "1em")
    //   .style("text-anchor", "middle")
    //   .text(idF);
  };

  function genToolTipContents(idF, nF, nameNf) {
    let terms = Lumina.sem.terms;
    let tmpl = "<div>";
    if (idF in terms) {
      let term = terms[idF];

      tmpl = tmpl + "<strong>" + idF + " </strong>";

      if (term["semantic"] == "named_entity") {
        tmpl = tmpl + "<hr/>";
        for (let extraName in term["extras"]) {
          if (extraName == "image") continue;
          tmpl =
            tmpl +
            "<strong>" +
            extraName +
            " </strong><code>" +
            term["extras"][extraName] +
            "</code><br/>";
        }
      }
    }
    tmpl =
      tmpl + "<hr/><strong>" + nameNf + "</strong> <code>" + nF + "</code>";
    tmpl = tmpl + "<div>";
    return tmpl;
  }

  $.viz = _viz;

  return $;
})(Lumina || {});

