const express = require('express') //get express from our packages
var { graphqlHTTP } = require('express-graphql') 
//also want to import the object type bc in GraphQL everything is strongly typed so an object type 
//allows you to create a dynamic object full of different other types 
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} = require('graphql')
const app = express() //get the app part of express

//NOTE: () means function. () => is used to indicate what that func returns 

//need to create a new schema. WE define our schema here (we will define a dummy schema)
const schema = new GraphQLSchema({
    //first define the query section (the getting of data)
    //() => setting fields to a function 
    query: new GraphQLObjectType({
        name: 'HelloWorld', //defining fields that Hello World returns 
        fields: () => ({ //We're going to be returning an object (message). Message is also an object which defines the type of our message
            message: { 
                type: GraphQLString, //from here we tell GraphQL where to get this message from. WE will use the resolve section of this object, which will use a func that returns "hello world"
                resolve: () => 'Hello World Rohan'
            }
            //Now GraphQL knows our Hello World object has a message field and that message field is 
            //going to return a string

        })
    })
})

//So Hello World is our main object. We can query it in GraphiQL to return message 
//We have our schema that defines our query section. The query section defines 
//all the different use cases we can use for querying (ie. Authors/books)
//Inside each of our objects we have fields which are all the different sections 
//of an object that we can query to return data from in GraphiQL, in our case just a single field of message
//For a book for ex, it could be the author, name, ISBN, so on




//Adds a route for our application so when we go to localhost:5000/graphql, it runs the code in here. 
app.use('/graphql', graphqlHTTP({
    schema: schema, 
    graphiql:true //gives us a UI to access our GraphQL server without having to manually call it thru PostMan
})) 
app.listen(5000, () => console.log('Server is running')) //telling our app to listen on port 5000
//With code only till here we just made a simple log func. We don't have 
//any routes created so localhost:5000 will show CANNOT GET /. There is no endpoint to hit rn 

//From here we have to add GraphQL into our server


