const express = require('express') 
var { graphqlHTTP } = require('express-graphql') 
//NOTE: () means func. () => ... means func returns that stuff. {} means object
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList, //importing GraphQL List object
    GraphQLInt,
    GraphQLNonNull //This means you can never return an null value for this type. An int is always supplied, never null
} = require('graphql')
const app = express() 

//This is placeholder data. We are just pasting data here so we don't have to hook up a database to get data from
const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents a author of a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: { 
            type: new GraphQLList(BookType), //return list of books that the current author wrote
            resolve: (author) => { //saying find book where the current books author id is same as author id of that book
                return books.filter(books => books.authorId == author.id)
            }
        } 
        
    }) 
})

//custom object so just set it equal to a GraphQLObjectType
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        //WE don't need a `resolve:` because above, our `books` big object already 
        //has an id property, so it will pull directly from there.  
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: { //We don't already have this field. It uses a custom type too. WE need to speicfy a resolve. 
            //WE don't have any field author already, so we need a custom resovle for how we get  `author`
            type: AuthorType,
            //passed `book` as parent argument. author is inside this BookType, so resolve gets the book we're on gets passed to it 
            resolve: (book) => { 
            //we wanna find the author with the id from the book we're on
                return authors.find(author => author.id == book.authorId) //find this author
            }
        }
    }) //wrapping {} in () so we can just return the one object encased in {}
})


//Now you'll want a RootQueryScope. 
//This will be a root query that everything will pull down from
//Before, our root query was just a single Hello World object. We can only query the message field
//We want to be able to query books, authors, etc from just this single root query object 

//We want one place where we can define all the different objects we can query from our GraphQL server 

const RootQueryType = new GraphQLObjectType({ //This is just going to be an object
    name: 'Query',
    description: 'Root Query',
    fields: () => ({ 
        //What if we just want one book? 
        book: { //`book` is the actual query here for ex
            type: BookType, 
            description: 'A Single Book',
            args: { //defining what args are valid for our query 
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id == args.id), //We don't need parent. We pass in args to our query in GraphiQL to define 
            //which book we want 
        },
        
        //The reason we wrap {} in () because it turns it into a function. So then it will return evyerhting in the (), which is just the single object: {}. I don't need to explicitly type return. 
        //we want to return `books` from this query 
        books: { //applying a new object for this
            type: new GraphQLList(BookType), //custom type we make //returning a list of BookType objects
            description: 'List of All Books',
            resolve: () => books, //if you had a DB, you would query the DB for the books here IMPORTANT
            //instead of returning a single book type, we're returning a list of book types. 
            //So import GraphQLListType
        },
        authors: { //applying a new object for this
            type: new GraphQLList(AuthorType), //custom type we make //returning a list of BookType objects
            description: 'List of All Authors',
            resolve: () => authors, //if you had a DB, you would query the DB for the books here IMPORTANT
            //instead of returning a single book type, we're returning a list of book types. 
            //So import GraphQLListType
        },
        author: { 
            type: AuthorType, 
            description: 'A Single Author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id == args.id)
        }
    })
})

//Now we need a RootMutationType because our schema takes a mutation 
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: { //if we use this data won't save after server restart, we need to write it to a DB
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) => {
                //creating book to be added to our list of books
                const book = { id: books.length + 1, name: args.name, authorID: args.authorID }
                books.push(book) //pushes book to list 
                return book //returns book bc we need to return a BookType object 
            }
        },
        addAuthor: { //if we use this data won't save after server restart, we need to write it to a DB
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                //creating author to be added to our list of authors
                const author = { id: authors.length + 1, name: args.name }
                authors.push(author) 
                return author 
            }
        }
    })
}) //To query in GraphiQL first type `mutation { addBook(...) {...} }`

//Now that we have our RootQueryType which is using our BookType, we just need to define a schema
const schema = new GraphQLSchema({ //takes a query object
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema, 
    graphiql:true 
})) 
app.listen(5000, () => console.log('Server is running')) //IMPORTANT 

//So now we have the ability to create data and read data. 
//We can even add queries to update book/author or delete book/author pretty easily 

//Don't need custom endpoints to get different data like in REST. Very easy 

