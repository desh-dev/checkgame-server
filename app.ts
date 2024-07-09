var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const credentials = require("./middleware/credentials");
import cors from "cors";
import { NextFunction, Response, Request } from "express";
import corsOptions from "./config/corsOptions";

var paymentRouter = require("./routes/payment");

var app = express();

// view engine setup
 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'jade');

app.use(logger("dev"));
//app.use(credentials);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));


app.use("/request-to-pay", paymentRouter);


// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = app.get("env") === "development" ? err : {}; // modified fromreq.app.get to app.get

  // render the error page
  res.status(err.message as any || 500); //modified from err.status to err.message
  res.render("error");
});

export default app;
