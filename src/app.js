require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const moment = require("moment");
const multer = require('multer');
const cookieParser = require("cookie-parser");
const session = require("express-session");
app.use(express.static("public"));

/////////////////////////////////////
const connection = require("./db/connection");
/////////////////////////////////////

require("./db/connection");

//const Register = require("./models/register");
//const Student = require("./models/register");
const { Student, User } = require("./models/register");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "thisisrandomstuff",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 100 * 60 * 1000, // 100 minutes
    },
  })
);

//middleware
var sessionChecker = (req, res, next) => {
  console.log("inside the middleware1");
  if (req.session.name || req.cookies.user_sid) {
    next();
  } else {
    res.redirect("/index");
  }
};

app.get("/", (req, res) => {
  res.redirect("/index");
});

app.get("/index", (req, res) => {
  res.render("index");
});

const authenticateAndLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Authenticate the user
    console.log(req.body);
    console.log(`Looking for user: ${username}`);
    const user = await User.findOne({ username });
    console.log("User found:", user);
    req.session.connstring = user.connstring;
    req.session.name = user.name;
    req.session.cname = user.cname;
    req.session.Photo = user.Photo;
    req.session.BusinessDetails = {
      BusinessName: user.BusinessName,
      BusinessAddress: user.BusinessAddress,
      MobileNo: user.mobno
  };
   
    if (!user) {
      console.log("User not found");
      throw new Error('User not found');
    }
    if (user.password !== password) {
      console.log("Invalid credentials");
      throw new Error('Invalid credentials');
    }
    res.redirect('/render');
  } catch (err) {
    // Authentication failed, render error message
    console.error("Error during authentication:", err);
    res.render('index', { error: err.message });
  }
};

// Route for handling login requests
app.post('/login', async (req, res) => {
  try {
      console.log("Accessing the login endpoint!!");
      await connection.connectToDatabase(process.env.STR);
      
      await authenticateAndLogin(req, res);
      console.log("Authentication successful!");
  } catch (error) {
      console.error("Error during login:", error);
      res.render('index', { error: error.message });
  }
});


app.get("/render", sessionChecker, async (req, res) => {
  console.log("Accessed /render route");
  const cname = req.session.cname;
  const name = req.session.name;
  const { Photo } = req.session;
  const base64Photo = Photo ? Buffer.from(Photo.data).toString('base64') : null;
  //const Photo =  req.session.Photo ? req.session.Photo.toString('base64') :  null;
     console.log(cname);
     console.log(name);
     console.log(Photo);
    

  try {
     const connstring = req.session.connstring;
     
    console.log("User connstring:", connstring);
    // Specify the new connection string dynamically
    await connection.connectToDatabase(connstring);

    // Access the current connection string
    console.log("Current connection string:", connection.getConnectionString());
    
    // Render your view or perform other actions
    res.render("admin", { name, cname, base64Photo });
  } catch (error) {
    console.error("Connection failed:", error);
    // Handle the error or render an error page
    res.status(500).send("Internal Server Error");
  }
});

////////////////////////////////////////////
app.get("/admin", (req, res) => {
  res.render("admin");
});

hbs.registerHelper("formatDate", function (date) {
  return moment(date).format("DD-MM-YYYY");
});

app.get("/register", async (req, res) => {
  try {
    const totalno = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const totalStudentCount = totalno.length > 0 ? totalno[0].totalCount : 0;
    const plus1 = totalStudentCount + 1;

    res.render("register", { plus1 });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).send("Server Error");
  }
});


app.get("/filter/askMonth", (req, res) => {
  res.render("askMonth");
});

app.get("/view", (req, res) => {
  res.render("view");
});
app.get("/update", (req, res) => {
  res.render("update");
});
app.get("/More", (req, res) => {
  res.render("More");
});
app.get("/AllData", (req, res) => {
  res.render("AllData");
});
app.get("/searchData", (req, res) => {
  res.render("searchData");
});
app.get("/delete", (rqs, res) => {
  res.render("delete");
});
app.get("/signup", (rqs, res) => {
  res.render("signup");
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/logout", (req, res) => {
  res.redirect("/index");
});
//////////////////////////////////////////
hbs.registerHelper("json", function (context) {
  return new hbs.SafeString(JSON.stringify(context));
});

app.get("/dashboard", async (req, res) => {
  try {
    const totalno = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Months are zero-based in JavaScript
    const currentYear = today.getFullYear();

    const monthlyStudentCount = await Student.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $month: "$SAddmissionDate" }, currentMonth] },
              { $eq: [{ $year: "$SAddmissionDate" }, currentYear] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
        },
      },
    ]);

    // Aggregation for doughnut chart based on LLRType
    const doughnutChartData = await Student.aggregate([
      {
        $group: {
          _id: "$Type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregation for bar chart based on monthly registrations
    const barChartData = await Student.aggregate([
      {
        $project: {
          month: { $month: "$SAddmissionDate" },
          year: { $year: "$SAddmissionDate" },
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sorting by year and month
    ]);

    const totalStudentCount = totalno.length > 0 ? totalno[0].totalCount : 0;
    const totalStudentsCurrentMonth = monthlyStudentCount.length > 0 ? monthlyStudentCount[0].totalCount : 0;
    const doughnutLabels = doughnutChartData.map((entry) => entry._id);
    const doughnutValues = doughnutChartData.map((entry) => entry.count);

    // Preparing data for bar chart
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const barLabels = barChartData
      .filter((item) => item._id.month !== null && item._id.year !== null)
      .map((item) => {
        const monthName = monthNames[item._id.month - 1]; // Adjust month index to 0-based
        return `${monthName} ${item._id.year}`;
      });

    const barValues = barChartData
      .filter((item) => item._id.month !== null && item._id.year !== null)
      .map((item) => item.count);

    console.log(`Total Number of Students: ${totalStudentCount}`);
    console.log(`Total Number of Students of current month: ${totalStudentsCurrentMonth}`);
    console.log("doughnutlabels:", doughnutLabels);
    console.log("doughnutValues: ", doughnutValues);
    console.log("barLabels:", barLabels);
    console.log("barValues:", barValues);

    // Passing both datasets to the template
    res.render("dashboard", {
      totalStudentCount,
      totalStudentsCurrentMonth,
      doughnutLabels,
      doughnutValues, // Data for doughnut chart
      barLabels,
      barValues, // Data for bar chart
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).send("Server Error");
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/register", upload.single('photo'), async (req, res) => {
  try {
    console.log("Received POST request to /register");
    console.log("Request Body:", req.body);

    // Validate request body parameters
    const {
      ID,
      Name,
      MobNo,
      SAddmissionDate,
      EAddmissionDate,
      Total,
      Deposite,
      Pending,
      gender,
      Type
    } = req.body;

    console.log("Extracted fields from request body:", {
      ID,
      Name,
      MobNo,
      SAddmissionDate,
      EAddmissionDate,
      Total,
      Deposite,
      Pending,
      gender,
      Type
    });

    // Convert ID to integer
    const sid = parseInt(ID);
    if (isNaN(sid)) {
      throw new Error("Invalid ID format");
    }
    console.log("Parsed ID:", sid);

    // Convert the uploaded photo to a buffer
    let photoBuffer = null;
    if (req.file) {
      photoBuffer = req.file.buffer;
      console.log("Photo uploaded, size:", photoBuffer.length);
    } else {
      console.log("No photo uploaded");
    }

    // Create a new Student document
    const studentData = new Student({
      ID: sid,
      Name,
      MobNo,
      SAddmissionDate,
      EAddmissionDate,
      Total,
      Deposite,
      Pending,
      Photo: photoBuffer,
      gender,
      Type
  });

    console.log("Created Student document:", studentData);
    const registeredStudent = await studentData.save();
    console.log("Student registered successfully:", registeredStudent);
    //res.render("render");
    //res.status(201).send("Student registered successfully");
  } catch (error) {
    console.error("Error during registration:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(400).send(`Bad Request: ${error.message}`);
  }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/viewAll", async (req, res) => {
  try {
    const data = await Student.find(); // Fetch all data from MongoDB

    if (data.length > 0) {
      console.log(data);
     
      res.render("AllData", { data }); // Render the allData.hbs template with the retrieved data
    } else {
      console.log("No data found in the database");
      res.status(404).send("No data found");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Server Error");
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/view", async (req, res) => {
  const { ID, MobNo } = req.body;

  try {
    let data;
    if (ID) {
      data = await Student.findOne({ ID });
    } else if (MobNo) {
      data = await Student.findOne({ MobNo });
    }

    if (data) {
      console.log(data);
      const businessDetails = req.session.BusinessDetails;
      // Convert photo buffer to base64-encoded string
      const photoBase64 = data.Photo ? data.Photo.toString('base64') : null;
      res.render("data", { data, photoBase64 , businessDetails: JSON.stringify(businessDetails) }); // Render the data.hbs template with the retrieved data
    } else {
      console.log(
        ID ? `No data found for ID: ${ID}` : `No data found for MobNo: ${MobNo}`
      );
      res.status(404).send("Data not found");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Server Error");
  }
});


app.post("/update", async (req, res) => {
  const { ID, MobNo } = req.body;

  try {
    let data;
    if (ID) {
      data = await Student.findOne({ ID });
    } else if (MobNo) {
      data = await Student.findOne({ MobNo });
    }

    if (data) {
      console.log(data); // Log the data retrieved from MongoDB
      res.render("newD", { data }); // Render the data.hbs template with the retrieved data
    } else {
      console.log(
        ID ? `No data found for ID: ${ID}` : `No data found for MobNo: ${MobNo}`
      );
      res.status(404).send("Data not found");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Server Error");
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// helpers/handlebars-helpers.js

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/submitform", async (req, res) => {
  try {
    const {
      ID,
      Name,
      MobNo,
      gender,
      SAddmissionDate,
      EAddmissionDate,
      Type,
      Total,
      Deposite,
      Pending,
      Photo
    } = req.body;

    // Convert date strings to ISO format
    const convertToISODate = (dateString) => {
      const [day, month, year] = dateString.split('-');
      return new Date(`${year}-${month}-${day}`);
    };

    const sAdmissionDateISO = convertToISODate(SAddmissionDate);
    const eAdmissionDateISO = convertToISODate(EAddmissionDate);

    console.log("Requested Data:", req.body);

    const result1 = await Student.findOneAndUpdate(
      { ID },
      {
        $set: {
          Name,
          MobNo,
          gender,
          SAddmissionDate: sAdmissionDateISO,
          EAddmissionDate: eAdmissionDateISO,
          Type,
          Total,
          Deposite,
          Pending,
          Photo
        },
      },
      { new: true }
    );

    if (result1) {
      console.log("Data in Student");
      console.log("Student Deposite", result1.Type);
      console.log("Student Pending", result1.Name);
      res.redirect("back");
    } else {
      res.status(404).send(`Student with ID ${ID} not found`);
    }
  } catch (error) {
    console.error("Error handling form submission:", error);
    res.status(500).send("Server Error");
  }
});




///////////////////////////////////////////////////////////////////////////////////////////

app.get("/searchData", async (req, res) => {
  try {
    console.log("Received GET request to /searchData");
    console.log("Request Query:", req.query);

    const month = req.query.searchMonth;
    console.log("Selected Month:", month);

    // Just send a response with the received month for now
    res.send(`Selected Month: ${month}`);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Internal Server Error");
  }
});
///////////////////////////////////////////////////////////////////////////////////////////

app.post("/deleteForm", async (req, res) => {
  try {
    const {
      ID,
      Name,
      MobNo,
      SAddmissionDate,
      EAddmissionDate,
      Total,
      Deposite,
      Pending,
      gender,
      Type
    } = req.body;

    console.log("Requested Data:", req.body);

    const result = await Student.deleteOne(
      { ID },
      {
        $set: {
      Name,
      MobNo,
      SAddmissionDate,
      EAddmissionDate,
      Total,
      Deposite,
      Pending,
      gender,
      Type
        },
      },
      { new: true } // Return the modified document
    );
    
    if (result) {
      res.redirect("back");
    } else {
      res.status(404).send(`Student with ID ${ID} not found`);
    }
  } catch (error) {
    console.error("Error handling form submission:", error);
    res.status(500).send("Server Error");
  }
});

///////////////////////////////////////////////////////////////////////////////////////////
app.get("/askMonth", (req, res) => {
  res.render("askMonth");
});

app.get("/displayData", async (req, res) => {
  try {
    const { month } = req.query;

    let students;
    let formattedMonth;

    if (month) {
      // If a specific month is provided, filter students by that month
      const startDate = moment(month, "YYYY-MM").startOf("month").toDate();
      const endDate = moment(month, "YYYY-MM").endOf("month").toDate();

      console.log("Start Date:", startDate);
      console.log("End Date:", endDate);

      students = await Student.find({
        SAddmissionDate: { $gte: startDate, $lte: endDate },
      });

      // Format the selectedMonth to display the month name
      formattedMonth = moment(month, "YYYY-MM").format("MMMM");
      console.log("Filtered Students:", students);
    } else {
      // If no specific month is provided, fetch all students
      students = await Student.find({});
    }

    console.log("Final Students Array:", students);

    res.render("displayData", { students, selectedMonth: formattedMonth }); // Pass formattedMonth to the template
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).send("Internal Server Error");
  }
});





//////////////////////////////////////////////////////////////////////////////////////////////
app.post("/signup", upload.single('photo'), async (req, res) => {
  try {
    await connection.connectToDatabase("mongodb+srv://AbrarShaikh:Andy%40998@cpp.csyvxe0.mongodb.net/");
    console.log("Received POST request to /signup");
    console.log("Request Body:", req.body);

    // Validate request body parameters
    const {
      name,
      mobno,
      username,
      password,
      cname,
      connstring,
      BusinessName,
      BusinessAddress
    } = req.body;

    console.log("Extracted fields from request body:", {
      name,
      mobno,
      username,
      password,
      cname,
      connstring,
      BusinessName,
      BusinessAddress,
      Photo: req.file ? req.file.buffer.length : null
    });

    // Convert the uploaded photo to a buffer
    let photoBuffer = null;
    if (req.file) {
      photoBuffer = req.file.buffer;
      console.log("Photo uploaded, size:", photoBuffer.length);
    } else {
      console.log("No photo uploaded");
    }

    // Create a new User document
    const userData = new User({
      name,
      mobno,
      username,
      password,
      cname,
      connstring,
      BusinessName,
      BusinessAddress,
      Photo: photoBuffer,
    });

    console.log("Created User document:", userData);
    const registeredUser = await userData.save();
    console.log("User registered successfully:", registeredUser);
    
    // Respond with success message
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error during registration:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(400).send(`Bad Request: ${error.message}`);
  }
});


///////////////////////////////////////////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
