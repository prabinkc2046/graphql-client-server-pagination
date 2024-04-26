const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

async function startServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs: `
      type Todo {
        id: ID!
        title: String!
        completed: Boolean!
        userId: ID!
        user: User!
      }

      type User {
        id: ID!
        name: String!
        email: String!
        phone: String!
        website: String!
        todos: [Todo]
      }

      type Query {
        getTodos(first: Int, after: String): TodoPage
        getAllUsers(first: Int, after: String): UserPage
        getUser(id: ID!): User
        getTodo(id: ID!): Todo
      }

      type TodoPage {
        totalCount: Int!
        todos: [Todo!]!
        pageInfo: PageInfo!
      }

      type UserPage {
        totalCount: Int!
        users: [User!]!
        pageInfo: PageInfo!
      }

      type PageInfo {
        hasNextPage: Boolean!
        endCursor: String
      }
    `,
    resolvers: {
      Query: {
        getTodos: async (_, { first = 10, after }) => {
          // Fetch todos using cursor-based pagination
          const response = await axios.get(
            `https://jsonplaceholder.typicode.com/todos?_limit=${first}&_start=${after || 0}`
          );
          const totalCount = response.headers['x-total-count'];
          const todos = response.data;
          return {
            totalCount,
            todos,
            pageInfo: {
              hasNextPage: (parseInt(after) || 0) + todos.length < totalCount,
              endCursor: (parseInt(after) || 0) + todos.length
            }
          };
        },
        getAllUsers: async (_, { first = 10, after }) => {
          // Fetch users using cursor-based pagination
          const response = await axios.get(
            `https://jsonplaceholder.typicode.com/users?_limit=${first}&_start=${after || 0}`
          );
          const totalCount = response.headers['x-total-count'];
          const users = response.data;
          return {
            totalCount,
            users,
            pageInfo: {
              hasNextPage: (parseInt(after) || 0) + users.length < totalCount,
              endCursor: (parseInt(after) || 0) + users.length
            }
          };
        },
        getUser: async (_, { id }) => {
          return (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data;
        },
        getTodo: async (_, { id }) => {
          return (await axios.get(`https://jsonplaceholder.typicode.com/todos/${id}`)).data;
        },
      },

      Todo: {
        user: async (todo) => {
          return (await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`)).data;
        },
      },

      User: {
        todos: async (user) => {
          return (await axios.get(`https://jsonplaceholder.typicode.com/todos?userId=${user.id}`)).data;
        },
      },
    },
  });

  app.use(bodyParser.json());
  app.use(cors());

  await server.start();
  app.use("/graphql", expressMiddleware(server));
  app.listen(8000, () => {
    console.log(`Server is ready at 8000`)
  });
};

startServer();
