### Guide for adding new API endpoints

This is a quick guide to adding new API endpoints. Not much technical detail is provided, but is available if desired, mainly in the [express.js documentation](https://expressjs.com/en/api.html).


The API endpoints / routes are located in `src/routes`. Each category of endpoint is located in separate files in order to aid development. To add a new endpoint category, see the relevant section below.

## Public endpoints
Public endpoints are distinguished by not requiring a valid token, and are intended for public consumption. This category of endpoint is intended to only perform read operations, e.g. reading data from the database, and thus most public endpoints should use the `GET` method (unless there's a need to carry "secret" information like passwords).

After locating the correct file to add the endpoint to, the actual addition is performed in the following way:


You first have to create a function which handles the endpoint. The following is a template you can use (you need to insert your code at the `...`)
```ts
const yourNewEndpointHandler = async (req: Request, res: Response) => {
  try {
    ...
  } catch (e) {
    onError(e, req, res);
  }
};
```
Remember to give the endpoint handler a good, descriptive name!

The routing setup is done at the end of the file, looking something like

```ts
router.get('/relations/:classId', verifyDatabaseAccess, getRelationsFromClass);
router.get('/subclasses/:classId', verifyDatabaseAccess, getSubclassesFromClass);
router.get('/annotations/:classId', verifyDatabaseAccess, getAnnotationsFromClass);
router.get('/sustainabilityGoals', verifyDatabaseAccess, getSustainabilityGoalsFromOntology);
router.get('/search', verifyDatabaseAccess, regexSearch);
router.get('/contributions/:classId', verifyDatabaseAccess, getContributionsToNodes);
router.get('/tradeoff/:classId', verifyDatabaseAccess, getTradeOffToNodes);
router.get('/developmentarea/:classId', verifyDatabaseAccess, getDevelopmentAreaToNodes);
router.get('/subgoals/:classId', verifyDatabaseAccess, getSubGoalsfromSDG);

export default router;
```

or

```ts
router.post('/login', verifyDatabaseAccess, login);

export default router;
```

This is also where you should add your own handler (above the `export default router;` line), which is done by calling one of the http methods on the router object (usually either `get` or `post`) and providing a route and a callback, which will be your handler. The route is the endpoint name and the last part of the URL used for identifying your endpoint. The `:classId` present in the example is a parameter. A good explanation of those are in the express.js documentation, but those should only be used for `GET` methods, and public data.

In the examples above, you can see that multiple handlers are provided. Expressjs allows us to string together handlers in this way, where the request is passed to each handler from left to right. This allows for easier code reuse, and is used in the above examples to verify that we have access to the database. Currently there are 2 verification handlers (the afformentioned `verifyDatabaseAccess`, and `verifyToken` which is detailed in the private endpoint section). The verifier handlers should be passed before your own handler.

Read more about routing (and parameters) in the [express.js documentation LINK!](https://expressjs.com/en/api.html#router)

In order to implement your endpoint handler, you probably need access to either data passed as parameters, in headers, or in the request body. This information is accessed through either the `params`, or `body` properties of the request object (do note that automatic json decoding is active), or the `get` method in order to access http headers (details in [documentation](https://expressjs.com/en/api.html#req)).

Do note that the body or params properties may be empty if the request did not contain such data. This is something you NEED to handle, as API endpoints must be resilient against missing information. Those cases are handled by throwing an `ApiError` where you specify the error code and a message.


Let us go through an example where we add a dummy endpoint which just echoes the supplied username.

The first step is to identify which category this endpoint falls under. In this case it's `authorization`, because it deals with users, so we open the `src/routes/authorization.ts` file.

We copy the template handler above, and give it the name `echoHandler`:
```ts
const echoHandler = async (req: Request, res: Response) => {
  try {
    ...
  } catch (e) {
    onError(e, req, res);
  }
};
```

We then add the route by adding the following line below the last routing configuration in the same file

```ts
router.get('/echo', echoHandler);
```

This makes our endpoint available at `${SERVERURL}/api/auth/echo`. We do not supply any of the verifiers, as we do not depend on database access or a valid token. 

Now to implement our handler.

We want to access the username supplied in the body of the request (we could also have used parameters for this), and send it back to the user.

The first thing we need to do is to ensure that the body of the request isn't empty.

```ts
if (req.body === undefined || req.body == null)
	throw new ApiError(400, "Empty request.");
```

If you're unsure of what status code to supply, you can look up the [standardized http status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes). We use code 400 here as that signifies a bad or malformed request.

We then see if the `username` field is filled and issue a similar error if it's not present.

```ts
if (req.body.username === undefined || req.body.username == null)
	throw new ApiError(400, "Empty username.");
```

At this point, we've ensured that we have some data in the username field, but we're unsure of what type of data it is. We need a string, but for all we know, it might be an array, or a number, or an object. To avoid those situations, we issue an error if the type of the username field is something other than a string.

```ts
if (!(typeof req.body.username === "string" || (req.body.username instanceof String)))
	throw new ApiError(400, "Wrong type for username.");
```

We can then echo the username back to the user as json.
```ts
res.json({ username: req.body.username });
```

Putting it all together, we get the follwing handler:

```ts
const echoHandler = async (req: Request, res: Response) => {
  try {
	if (req.body === undefined || req.body == null)
	  throw new ApiError(400, "Empty request.");
    
    if (req.body.username === undefined || req.body.username == null)
	  throw new ApiError(400, "Empty username.");

    if (!(typeof req.body.username === "string" || (req.body.username instanceof String)))
	  throw new ApiError(400, "Wrong type for username.");

    res.json({ username: req.body.username });
  } catch (e) {
    onError(e, req, res);
  }
};
```

Do note that this endpoint is completely useless and not present in the codebase. Please do not add it.

## Private endpoints

The main difference between public and private endpoints is that private endpoints enable modification of data, or access to non-public data (e.g. users details). To manage the access, we require that all requests to private endpoints contain a JWT token issued by us. This token serves enables us to verify that the user is actually logged into the system, and that the information contained in the token hasn't been tampered with (assuming that the JWT secret hasn't leaked).

As there isn't much difference in the implementation of handlers for private and public endpoints, we will gloss over some of the details in the given example, but focus on the differences.

In order to simplify the implementation of private endpoints, we've created a token verifier which verifies that the supplied JWT token is valid. In order to use this verifier, you just need to supply it as one of the request handlers, but make sure to put it before your own.

An example of a (stupidly) simple API endpoint, which just verifies that the token is valid is supplied:

```ts
const checkTokenHandler = async (req, res) => {
  res.json({});
};
```

As all the work is done by the token verifier, we just return a status code 200 (success) in our handler.

The routing configuration for this endpoint is then:

```ts
router.post('/check-token', verifyToken, checkTokenHandler);
```

Do note that this endpoint is a security risk and not present in the codebase. Please do not add it.

## New endpoint category

New endpoint categories should be placed in separate files in order to maintain the existing separation, which makes further development easier. 

A minimal template is supplied below, just copy it into a new file and customize it to suit your needs:

```ts
import { Router, Request, Response } from 'express';
import { ApiError } from '../types/errorTypes';

import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';
import verifyToken from './middleware/verifyToken';

const router = Router();

/* Add handlers here */
const exampleHandler = async (req: Request, res: Response) => {
  try {
	/* TODO: implement me! */
  } catch (e) {
    onError(e, req, res);
  }
};

/* Add routing configuration here! */
router.get('/example', exampleHandler);

export default router;
```

Please make sure to remove the example handler and routing.

In order to hook up this routing, you need to modify `src/routes/index.ts` the following way:

1. Import your sub-routing file at the beginning of `src/routes/index.ts`, after the existing sub routes, e.g.

```ts
import example from './example';
```

2. Configure the top-level router to use your sub-router, e.g.

```ts
router.use('/example', example)
```

Do note to add this above the `export default router;` line.
