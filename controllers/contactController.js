const Contact = require("../models/contact");
const debug = require("debug")("contact");

async function getAllContactsLinkedByPrimaryContactId(contactId) {
  //get primary contact
  let primaryContact = await Contact.findOne({ where: { id: contactId } });
  //get secondary contacts
  let secondaryContacts = await Contact.findAll({
    where: { linkedId: contactId },
  });
  //prepare response in expected format
  let resp = {
    primaryContatctId: primaryContact.id,
    emails: [],
    phoneNumbers: [],
    secondaryContactIds: [],
  };
  resp.secondaryContactIds = secondaryContacts.map((sC) => sC.id);
  let allContacts = [primaryContact, ...secondaryContacts];
  allContacts.forEach((con) => {
    if (con?.email) {
      resp.emails.push(con.email);
    }
    if (con?.phoneNumber) {
      resp.phoneNumbers.push(con.phoneNumber);
    }
  });
  resp.emails = [...new Set(resp.emails)];
  resp.phoneNumbers = [...new Set(resp.phoneNumbers)];
  return resp;
}

const processContacts = async (req, res) => {
  try {
    let { email, phoneNumber } = req.body;

    //throw error when both email and phone number are not present
    if (!email && !phoneNumber) {
      throw Error("Either one of email or phone number should be present");
    }

    let contactByEmail,
      contactByPhoneNumber,
      firstPrimaryContactId,
      secondPrimaryContactId;

    //Contacts with same email are linked to same primary Contact. Find one such Contact if email is not null
    if (email) {
      contactByEmail = await Contact.findOne({ where: { email } });
    }

    //Contacts with same phone number are linked to same primary Contact. Find one such Contact if phone number is not null
    if (phoneNumber) {
      contactByPhoneNumber = await Contact.findOne({
        where: { phoneNumber },
      });
    }

    let createResp;

    let contact = {
      email,
      phoneNumber,
    };

    //if both emails and contact are not already present in db
    if (!contactByEmail && !contactByPhoneNumber) {
      //create contact with linkPrecedence as primary(set by default in model layer)
      createResp = await Contact.create(contact);

      firstPrimaryContactId = createResp.id;

      debug(`contact created primary ${JSON.stringify(createResp)}`);
    }
    //if only email is present in db
    else if (contactByEmail && !contactByPhoneNumber) {
      //the fetched contact with same email might be a primary or secondary
      firstPrimaryContactId =
        contactByEmail.linkPrecedence === "primary"
          ? contactByEmail.id
          : contactByEmail.linkedId;

      //create contact only if phoneNumber is present in api body
      if (phoneNumber) {
        contact.linkPrecedence = "secondary";
        contact.linkedId = firstPrimaryContactId;

        //create contact with linkPrecedence as secondary and primary contactId as linkedId
        createResp = await Contact.create(contact);

        debug(`contact created secondary ${JSON.stringify(createResp)}`);
      }
    }
    //if only phone number is present in db
    else if (!contactByEmail && contactByPhoneNumber) {
      //the fetched contact with same phone number might be a primary or secondary
      firstPrimaryContactId =
        contactByPhoneNumber.linkPrecedence === "primary"
          ? contactByPhoneNumber.id
          : contactByPhoneNumber.linkedId;

      //create contact only if email is present in api body
      if (email) {
        contact.linkPrecedence = "secondary";
        contact.linkedId = firstPrimaryContactId;

        //create contact with linkPrecedence as secondary and primary contactId as linkedId
        createResp = await Contact.create(contact);

        debug(`contact created secondary ${JSON.stringify(createResp)}`);
      }
    }
    //if both email and phone number are present in db
    else {
      let emailPrimaryContact,
        pNPrimaryContact,
        emailPrimaryContactId,
        pNPrimaryContactId;

      //get primary contacts if the fetched contacts are not primary
      if (contactByEmail.linkPrecedence === "primary") {
        emailPrimaryContactId = contactByEmail.id;
        emailPrimaryContact = contactByEmail;
      } else {
        emailPrimaryContactId = contactByEmail.linkedId;
        emailPrimaryContact = await Contact.findOne({
          where: { id: emailPrimaryContactId },
        });
      }

      if (contactByPhoneNumber.linkPrecedence === "primary") {
        pNPrimaryContactId = contactByPhoneNumber.id;
        pNPrimaryContact = contactByPhoneNumber;
      } else {
        pNPrimaryContactId = contactByPhoneNumber.linkedId;
        pNPrimaryContact = await Contact.findOne({
          where: { id: pNPrimaryContactId },
        });
      }

      //if both contacts are not linked to the same primary contact
      if (emailPrimaryContactId !== pNPrimaryContactId) {
        //set the first created primary contact in firstPrimaryContactId and the other in secondPrimaryContactId
        if (
          emailPrimaryContact.createdAt.getTime() <
          pNPrimaryContact.createdAt.getTime()
        ) {
          firstPrimaryContactId = emailPrimaryContactId;
          secondPrimaryContactId = pNPrimaryContactId;
        } else {
          firstPrimaryContactId = pNPrimaryContactId;
          secondPrimaryContactId = emailPrimaryContactId;
        }

        //change the second primary contact to secondary contact with linkedId with first primary contact id
        let contactsUpdated = await Contact.update(
          { linkedId: firstPrimaryContactId, linkPrecedence: "secondary" },
          { where: { id: secondPrimaryContactId } }
        );
        debug(
          `contact changed from primary to secondary ${JSON.stringify(
            contactsUpdated
          )}`
        );

        //change the linkedId of all contacts linked to second primary contact to first primary contact id so that all secondary contacts are always directly linked to primary contact
        contactsUpdated = await Contact.update(
          { linkedId: firstPrimaryContactId },
          { where: { linkedId: secondPrimaryContactId } }
        );
        debug(`primary contactId changed ${JSON.stringify(contactsUpdated)}`);
      } else {
        firstPrimaryContactId = emailPrimaryContactId;
      }
    }

    let response = {};

    //fetch all the emails and phone numbers linked
    response.contact = await getAllContactsLinkedByPrimaryContactId(
      firstPrimaryContactId
    );

    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  processContacts,
};
