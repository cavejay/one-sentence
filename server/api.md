# Sentence Server API

## User Endpoints ##
---

### Login

> `HEAD /login/:uid`

### Create User

### Update User

### Remove User

### Fetch User

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