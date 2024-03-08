const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connection = require('./db/connection');
const path = require("path");
const app = express();
const hbs = require("hbs");
const moment = require('moment');
app.use(express.static('public'));
const port = process.env.PORT || 4000;

const { Student, FeeStructure, userModel } = require('./models/user');

// Setup Express Handlebars
const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerHelper('formatDate', function (date) {
  return moment(date).format('DD-MM-YYYY');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'thisisrandomstuff',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 100 * 60 * 1000 // 100 minutes
    }
}));


// Session checker middleware
var sessionChecker = (req, res, next) => {
  console.log("inside the middleware");
  if (req.session.user || req.cookies.user_sid) {
      res.render('index');
  } else {
      next();
  }
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Routes
app.get('/',  (req, res) => {
    res.redirect('/login');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/askMonth', (req, res) => {
  res.render('askMonth');
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
app.get("/More",(req,res)=>{
  res.render("More")
});
app.get("/AllData", (req, res) => {
  res.render("AllData");
});
app.get('/searchData', (req, res) => {
  res.render('searchData');
});
app.get("/delete",(rqs , res )=> {
  res.render('delete');
});
//
app.get('/index',  (req, res) => {
  console.log('inside the index get request');
  if (req.session.user || req.cookies.user_sid) {
      res.render('index', { user: req.session.user });
      console.log('index page rendered');
  } else {
      res.redirect('/login');
  }
});

const storage = multer.memoryStorage(); // Stores files in memory
const upload = multer({ storage: storage });

app.get('/signup', sessionChecker, (req, res) => {
    res.render('signup');
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for signup route
app.post('/signup', upload.single('Image'), async (req, res) => {
    try {
      // req.file contains the image. Convert image to a format that can be saved in MongoDB
    const img = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password, // Ensure you hash this before saving
      Conn1: req.body.Conn1,
      Conn2: req.body.Conn2,
      Conn3: req.body.Conn3,
      Conn4: req.body.Conn4,
      NO: req.body.NO,
      Image: img, // This matches the corrected schema
    });
    

        const savedUser = await newUser.save();
        console.log(savedUser);
        console.log('no is ',no);
        console.log('Image is ',img);
        req.session.user = savedUser;
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.redirect('/signup');
    }
});

app.get('/Admin', async (req, res) => {
  if (req.session.user || req.cookies.user_sid) {
      // Retrieve No and Image from the session
      const No = app.locals.No
      const Image = app.locals.Image;
      console.log('no is :',No);
      // Pass No and Image along with the user to the view
      res.render('Admin', { No, Image});
      // Clear them from the session if you don't need them afterwards
     
  } else {
      res.redirect('/login');
  }
});

mongoose.connect('mongodb+srv://Gcreatix:AR%237587@users.dxsrar7.mongodb.net/USERS')
  .then(() => {
    console.log('Connected to MongoDB');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for login routes
    app.route("/login")
    .get(sessionChecker, (req, res) => {
      res.sendFile(__dirname + "/templates/views/login.hbs");
    })
    .post(async (req, res) => {
      var username = req.body.username;
      var password = req.body.password;
  
      try {
        var user = await userModel.findOne({ username: username });
        if (!user || !(await user.comparePassword(password))) {
          return res.redirect("/login");
        }
  
        // Set user information in the session
        req.session.user = user;
  
        console.log('User Session:', req.session.user);
         app.locals.con1 = user.Conn1;
         app.locals.con2 = user.Conn2;
         app.locals.con3 = user.Conn3;
         app.locals.con4 = user.Conn4;
         app.locals.Image = user.Image;
         app.locals.No =user.No;
        console.log("retrieved Connection string 1:", app.locals.con1);
        console.log("retrieved Connection string 2:", app.locals.con3);
        console.log("retrieved Connection string 3:", app.locals.con3);
        console.log("retrieved Connection string 4:", app.locals.con4);
        console.log("retrieved Image:", app.locals.Image);
        console.log("retrieved Number:", app.locals.No);
        mongoose.connection.close();
        console.log('Default connection clsoed');
        console.log("Redirecting to the index");
        res.redirect('/index');
      } catch (err) {
        console.error(err);
        res.redirect("/login");
      }
    });
  

  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//index page routes  
  app.get("/render", async (req, res) => {
    console.log('Accessed /render route');
   
    try {
        console.log('inside the try block of the /render route');
        const con1 = app.locals.con1
        await connection.connectToDatabase(con1);
  
        // Access the current connection string
        console.log('Current connection string:', connection.getConnectionString());
  
        // Render your view or perform other actions
        res.redirect("/Admin");
    } catch (error) {
        console.error('Connection failed:', error);
        // Handle the error or render an error page
        res.status(500).send('Internal Server Error');
    }
  });
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  app.get("/renderoff", async (req, res) => {
    console.log('Accessed /render route');
    const Image = '/venue.jpg';
    const No='MH24BR7699';
    try {
        // Specify the new connection string dynamically
        await connection.connectToDatabase(con2);
  
        // Access the current connection string
        console.log('Current connection string:', connection.getConnectionString());
  
        // Render your view or perform other actions
        res.redirect("/Admin");
    } catch (error) {
        console.error('Connection failed:', error);
        // Handle the error or render an error page
        res.status(500).send('Internal Server Error');
    }
  });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//dashboard page route
hbs.registerHelper('json', function (context) {
  return JSON.stringify(context);
});
app.get('/Dashboard', async (req, res) => {
  try {

    const totalno =await Student.aggregate([
      {
        $group: {
          _id: null,       
          totalCount: { $sum: 1 }  
        }
      }
    ]);

    const today = new Date();
const currentMonth = today.getMonth() + 1; // Months are zero-based in JavaScript
const currentYear = today.getFullYear();

const monthlyStudentCount = await Student.aggregate([
  {
    $match: {
      $expr: {
        $and: [
          { $eq: [{ $month: "$AddmissionDate" }, currentMonth] },
          { $eq: [{ $year: "$AddmissionDate" }, currentYear] },
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
const totalPending = await FeeStructure.aggregate([
  {
    $group: {
      _id: null,
      totalPending: { $sum: "$Pending" }
    }
  }
]);

const result = await FeeStructure.aggregate([
  
  {
    $group: {
      _id: null, // Group all documents together
      totalDLFee: { $sum: "$DLFee" },
      totalLLFee: { $sum: "$LLFee" },
      totalGForm: { $sum: "$GForm" }
    }
  },
  {
    $project: {
      _id: 0,
      grandTotal: { $add: ["$totalDLFee", "$totalLLFee", "$totalGForm"] }
    }

  }
]);
    // Aggregation for doughnut chart based on LLRType
    const doughnutChartData = await Student.aggregate([
      {
        $group: {
          _id: '$LLRType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Aggregation for bar chart based on monthly registrations
    const barChartData = await Student.aggregate([
      {
        $project: {
          month: { $month: "$AddmissionDate" },
          year: { $year: "$AddmissionDate" }
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } } // Sorting by year and month
    ]);

    const totalStudentCount = totalno[0].totalCount;
    const totalStudentsCurrentMonth = monthlyStudentCount.length > 0 ? monthlyStudentCount[0].totalCount : 0;
    const TotalPendingFee = totalPending.length > 0 ? totalPending[0].totalPending : 0;
    const doughnutLabels = doughnutChartData.map(entry => entry._id);
    const doughnutValues = doughnutChartData.map(entry => entry.count);

    // Preparing data for bar chart
    const barLabels = barChartData
  .filter(item => item._id.month !== null && item._id.year !== null)
  .map(item => `${item._id.month}-${item._id.year}`);
const barValues = barChartData
  .filter(item => item._id.month !== null && item._id.year !== null)
  .map(item => item.count);

  console.log('Total Number of Students:' ,totalStudentCount);
  console.log('Total Number of Students of current Month:' ,totalStudentsCurrentMonth);
 console.log("total pending fee:", TotalPendingFee);
    console.log('doughnutlabels:',doughnutLabels );
    console.log("doughnutValues: ", doughnutValues);
    console.log('barLabels:', barLabels);
console.log('barValues:', barValues);

if (result.length > 0) {
  const { grandTotal } = result[0];
   console.log('passed the condition');
       res.render('Dashboard',{
      totalStudentCount ,
      totalStudentsCurrentMonth,
      TotalPendingFee,
      grandTotal,
      doughnutLabels,
      doughnutValues, // Data for doughnut chart
      barLabels,
      barValues // Data for bar chart
    });
  }
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Server Error');
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//for register route
app.get("/register", async (req, res) => {
  try{

    const totalno =await Student.aggregate([
      {
        $group: {
          _id: null,       
          totalCount: { $sum: 1 }  
        }
      }
    ]);

    const totalStudentCount = totalno[0].totalCount;
    const plus1=totalStudentCount+1;

    console.log('plus1 value:', plus1);
    res.render("register",{ plus1 });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Server Error');
  }
  
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/registernewdata", async (req, res) => {
  try {

    console.log("Received POST request to /register");
    console.log("Request Body:", req.body);

    // Validate request body parameters
    const { ID, Name, MobNo, LicenceNo, LLRType, Type, AddmissionDate, Total, Deposite, Pending, MDLStatus } = req.body;

    // Convert ID to integer
    const sid = parseInt(ID);

    // Create a new Student document
    const studentData = new Student({
        ID: sid,
        Name,
        MobNo,
        LicenceNo,
        LLRType,
        Type,
        AddmissionDate,
        Total,
        Deposite,
        Pending,
        MDLStatus,
    });

    // Save the student document to the database
    const registeredStudent = await studentData.save();

    // Create a new FeeStructure document
    const feeStructureData = new FeeStructure({
        ID: sid,
        Name,
        MobNo,
        LLRType,
        AddmissionDate,
        Total,
        Deposite,
        Pending,
    });

    calculateFees(LLRType, feeStructureData);

    // Save the feeStructure document to the database
    const feeRegistered = await feeStructureData.save();
    
    console.log('Fee structure data entered successfully:', feeRegistered);
    console.log('Student registered successfully:', registeredStudent);
    
  
   
    

    /*
    // Send SMS to the registered user
    const message = `Subject: Registration Confirmation - Your ID: ${ID}.
    Dear ${Name}.,
    Your registration with GMDS is confirmed. Your assigned ID is: ${ID}.
    Keep this ID for future reference.
    Thank you,
    GMDS OFFICIAL`;

    const formatMobNo =  MobNo;

    // Send SMS and log the response
    twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: MobNo,
    })
    .then((message) => {
      console.log('SMS sent successfully:', message.sid);
      // Redirect back after successful registration and SMS
      res.redirect("back");
    })
    .catch((error) => {
      console.error('Error sending SMS:', error);
      res.status(500).send('Error sending SMS');
    });*/
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(400).send(`Bad Request: ${error.message}`);
  }
});


function calculateFees(LLRType, feeStructureData) {
  switch (LLRType) {
      case "MCWG / LMV":
      case "MCWG / LMV-TR":
          feeStructureData.LLFee = 350;
          feeStructureData.DLFee = 1100;
          feeStructureData.GForm = 500;
          break;
      case "LMV":
          feeStructureData.LLFee = 150;
          feeStructureData.DLFee = 1100;
          feeStructureData.GForm = 350;
          break;
      case "LMV-TR":
          feeStructureData.LLFee = 150;
          feeStructureData.DLFee = 1100;
          feeStructureData.GForm = 400;
          break;
       case "ONLY-TRAINING":
            feeStructureData.LLFee = 0;
            feeStructureData.DLFee = 0;
            feeStructureData.GForm = 0;
            break;
      // Add more cases for other LLRTypes if needed
      default:
          break;
  }
  feeStructureData.Balance = feeStructureData.Total - feeStructureData.Pending - feeStructureData.DLFee - feeStructureData.LLFee - feeStructureData.GForm;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for viewall Route
app.get('/viewAll', async (req, res) => {
  try {
    const data = await Student.find(); // Fetch all data from MongoDB

    if (data.length > 0) {
      console.log(data); // Log the data retrieved from MongoDB
      res.render('AllData', { data }); // Render the allData.hbs template with the retrieved data
    } else {
      console.log('No data found in the database');
      res.status(404).send('No data found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Server Error');
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for view route
app.post('/view', async (req, res) => {
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
      res.render('data', { data }); // Render the data.hbs template with the retrieved data
    } else {
      console.log(ID ? `No data found for ID: ${ID}` : `No data found for MobNo: ${MobNo}`);
      res.status(404).send('Data not found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Server Error');
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//for update route
app.post('/update', async (req, res) => {
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
      res.render('newD', { data }); // Render the data.hbs template with the retrieved data
    } else {
      console.log(ID ? `No data found for ID: ${ID}` : `No data found for MobNo: ${MobNo}`);
      res.status(404).send('Data not found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Server Error');
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for submiting the form after being updated route
app.post("/submitform", async (req, res) => {
  try {
    const { ID, Name, MobNo, LicenceNo, LLRType, Type, AddmissionDate, Total, Deposite, Pending, MDLStatus } = req.body;

    console.log('Requested Data:', req.body);

    const result1 = await Student.findOneAndUpdate(
      { ID },
      {
        $set: {
          Name,
          MobNo,
          LicenceNo,
          LLRType,
          Type,
          AddmissionDate,
          Total,
          Deposite,
          Pending,
          MDLStatus,
        },
      },
      { new: true }
    );

    const result2 = await FeeStructure.findOneAndUpdate(
      { ID },
      {
        $set: {
          ID,
          Name,
          MobNo,	
          LLRType,	
          AddmissionDate,	
          Total,	
          Deposite,
          Pending,
        },
      },
      { new: true }
    );

    if (result1 && result2) {
      // Calculate new balance using the updated values
      const updatedBalance = calculatebalance(result2);

      // Update the FeeStructure document with the new balance
      const updatedResult2 = await FeeStructure.findOneAndUpdate(
        { ID },
        { $set: { Balance: updatedBalance } },
        { new: true }
      );

      console.log('Data in Student');
      console.log('Student Deposite', result1.Deposite);
      console.log('Student Pending', result1.Pending);
      console.log('Data in FeeStructure');
      console.log('FeeStructure Deposite', updatedResult2.Deposite);
      console.log('FeeStructure Pending', updatedResult2.Pending);
      console.log('FeeStructure DLFee', updatedResult2.DLFee);
      console.log('FeeStructure LLFee', updatedResult2.LLFee);
      console.log('FeeStructure GForm', updatedResult2.GForm);
      console.log('FeeStructure Balance', updatedResult2.Balance);

      res.redirect("back");
    } else {
      res.status(404).send(`Student with ID ${ID} not found`);
    }
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).send('Server Error');
  }
});

function calculatebalance(feeData) {
  return feeData.Total - feeData.Pending - feeData.DLFee - feeData.LLFee - feeData.GForm;
} 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for search Data
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for deleting the Data
app.post("/deleteForm", async (req, res) => {
  try {
    
    const { ID, Name, MobNo, LicenceNo, LLRType, Type, AddmissionDate, Total, Deposite, Pending, MDLStatus } = req.body;

    console.log('Requested Data:', req.body);

    const result = await Student.deleteOne(
      { ID },
      {
        $set: {
          Name,
          MobNo,
          LicenceNo,
          LLRType,
          Type,
          AddmissionDate,
          Total,
          Deposite,
          Pending,
          MDLStatus,
        },
      },
      { new: true } // Return the modified document
  );
  const result2 = await FeeStructure.deleteOne(
    { ID },
    {
      $set: {
        ID,
        Name,
        MobNo,	
        LLRType,	
        AddmissionDate,	
        Total,	
        Deposite,
        Pending,
      },
    },
    { new: true } // Return the modified document
  );

    if (result && result2) {
       res.redirect("back");
    } else {
      res.status(404).send(`Student with ID ${ID} not found`);
    }
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).send('Server Error');
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for displaying the data
app.get('/displayData', async (req, res) => {
  try {
    const { month } = req.query;

    let students;
    let formattedMonth;

    if (month) {
        // If a specific month is provided, filter students by that month
        const startDate = moment(month, 'YYYY-MM').startOf('month').toDate();
        const endDate = moment(month, 'YYYY-MM').endOf('month').toDate();

        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);

        students = await Student.find({
            AddmissionDate: { $gte: startDate, $lte: endDate }
        });

        // Format the selectedMonth to display the month name
        formattedMonth = moment(month, 'YYYY-MM').format('MMMM');
        console.log('Filtered Students:', students);
    } else {
        // If no specific month is provided, fetch all students
        students = await Student.find({});
    }

    console.log('Final Students Array:', students);

    res.render('displayData', { students, selectedMonth: formattedMonth }); // Pass formattedMonth to the template
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Internal Server Error');
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//for diplaying the feedata
app.get('/displayFeeData', async (req, res) => {
  try {
    const { month } = req.query;

    let FeeData;
    let formattedMonth;

    if (month) {
        // If a specific month is provided, filter FeeData by that month
        const startDate = moment(month, 'YYYY-MM').startOf('month').toDate();
        const endDate = moment(month, 'YYYY-MM').endOf('month').toDate();

        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);

        FeeData = await FeeStructure.find({
            AddmissionDate: { $gte: startDate, $lte: endDate }
        });

        // Format the selectedMonth to display the month name
        formattedMonth = moment(month, 'YYYY-MM').format('MMMM');
        console.log('Filtered FeeData:', FeeData);
    } else {
        // If no specific month is provided, fetch all FeeData
        FeeData = await Student.find({});
    }

    console.log('Final FeeData Array:', FeeData);

    res.render('displayData', { FeeData, selectedMonth: formattedMonth }); // Pass formattedMonth to the template
  } catch (error) {
    console.error('Error fetching FeeData:', error);
    res.status(500).send('Internal Server Error');
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for logout route
app.get('/logout', (req, res) => {
        // Ensure the mongoose connection is closed before opening a new one
        mongoose.connection.close();
            console.log("User-specific connection closed");
            // Connect to the default or new MongoDB here
            const defaultConnectionString = 'mongodb+srv://Gcreatix:AR%237587@users.dxsrar7.mongodb.net/USERS';
            mongoose.connect(defaultConnectionString, {})
            .then(() => {
                console.log('Connected to default MongoDB');
                res.redirect('/index');
            })
            .catch(err => {
                console.error('Error connecting to default MongoDB:', err);
                // Handle the connection error (e.g., redirect to an error page or login with an error message)
                res.redirect('/login'); // Modify as needed
            });
        
    });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log('Server is running on port 4000');
});
