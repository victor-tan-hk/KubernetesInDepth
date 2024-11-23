const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/verify-token/:token', (req, res) => {

  console.log("verify-token API endpoint invoked");

  const token = req.params.token;
  console.log("Received token : ", token);

  // dummy verification
  // Always check for a fixed token
  // and return a fixed uid
  if (token === 'abc') {
    return res.status(200).json({ message: 'Valid token.', uid: 'u1' });
  }
  res.status(401).json({ message: 'Token invalid.' });
});

app.get('/token/:hashedPassword/:enteredPassword', (req, res) => {

  console.log("token check password API endpoint invoked");

  const hashedPassword = req.params.hashedPassword;
  const enteredPassword = req.params.enteredPassword;

  console.log ("Retrieved hashedPassword : ", hashedPassword);
  console.log ("Retrieved enteredPassword : ", enteredPassword);


  // dummy password verification!
  if (hashedPassword === enteredPassword + '_hash') {
    const token = 'abc';
    console.log("Password verified and returning token : ", token)
    return res.status(200).json({ message: 'Token created.', token: token });
  }
  res.status(401).json({ message: 'Passwords do not match.' });
});

app.get('/hashed-password/:password', (req, res) => {

  console.log("hashed-password API endpoint invoked");
  // dummy hashed pw generation!
  const enteredPassword = req.params.password;
  const hashedPassword = enteredPassword + '_hash';
  console.log("Returning hashedPassword with value of : ",hashedPassword);

  res.status(200).json({ hashedPassword: hashedPassword });
});

app.listen(80);
