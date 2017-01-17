# Sentence Server API

v0.01b

## User Endpoints ##
---

### Login

> `HEAD /login/:uid`

  **Request**
  // todo
  **Response**

  **Requirements**

  What's used by people to recieve their initial token of authentication.

### Create User

> `POST /user/new`

  **Request**
  ```
  xContent-Type: 'application/json'
  {
    username: 'cavejay',
    pw: 'ThisIsPassword12,
    email: 'HI@hi.com',
    name: 'Michael X'
  }
  ```

  **Response**
  ```
  Accepted: 201
    {uid: '12312sada-1231asd-1123asd-123141'}

  Denied: 422
    {code: 'UnprocessableEntityError', message: 'Username already exists'}

  Denied: 422
    {code: 'UnprocessableEntityError', message: 'Username is invalid '}

  Denied: 422
    {code: 'UnprocessableEntityError', message: 'Password doesn't meet requirements'}

  Denied: 422
    {code: 'UnprocessableEntityError', message: 'Email is invalid'}
  ```
  
  **Requirements**
  - Usernames must be made of alphanumeric characters and any of the following: `-`, `_`.
  - Passwords must be at least 8 alphanumeric characters long and contain atleast 1 normal letter, 1 capital and 1 numerical character
  - Username must be unique
  - Emails must be alphanumeric, have a single `@` sign followed by something and then a `.`

  Used to create a new user and receive your uid to actually start making calls.
  Use `/user/check` before running this to ensure the username is available.

### Update User

> `PUT /user/:uid`

  **Request**
  ```
  xContent-Type: 'application/json'
  {
    pw | email | name: 'insert updated info here'
  }
  ```

  **Response**
  ```
  Accepted: 204
    {
      // The User's details
    }

  Denied: 403
    {code: 'ForbiddenError', message: 'Can't update username'}

  Denied: 422
    {code: 'UnprocessableEntityError', message: 'Username does not exist'}

  Denied: 422
    {code: 'UnprocessableEntityError', message: 'Email is invalid'}

  Denied: 422
    {code: 'UnprocessableEntityError', message: 'Invalid Field'}
  ```

  **Requirements**
  - A failed update does not result in altered data
  - Prevents updating to an invalid email
  - Prevents updating of a username
  - Prevents additional fields being added to the user

  Used to update a user's various information.
  Use `/user/check` before running this to ensure the username is available.

### Remove User

> `DELETE /user/:uid`

**Request**
  ```
    pw: password123 // todo this would be hashed
  ```

  **Response**
  ```
    Accepted: 200

    Denied: 422
      {code: 'UnprocessableEntityError', message: "A 'pw' header is required for this endpoint"}

    Denied: 403
      {code: 'ForbiddenError', message: 'Bad username or password'}
  ```

  **Requirements**
  - the user's hashed pw in the pw header

  Used to delete a user's entire account and information, including entries.
  There is no going back from running this command and so it should be guarded quite heavily.
  I think this endpoint needs more work // todo

### Fetch User

> GET /user/:uid

  **Request**
  ```
  xContent-Type: 'application/json'
  {
    username: true,
    email: true,
    config: {
      thingy: true
    }
  }
  ```

  **Response**
  ```
  Accepted: 200
    {
      username: "cavejay",
      email: "cavejay@github.com",
      config: {
        thingy: "thingydata"
      }
    }

  Denied: 422
    {code: 'UnprocessableEntityError', message: 'Invalid Field'}

  Denied: 404 
    {code: 'NotFoundError', message: 'User doesn't exist'}

  Denied: 403
    {code: 'ForbiddenError', message: 'Can't access this user'} // todo access via token

  Denied: 422
    {code: 'UnprocessableEntityError', message: 'Requested fields conflict'}
  
  Denied: 
    {code: 'UnprocessableEntityError', message: 'Invalid fields'}
  ```

  **Requirements**
  - `/user/:uid/all` returns all of the data for the user and requires no body
  - requested fields must exist in a user's profile
  - requested fields should not conflict
  - user must exist
  - can only access your own user through this method unless admin


  Used to request data about a user in either full or incremental form 

### Check User

> `GET /user/check`

  **Request**
  ```
    username: 'cavejay'
  ```

  **Response**
  ```
  Accepted: 200
    exists: boolean

  Denied: 400
    {code: 'BadRequestError', message: "Missing required username header"}

  Denied: 401
    {code: 'UnauthorizedError', message: "Provided no authentication"}
  ```

  **Requirements**
  - the username header must exist and have content

Allows a user to check if a username exists already. 
Intended for use in sign-up forms and the like. 
This end point is done entirely in headers and doesn't require any actual body processing.  

## Diary Endpoints ##
---

### Create Entry

> `POST /diaryentry/user/:uid/create`

Used to create a diary entry for a specific user.
The body of the request must contain a JSON object laid out as follows.
Failure to post an object of the correct type will return an appropriate HTTP Error Message.
Successful creations of the entry will include a header `entry-id` for retrieval.

```
  {
    date: 14213124529,
    text: 'This is someentry'
  }
```

### Fetch Entry

> `GET /diaryentry/user/:uid/fetch/:entryid`

Used to fetch a specific diary entry for a specific user.
Response is a single JSON object of the following layout:

```
  {
    date: 14127398723,
    text: 'This is an entry',
    uid: 'u123494213123',
    eid: 'e13213-3123323-1231224'
  }
```

> `GET /diaryentry/user/:uid/fetch/:date1/to/:date2`

Used to fetch all diary entries submitted during times provided by date1 and date2.
Response is an a JSON array made of objects shown above.

### Update Entry

> `PUT /diaryentry/user/:uid/update/:entryid`

Used to update the contents of a previous diary entry.
Works in a similar fashion to the POST entry but with an extra field
containing the previous version of the entry.
The request body should look like what follows:

```
  {
    date: 14213124529,
    text: 'this is the new, modified entry',
    oldtext: 'This is someentry'
  }
```

### Remove Entry

> `DELETE /diaryentry/user/:uid/remove/:entryid`

Marks an entry as deleted.
Response is a basic HTTP code.

## Misc Endpoints
---
