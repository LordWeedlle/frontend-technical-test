# Meme feed code review

## Situation analysis

The code currently loads **ALL** the meme pages at one time, for each loads all the comments pages, and for each of these comments we request the API to get the author information.  
We are currently doing tons of API calls at initial load. We need to split these calls.

For each comment, we request the API to get the author information.  
In our case, we can see that all comments have the same author, leading us to load X times the same information.

## Improvements

### Load as you need

To avoid loading all the meme pages at once, we can implement infinite scroll and load the next pages only when needed.  
It will greatly improve the initial loading time.

Same goes for the comments, there is no need to load all of them at once.  
We will implement infinite scrolling too.  
To go even further we can also start loading the comments only when opening the comment section of a meme, avoiding us the cost of loading comments that are not needed but the user.

### Cache author data

To prevent calling multiple times our API for the same user information, we can add some cache.  
We will store authors information in a cache object and read from it, calling the API only if we didn't find the author in it.