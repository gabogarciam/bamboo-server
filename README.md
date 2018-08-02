# Twitter Clone

## Description: 
    - This web app is a social network.

## User Stories

  **404:** As an anon/user I can see a 404 page if I try to reach a page that does not exist so that I know it's my fault.

  **500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault.
  
  **Signup:** As an user I can sign up in the platform so that I can start created tweets.
  
  **Login:** As a user, I can log in to the platform to see all my tweets and those of the people I follow.
  
  **Logout:** As a user I can logout from the platform so I can stop using it.
  
  **create a tweet** As a user, I want to create a tweet and it can be viewed by all users.

  **profile** As a user I want to see all my tweets sorted by date.

  **home page** As a user, I want to see all my tweets and those of the people I follow, sorted by date.

## Backlog

**ever profiles** As a user, I want to acces the profile of other users, so I can see their tweets.

**following** As a user, I want to follow specific users, so that I can see their tweets in my home page.

**updated home page** As a user, I want to see only the tweets of the people I follow, so that I can see only the updated that interest me.

**see follwing** - As a user I would like to who I'm following so the I can see their profile.
                 - As a user I would like to see the profile of the users so that I can see their tweets

**see followers** - As a user I would like to see my followers so the I can see their profile.


**messeges** As a user, I want to send messages to other users.
  
# Client

## Routes

  - / - Homepage
  - /auth/signup - Signup form
  - /auth/login - Login form
  - /profile/me - my profile page
  - /profile/:id - profile detail
  - /feed - Home (list of all tweets)
  - /create - Create tweet page

  ### Backlog


## Services

- Auth Service
  - auth.login(user)
  - auth.signup(user)
  - auth.logout()
  - auth.me()
- Profile Service
  - profile.getOne(id)
- Tweets Service
  - tweet.getList()
  - tweet.create(data)   

## Pages

- 404 Page
- Sign in Page
- Log in Page
- Home Page
- Profile Page
- Feed Page
- Create Page

## Components

- Navbar component
- Tweet Card component (@INPUT tweet)

## IO
- Tweet Card component (@INPUT tweet)

## Guards

- if logged in cannot access login/signup page
- if not logged in cannot access profile page
- if not logged in cannot access history page

- / - Homepage Require anon.
  - /auth/signup - Signup form Require anon
  - /auth/login - Login form Require anon
  - /profile/:id - profile detail Requiere user
  - /feed - Home (list of all tweets) require user
  - /create - Create tweet page require user

# Server

## Models

User model
```
 - name: String
 - email: String
 - password: String
 - follwing: [ObjectId <userId>]
```

Tweet model 
```
 - _idUser
 - text: String
 - Date: String
```

## API Endpoints/Backend Routes

  - GET /auth/me
  - POST /auth/signup
  - POST /auth/login
  - POST /auth/logout
  - GET /profile/:id
  - GET /tweets
  - POST /tweets/ - POST body(text tweet)

  ## Links

### Trello

[Link to your trello board](https://trello.com)

### Git

The url to your repository and to your deployed project

[Repository Link](https://github.com/gabogarciam/project-viaje)

[Deploy Link](http://heroku.com)

### Slides.com

The url to your presentation slides

[Slides Link](http://slides.com)
