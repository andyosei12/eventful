# Efiada: Your ultimate portal to events happening around you.

Efiada is a word in the Ghanaian tribe (Akans) meaning Friday and we know the fun mostly starts on Friday.
Efiada helps organizers of events create and manage events they are hosting and also gives users the convenience of purchasing tickets. Efiada seeks to expose people to unlimited fun.
These three activities are at the core of the operations of Efiada: **Create,Explore,Enjoy**

**Create an account or login and start managing your events. Visit [Efiada](https://efiada.netlify.app/)**

## Setting up your local environment

1. Clone this repository
2. Run **npm install / npm i** to install all packages
3. Set up your environment variables. The content of required for the .env file can be seen in the .env.example file.
4. Add the database name as part of the database url
5. The application uses Mongodb as the database
6. Run npm start to start the local server
7. Run npm test to run test files

## API Documentation

visit [Efiada Api Documentation](https://efiada.stoplight.io/docs/efiada/branches/main/48rhw5anw38he-eventful) for details of the api.

The following are routes and requirements for different endpoints of our api as well.

### Authentication

- _POST: /api/v1/auth/signup_ => Endpoint for signing up a user. The first_name, last_name, email and password are required. The email is unique. The endpoint returns the created user

- _POST: /api/v1/auth/signin_ => Endpoint for login. Requires email and password and returns a jwt token and user info

### Events

- _GET: /api/v1/events_ => Endpoint for fetching all events.

- _GET: /api/v1/events/auth/create_ => Endpoint for fetching all blogs of an authenticated organizer. It is required to pass in the jwt token in the authorization header to be able to get access to the events of a particaular organizer.

Results are limited to 20 documents per page

- _POST: /api/v1/events_ => Endpoint for creating an event. Authorization header is also required to create event. The title, description,price,days_before,location,time and date fields are required and these are the only fields needed to created an event.

- _GET: /api/v1/events/:eventId_ => Endpoint to get details of an event.

- _PATCH: /api/v1/events/:eventId_ => For updating a blog. Authorization header is also required to update event

- _DELETE: /api/v1/events/:eventId_ => For deleting event. Authorization header is also required to delete an event

### Ticketing

- _POST: /api/v1/tickets_ => Endpoint for creating a ticket. Authorization header is also required to create ticket. Pass the event_id in the body to create a ticket. A QR code uri is returned.
- _GET: /api/v1/tickets/completed_ => Endpoint for getting all attended event tickets. Authorization header is also required.
- _GET: /api/v1/tickets/auth/user_ => Endpoint for getting all event tickets of a user. Authorization header is also required.
- _PATCH: /api/v1/tickets/{id}_ => Endpoint for updating a ticket. Authorization header is also required to update a ticket.
- _DELETE: /api/v1/tickets/{id}_ => Endpoint for deleting a ticket. Authorization header is also required to delete a ticket.

### Analytics

- _GET: /api/v1/analytics/events/total_ => Endpoint for getting the count of all events of an organizer. Authorization header is also required.
- _GET: /api/v1/analytics/tickets-sold_ => Endpoint for getting the count of tickets sold for an organizer. Authorization header is also required.
- _GET: /api/v1/analytics/tickets/completed_ => Endpoint for getting the count of all attendees for all events of an organizer. Authorization header is also required.
- _GET: /api/v1/analytics/{eventId}/tickets-sold_ => Endpoint for getting the count of tickets sold for an event. Authorization header is also required.
- _GET: /api/v1/analytics/{eventId}/tickets/completed_ => Endpoint for getting the count of all attendees for an event. Authorization header is also required.
- _GET: /api/v1/analytics/revenue_ => Endpoint for getting the total revenue for an organizer. Authorization header is also required.
- _GET: /api/v1/analytics/{eventId}/revenue_ => Endpoint for getting the total revenue for an event. Authorization header is also required.

### QR Code Generation

- _GET: /api/v1/analytics/qr-code/{ticketId}_ => Endpoint for getting the qr-code of a ticket. Authorization header is also required.
