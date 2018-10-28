Teacup Offline
==============

This is an offline-first version of Teacup, for posting food and drink posts to your website via Micropub.

You can bookmark this to your home screen to install it as an app, and you'll be able to launch it even with no internet connection. Creating a post will save the post first to the device, and when it comes back online it will sync all saved posts to your Micropub endpoint.

To set this up, go into the settings and paste in your Micropub endpoint and access token. (IndieAuth support coming later)


Micropub Support
----------------

To support this app, your Micropub endpoint will need to understand JSON requests and also send the appropriate CORS headers.

### JSON Requests

Teacup sends a JSON post that looks like the below.

```json
{
  "type": ["h-entry"],
  "properties": {
    "published": ["2018-10-28T15:00:00-0700"],
    "summary": ["Just drank: Coffee"],
    "drank": [{
      "type": ["h-food"],
      "properties": {
        "name": ["Coffee"]
      }
    }]
  }
}
```

```json
{
  "type": ["h-entry"],
  "properties": {
    "published": ["2018-10-28T06:30:00-0700"],
    "summary": ["Just ate: Tacos"],
    "ate": [{
      "type": ["h-food"],
      "properties": {
        "name": ["Tacos"]
      }
    }]
  }
}
```

### CORS Support

To make this work in Chrome and iOS Safari, I had to make sure my Micropub endpoint returned the following headers.

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization,Content-Type,Accept,Referer,Origin,User-Agent,Cache-Control,Pragma
```

The browser will probably first make an OPTIONS request without an access token, so make sure that your server isn't set up to reject that unauthenticated request.


Credits
-------

teacup icon by Rfourtytwo from the Noun Project


License
-------

Copyright 2018 by Aaron Parecki

Available under the Apache 2.0 license.
