const functions = require("firebase-functions");
const express = require("express");
const engines = require("consolidate");
const admin = require("firebase-admin");
const shortid = require("shortid");
const nodemailer = require("nodemailer");

const app = express();
app.engine("hbs", engines.handlebars);
app.set("views", "./views");
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("admin/index", { sacco: "sam" });
});
app.get("/loan-request", (req, res) => {
  res.render("loan-request", { sacco: "sam" });
});
app.get("/home", (req, res) => {
  res.render("home", { sacco: "sam" });
});
app.get("/profile", (req, res) => {
  res.render("profile", { sacco: "sam" });
});
app.get("/save", (req, res) => {
  res.render("save", { sacco: "sam" });
});

app.get("/new-sacco", (req, res) => {
  res.render("new-sacco", { sacco: "sam" });
});
app.get("/login", (req, res) => {
  res.render("login", { sacco: "sam" });
});
app.get("/register", (req, res) => {
  res.render("register", { sacco: "sam" });
});

//db stuff
admin.initializeApp(functions.config().firebase);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = admin.firestore();
const saccoCollection = db.collection("saccos");

//email transporter
var transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "mail.mysacco@gmail.com",
    pass: "martha256",
  },
});
//email transporter
app.post("/api/new-sacco", async (req, res) => {
  let members = {};
  for (let i = 1; i <= parseInt(req.body.members_number); i++) {
    members[`member_${i}`] = {
      memberId: req.body[`member_number_${i}`],
      memberName: req.body[`member_name_${i}`],
      memberEmail: req.body[`member_email_${i}`],
      memberPhone: req.body[`member_phone_${i}`],
      confirmed: false,
      password: null,
    };
  }
  let saccoId = "Sacco-" + shortid.generate();
  let newSacco = {
    saccoId,
    saccoName: req.body.sacco_name,
    numberOfMembers: parseInt(req.body.members_number),
    minSaving: parseInt(req.body.min_saving),
    meetingDay: req.body.meeting_day,
    meetingTime: {
      start: req.body.s_meeting_time,
      end: req.body.e_meeting_time,
    },
    period: req.body.s_period,
    saccoMembers: members,
  };
  try {
    const registeredSacco = await saccoCollection.doc(saccoId).set(newSacco);
    let mail = {
      from: '"MySacco Uganda" <mail.mysacco@gmail.com>',
      to: `${members[`member_1`].memberEmail}`,
      subject: `Sacco ID for ${req.body.sacco_name} `,
      text: `Hello ${
        members[`member_1`].memberName
      } , Your Sacco Id is ${saccoId}.
      Your members should be registered before your sacco is confirmed`,
    };
    transporter.sendMail(mail, (err) => {
      if (err) {
        throw err;
      }
    });
    res.render("registered-sacco");
  } catch (error) {
    res.status(400).send("An Error: " + error);
  }
});

//db stuff

//register
app.post("/api/register", async (req, res) => {
  try {
    let saccoReq = await saccoCollection.doc(req.body.sacco_id).get();
    if (!saccoReq.exists) {
      res.send("noSacco");
    } else {
      let saccoData = saccoReq.data();
      saccoData.saccoMembers[
        `member_${req.body.member_number}`
      ].confirmed = true;
      saccoData.saccoMembers[`member_${req.body.member_number}`].password =
        req.body.password;
      const registeredSacco = await saccoCollection
        .doc(req.body.sacco_id)
        .set(saccoData);
      res.send("No Error");
    }
  } catch (error) {
    res.send("Error");
  }
});
//register
exports.app = functions.https.onRequest(app);
