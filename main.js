// Initial setup
var express = require("express");
var app = express();

var axios = require("axios");

var fetch = require("cross-fetch");

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const con = require("./db_connection");

app.disable("x-powered-by");

app.use(express.static(__dirname + "/views"));

const { on } = require("events");
const { type } = require("os");

var credentials = "8a489e226715eccf0f0c";
app.use(require("cookie-parser")(credentials));
app.use(cookieParser());

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var zoho_token;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: "application/*+json" }));

// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));

// parse an HTML body into a string
app.use(bodyParser.text({ type: "text/html" }));

app.set("view engine", "ejs"); // Used to support ejs files (The Embedded JavaScript (EJS) templating language)

// Render login page
app.get("/login", function (req, res) {
  res.render("login");
});

// Menu rendering
app.post("/menu", function (req, res) {
  // Render main menu of the website
  var str = '<div class="menustyle">';

  if (cookieParser.signedCookie(req.signedCookies.OSrole, credentials)) {
    str += '<button onclick="StartWorkingPage();">Start Working</button>';
    str += '<button onclick="SettingsPage();">Settings</button>';
    str += '<button onclick="ViewPendingRecordsPage();">View Pending Records</button>';
    str += '<button onclick="ViewKeywordsPage();">View Keywords</button>';
    str += '<button onclick="ViewDuplicatePage();">View Duplicate Business Names</button>';
    str += '<button onclick="ViewDuplicateWebsitesPage();">View Duplicate Websites</button>';
    str += '<button onclick="ProcessBingURL();">Check Bing</button>';
    str += '<button onclick="exit();">Log out</button>';
    str += "</div>";
  }

  res.send(str);
});

/* Pending records
Code below handles the "View Pending records" tab.
It handles following methods:
- Rendering of the page
- Displaying pending records from the database
- Removing selected record from the database
- Assembling of the table (from SQL to html table)
*/
app.get("/pendingrecords", function (req, res) {
  res.render("pendingrecords");
});

app.post("/show-pending-records", async function (req, res) {
  con.query("SELECT * from `table_cg_businesses_contacts`;", function (err, result) {
    if (err) throw err;
    res.send(assembleTable_PendingRecords(result));
  });
});

app.post("/del-pending-record", function (req, res) {
  con.query("DELETE FROM `table_cg_businesses_contacts` WHERE id = ?", req.body.id, function (err) {
    if (err) {
      throw err;
      res.send("Error");
    } else {
      res.send("Success");
    }
  });
});

function assembleTable_PendingRecords(rows) {
  var str = "";
  for (var i = 0; i < rows.length; ++i) {
    str =
      str +
      (`<tr>
                <td>` +
        rows[i].ID +
        `</td>
                <td>` +
        rows[i].column_contact_name +
        `</td>
                <td>` +
        rows[i].column_contact_phone +
        `</td>
                <td>` +
        rows[i].column_contact_address +
        `</td>
                <td>` +
        rows[i].column_contact_website +
        `</td>
                <td>
                    <input type="button" value="Delete" onclick="del(` +
        rows[i].ID +
        `)">
                </td>
            </tr>`);
  }
  return str;
}

/* Pending keywords
Code below handles the "View Keywords" tab.
It handles following methods:
- Rendering of the page
- Displaying records from the database
- Removing selected record from the database
- Assembling of the table (from SQL to html table)
"*/
app.get("/pendingkeywords", function (req, res) {
  res.render("pendingkeywords");
});

app.post("/show-keywords", function (req, res) {
  con.query("SELECT * from `table_cg_businesses_keywords`;", function (err, result) {
    if (err) throw err;
    res.send(assembleTable_PendingKeywords(result));
  });
});

app.post("/del-keyword", function (req, res) {
  con.query("DELETE FROM `table_cg_businesses_keywords` WHERE id = ?", req.body.id, function (err) {
    if (err) {
      throw err;
      res.send("Error");
    } else {
      res.send("Success");
    }
  });
});

function assembleTable_PendingKeywords(rows) {
  var str = "";
  for (var i = 0; i < rows.length; ++i) {
    str =
      str +
      (`<tr>
                <td>` +
        rows[i].ID +
        `</td>
                <td>` +
        rows[i].column_keywords +
        `</td>
                <td>
                    <input type="button" value="Delete" onclick="del(` +
        rows[i].ID +
        `)">
                </td>
            </tr>`);
  }
  return str;
}

/* Duplicate names
Code below handles the "View duplicate business names" tab.
It handles following methods:
- Rendering of the page
- Displaying records from the database
- Removing selected record from the database
- Assembling of the table (from SQL to html table)
"*/
app.get("/duplicatenames", function (req, res) {
  res.render("duplicatenames");
});

app.post("/show-duplicate-b-names", function (req, res) {
  con.query("SELECT * from `table_duplicate_names`;", function (err, result) {
    if (err) throw err;
    res.send(assembleTable_DuplicateNames(result));
  });
});

app.post("/del-b-name", function (req, res) {
  con.query("DELETE FROM `table_duplicate_names` WHERE id = ?", req.body.id, function (err) {
    if (err) {
      throw err;
      res.send("Error");
    } else {
      res.send("Success");
    }
  });
});

function assembleTable_DuplicateNames(rows) {
  var str = "";
  for (var i = 0; i < rows.length; ++i) {
    str =
      str +
      (`<tr>
                <td>` +
        rows[i].ID +
        `</td>
                <td>` +
        rows[i].column_duplicate_names +
        `</td>
                <td>
                    <input type="button" value="Delete" onclick="del(` +
        rows[i].ID +
        `)">
                </td>
            </tr>`);
  }
  return str;
}

/* Duplicate websites
Code below handles the "View duplicate websites" tab.
It handles following methods:
- Rendering of the page
- Displaying records from the database
- Removing selected record from the database
- Assembling of the table (from SQL to html table)
"*/
app.get("/duplicatewebsites", function (req, res) {
  res.render("duplicatewebsites");
});

app.post("/show-duplicate-websites", function (req, res) {
  con.query("SELECT * from `table_duplicate_websites`;", function (err, result) {
    if (err) throw err;
    res.send(assembleTable_DuplicateWebsites(result));
  });
});

app.post("/del-website", function (req, res) {
  con.query("DELETE FROM `table_duplicate_websites` WHERE id = ?", req.body.id, function (err) {
    if (err) {
      throw err;
      res.send("Error");
    } else {
      res.send("Success");
    }
  });
});

function assembleTable_DuplicateWebsites(rows) {
  var str = "";
  for (var i = 0; i < rows.length; ++i) {
    str =
      str +
      (`<tr>
                <td>` +
        rows[i].ID +
        `</td>
                <td>` +
        rows[i].column_duplicate_websites +
        `</td>
                <td>
                    <input type="button" value="Delete" onclick="del(` +
        rows[i].ID +
        `)">
                </td>
            </tr>`);
  }
  return str;
}

app.get("/dashboard", function (req, res) {
  res.render("dashboard");
});

app.post("/loadmetadata", function (req, res) {
  con.query("SELECT * from `table_cg_businesses_contacts`;", function (err, result) {
    if (err) throw err;

    var RandomRow = ReturnSingleRow(result);

    res.send(RandomRow);
  });
});

function ReturnSingleRow(rows) {
  var len = rows.length;

  // Generate random number and return row with ID
  var i = Math.floor(Math.random() * len);

  const SQLResult = {
    ID: rows[i].ID,
    Name: rows[i].column_contact_name,
    Phone: rows[i].column_contact_phone,
    Address: rows[i].column_contact_address,
    Website: rows[i].column_contact_website,
  };

  return SQLResult;
}

app.post("/ReturnTownFromString", async function (req, res) {
  const towns = [
    "bethel",
    "bridgeport",
    "cos cob",
    "danbury",
    "darien",
    "fairfield",
    "greenwich",
    "new canaan",
    "norwalk",
    "ridgefield",
    "stamford",
    "westport",
    "redding",
    "sandy hook",
    "rowayton",
    "southport",
    "black rock",
    "georgetown",
    "weston",
  ];
  let fulladdress = req.body.address.toLowerCase();

  let func_result;

  for (const ele of towns) {
    if (fulladdress.includes(ele + ", ct")) {
      func_result = ele;
    }
  }

  res.send(func_result);
});

app.get("/checkemail/:request", async (req, res) => {
  try {
    con.query('SELECT * FROM `table_duplicate_emails` WHERE column_email="' + req.params.request + '";', function (err, result) {
      if (result.length > 0) {
        res.json("exists");
      } else {
        res.json("new");
      }
    });
  } catch (err) {
    res.send(err);
  }
});

app.get("/checkfacebookkey/:request", async (req, res) => {
  try {
    con.query('SELECT * FROM `table_facebook_keys` WHERE column_keys="' + req.params.request + '";', function (err, result) {
      console.log(result);
      if (result.length > 0) {
        res.json("exists");
      } else {
        res.json("new");
      }
    });
  } catch (err) {
    res.send(err);
  }
});

app.get("/processbingurl", function (req, res) {
  res.render("processbingurl");
});

app.post("/processbinglinks/", urlencodedParser, async (req, res) => {
  try {
    await axios
      .get("https://www.bing.com/search?q=" + req.body.bodyData + "+CT" + "&en-US&setLang=EN", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
        },
      })
      .then((response) => {
        res.send([response.data.toString()]);
      });
  } catch (error) {
    console.log(error);
  }
});

app.post("/processweblinks/", urlencodedParser, async (req, res) => {
  try {
    await axios
      .get(req.body.bodyData, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
        },
      })
      .then((response) => {
        res.send([response.data.toString()]);
      });
  } catch (error) {
    res.send(error);
  }
});

app.post("/insertRecordToZoho/", urlencodedParser, async (req, res) => {
  const data = [
    {
      Account_Name: req.body.name,
      Account_Name_for_email: req.body.name,
      Dear: req.body.owner_first_name,
      Last_Name: req.body.owner_last_name,
      First_Name: req.body.owner_first_name,
      Phone: req.body.phone,
      WSBM_Town: [
        req.body.address
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
          .join(" "),
      ],
      Website_contact: req.body.website,
      Email: req.body.email,
      Secondary_Email: "",
      Facebook_URL: req.body.facebook,
      Instagram_URL: "",
      Twitter_URL: "",
      LinkedIn_full_url: "",
      Biz_who_tagged_them: "Hamlethub",
      Lead_Source: "api",
      trigger: "[approval, workflow, blueprint]",
    },
  ];

  con.query("insert into table_duplicate_emails(column_email) values(?)", [req.body.email], function (err, result) {});

  try {
    await postData("https://www.zohoapis.com/crm/v2/Contacts", { data }, zoho_token).then(async (data) => {
      if (data.code == "INVALID_TOKEN") {
        throw undefined;
      } else {
        res.json(data);
      }
    });
  } catch (error) {
    await createAccessToken().then((token_function) => {
      zoho_token = token_function.access_token;
    });
    await postData("https://www.zohoapis.com/crm/v2/Contacts", { data }, zoho_token).then(async (data) => {
      res.json(data);
    });
  }
});

app.get("/addemailtoduplicates/:request", async (req, res) => {
  // con.query("insert into table_duplicate_emails(column_email) values(?)", [req.params.request], function (err, result) {
  //   if (err) {
  //     res.json(err);
  //   } else {
  //     res.json("Success");
  //   }
  // });
});

app.get("/insertkeytoduplicatelist/:request", async (req, res) => {
  con.query("insert into table_facebook_keys(column_keys) values(?)", [req.params.request], function (err, result) {
    if (err) {
      res.json(err);
    } else {
      res.json("Success");
    }
  });
});

app.get("/", authenticationMiddleware());

function authenticationMiddleware() {
  return function (req, res) {
    if (cookieParser.signedCookie(req.signedCookies.OSrole, credentials)) {
      res.render("index");
    } else {
      res.redirect("/login");
    }
  };
}

// The post method to check login details
// TO-DO - encrypt username and password to store encrypted data into the database
app.post("/authorization", function (req, res) {
  con.query(
    'SELECT * FROM `table_online_login` WHERE Username="' + req.body.login + '" AND Password="' + req.body.pass + '";',
    function (err, result) {
      // if(err) throw err;
      if (result.length == 1) {
        res.cookie("OSrole", result[0].role, { signed: true });
        res.send("ok");
      } else {
        res.send("denied");
      }
    }
  );
});

// The post method to log out
app.post("/exit", function (req, res) {
  res.clearCookie("OSrole");
  res.send("ok");
});

app.listen(8080, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", 8080);
});

// POST method to send data to Zoho
async function postData(url = "", data = {}, token) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Zoho-oauthtoken " + token,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

const createAccessToken = async () => {
  const refresh_token = "1000.1a28c8ef2bedf00591841552771094c8.5d1c0ea7c3a2fadf710422e85dd0b9ab";
  const client_secret = "2fcbe7cc0a6442ed5e1999c6a4c3e1b8614a806ace";
  const client_id = "1000.61X4AUZSMP84SSNP2K6RJJDZVXAVHR";
  let tokenResponse = await fetch(
    `https://accounts.zoho.com/oauth/v2/token?grant_type=refresh_token&refresh_token=${refresh_token}&client_secret=${client_secret}&client_id=${client_id}`,
    {
      method: "POST",
    }
  );
  return Promise.resolve((accessToken = await tokenResponse.json()));
};
