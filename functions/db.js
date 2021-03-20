const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = admin.firestore();
const saccos = "saccos";

app.post("/new-sacco", async (req, res) => {
  let members = {};
  for (let i = 1; i <= parseInt(req.body.members_number); i++) {
    members[`member_${i}`] = {
      memberId: req.body[`member_number_${i}`],
      memberName: req.body[`member_name_${i}`],
      memberEmail: req.body[`member_email_${i}`],
      memberPhone: req.body[`member_phone_${i}`],
      confirmed: false,
    };
  }
  let newSacco = {
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
    const registeredSacco = await db.collection(saccos).add(newSacco);
    // res.redirect(`/`);
  } catch (error) {
    res.status(400).send("An Error: " + error);
  }
});
