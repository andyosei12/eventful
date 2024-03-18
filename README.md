# Efiada: Your ultimate portal to events happening around you.

Efiada is a word in the Ghanaian tribe (Akans) meaning Friday and we know the fun mostly starts on Friday.
Efiada helps organizers of events create and manage events they are hosting and also gives users the convenience of purchasing tickets. Efiada seeks to expose people to unlimited fun.
These three activities are at the core of the operations of Efiada: **Create,Explore,Enjoy**

**Create an account or login and start managing your events. Visit [Curated](https://efiada.netlify.app/)**

## Setting up your local environment

1. Clone this repository
2. Run **npm install / npm i** to install all packages
3. Set up your environment variables. The content of required for the .env file can be seen in the .env.example file.
4. Add the database name as part of the database url
5. The application uses Mongodb as the database
6. Run npm start to start the local server
7. Run npm test to run test files

## API Documentation

The following are routes and requirements for different endpoints of our api

### Authentication

- _POST: /auth/signup_ => Endpoint for signing up a user. The first_name, last_name, email and password are required. The email is unique. The endpoint returns the created user

- _POST: /auth/signin_ => Endpoint for login. Requires email and password and returns a jwt token and user info

### Events

- _GET: /api/v1/blogs_ => Endpoint for fetching all blogs whether logged in or not logged in

- _GET: /api/v1/user/blogs_ => Endpoint for fetching all blogs of an authenticated user. It is required to pass in the jwt token in the authorization header to be able to get access to the blogs of a particaular user.

You can sort by the read_count,reading_time and created at. By default blogs are sorted by created_at.
Results are limited to 20 documents per page
You can also search by author,title and tags
You can query by the state of the blog when a user is logged in (either draft of published).

- _POST: /api/v1/blogs_ => Endpoint for creating a blog. Authorization header is also required to create task. The title, description,tags and body fields are required and these are the only fields needed to created a blog. The author of the blog is generated automatically.

- _GET: /api/v1/blogs/:blogId_ => Endpoint to get details of a blog.

- _PATCH: /api/v1/blogs/:blogId_ => For updating a blog. Authorization header is also required to update blog

- _PATCH: /api/v1/blogs/:blogId/status_ => For updating a blog status to published. Authorization header is also required to update blog status

- _DELETE: /api/v1/blogs/:blogId_ => For deleting blog. Authorization header is also required to delete a blog
