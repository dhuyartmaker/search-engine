## About The Project

This is my easy search-engine app. Includes 2 repositories (backend + frontend). It is built base on regex concept.
* I deployed my app by nginx server. You can check quickly. http://dhuy4rtmaker.space/
### Built With

* NodeJS v20 (ExpressJs)
* ReactJs v18
* MongoDB (v4 upper)
* ChakraUI

## Main concept

Search-engine app use Regex (Regular Exception) to search corpus - saved in MongoDB.

### Some rules
* Search result  must be contain all characters of input
* Can insert 1 or many characters to between characters - split by input. With pattern:
    ```
    /.*i.*n.*p.*u.*t.*/
    ```

* After get some result suitable with rule above from DB. Continue mark score forEach result by my rule

    ```
    0: "^" + word + "$"
    1: `(^${word}.{1}$)|(^.{1}${word}$)`
    2: `(^.{1}${word}.{1}$)|(^${word}.{2,3}$)|(^.{2,3}${word}$)`
    3: `^.{1,3}${word}.{1,3}$`
    4: ".{0,2}" + `${word}`.split("").join(".{1,2}") + ".{0,2}"
    ```

* That's mean, for example i have input - "open". I can create 5 option for search

    ```
    0 -> exact word "open"
    1 -> can insert 1 character before|after ".open"|"open."
    2 -> similar 1 score, but can have 2|3 characters + ".open."
    3 -> "...open..."
    4 -> After searching contain entire input, i start split and insert between them ".o.p.e.n."
    5 -> Sort follow score, If have over many result which have same as score, i will sort and get 3 shortest word
    6 -> If result < 3, i slice input. "open" -> "ope"
    7 -> Loop until found 3 result, if not get random.
    ```
* So at least, i can find 3 words contain a first character.
```
Notice:
    Score and size of result can be change easily to adapt with your require!
```

## Getting Started

This is some step to install and prepare database

### Installation
* After clone repository
    ```
    npm install
    ```
* Create config file follow sample
    ```
    src/config/config.json
    ```
    ```
    .env
    ```
* Start
    ```
    node server.js
    ```
## Usage
### Scripts
* First, I need insert corpus into DB. With command, replace file name in   <<hemingway.txt>>. I prepared 2 file is hemingway.txt & corpus.txt.
    ```
    node scripts/add-corpus.js <<hemingway.txt>>
    ```
* Process will read file and split into many words. Many this word are duplicate checked by new Set(). After that, I chunk into data set and insert to DB thank to Promise.all.
* Notice*: If DB has many over ~20.000 word. Inserting by this scripts start to take a long time since before inserting, I need check if word is existed to avoid duplicated. In one paragraph, there are have many duplicate words. So, this is neccessary
### Rest API
* There are 3 apis match with 3 options (search, update, delete)
* Please check Postman Documents https://documenter.getpostman.com/view/13827204/2s9XxwxumL