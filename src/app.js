const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const moment = require('moment');
const twilio =require('twilio');
app.use(express.static('public'));

/////////////////////////////////////
const connection = require('./db/connection');
/////////////////////////////////////

require("./db/connection");

//const Register = require("./models/register");
//const Student = require("./models/register");
const { Student, FeeStructure } = require("./models/register");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);


app.use(bodyParser.urlencoded({ extended: true }));




app.get("/", (req, res) => {
  res.render("index");
 
});

app.get("/render", async (req, res) => {
  console.log('Accessed /render route');
  const Image = '/Brezza.jpg';
  const No='MH24AW7699';
  try {
      // Specify the new connection string dynamically
      await connection.connectToDatabase("mongodb+srv://AbrarShaikh:Andy%40998@cpp.csyvxe0.mongodb.net/GULSHAN_2024");

      // Access the current connection string
      console.log('Current connection string:', connection.getConnectionString());

      // Render your view or perform other actions
      res.render("admin",{Image,No});
  } catch (error) {
      console.error('Connection failed:', error);
      // Handle the error or render an error page
      res.status(500).send('Internal Server Error');
  }
});

app.get("/renderoff", async (req, res) => {
  console.log('Accessed /render route');
  const Image = '/venue.jpg';
  const No='MH24BR7699';
  try {
      // Specify the new connection string dynamically
      await connection.connectToDatabase("mongodb+srv://Junaid_Shaikh:Gulshan%40Junaid@cluster0.dgrgpxv.mongodb.net/GMDS");

      // Access the current connection string
      console.log('Current connection string:', connection.getConnectionString());

      // Render your view or perform other actions
      res.render("admin",{Image,No});
  } catch (error) {
      console.error('Connection failed:', error);
      // Handle the error or render an error page
      res.status(500).send('Internal Server Error');
  }
});
////////////////////////////////////////////
app.get("/admin",(req,res)=>{
  res.render("admin");
});

/*
app.get("/testing",(req,res)=>{
  try {
    // Query the database to get the total number of students
    const totalStudents = await Student.countDocuments();
    
    // Render the dashboard template with the totalStudents data
    res.render('dashboard', { totalStudents });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

});
*/

hbs.registerHelper('formatDate', function (date) {
  return moment(date).format('DD-MM-YYYY');
});

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


    res.render("register",{plus1});
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Server Error');
  }
  
});

app.get("/login", (req, res) => {
  res.render("login");
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
app.get("/test",(rqs , res )=> {
  res.render('test');
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/logout',(req,res)=>{
  res.render("index");
});
//////////////////////////////////////////
hbs.registerHelper('json', function(context) {
  return new hbs.SafeString(JSON.stringify(context));
});

app.get('/dashboard', async (req, res) => {
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

  console.log(`Total Number of Students: ${totalStudentCount}`);
 console.log("total pending fee:", TotalPendingFee);
    console.log('doughnutlabels:',doughnutLabels );
    console.log("doughnutValues: ", doughnutValues);
    console.log('barLabels:', barLabels);
console.log('barValues:', barValues);

if (result.length > 0) {
  const { grandTotal } = result[0];
    // Passing both datasets to the template
    res.render('dashboard',   {
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



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/register", async (req, res) => {
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/viewAll', async (req, res) => {
  try {
    const data = await Student.find(); // Fetch all data from MongoDB

    if (data.length > 0) {
      console.log(data); // Log the data retrieved from MongoDB
      res.render('allData', { data }); // Render the allData.hbs template with the retrieved data
    } else {
      console.log('No data found in the database');
      res.status(404).send('No data found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Server Error');
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// helpers/handlebars-helpers.js


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
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


///////////////////////////////////////////////////////////////////////////////////////////
app.get('/askMonth', (req, res) => {
  res.render('askMonth');
});

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




///////////////////////////////////////////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
