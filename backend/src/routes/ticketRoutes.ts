import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketController from "../controllers/TicketController";

const ticketRoutes = express.Router();

ticketRoutes.get("/tickets", isAuth, TicketController.index);

//new route to get tickets for panel
ticketRoutes.get("/tickets/allOpen", isAuth, TicketController.allOpen);

//new route to get tickets with pagination
ticketRoutes.get("/tickets/custom", isAuth, TicketController.fullfilter);

//new route to get today metrics
ticketRoutes.get("/tickets/today", isAuth, TicketController.todayFilter);

//new route to get general metrics tickets
/* ticketRoutes.get("/tickets/general", isAuth, TicketController.generalFilter); */

ticketRoutes.get("/tickets/search", isAuth, TicketController.searchFilter);

ticketRoutes.get("/tickets/:ticketId", isAuth, TicketController.show);

ticketRoutes.post("/tickets", isAuth, TicketController.store);

ticketRoutes.put("/tickets/:ticketId", isAuth, TicketController.update);

ticketRoutes.delete("/tickets/:ticketId", isAuth, TicketController.remove);

export default ticketRoutes;
