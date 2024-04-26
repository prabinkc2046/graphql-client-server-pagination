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
		}

		type Query {
		   getTodos(first: Int, after: String): TodoPage
		}

		type TodoPage {
			totalCount: Int!
			todos: [Todo!]!
			pageInfo: PageInfo!
		}

		type PageInfo {
			hasNextPage: Boolean
			endCursor: String
		}
	   
  	`,

  	resolvers: {
		Query: {
			getTodos: async (_, { first= 10, after }) => {
				const response = await axios.get(`https://jsonplaceholder.typicode.com/todos?_limit=${first}&_start=${after || 0}`);
				const todos = response.data;
				const totalCount = response.headers['x-total-count'];
				return {
					totalCount,
					todos,
					pageInfo: {
						hasNextPage: (parseInt(after) || 0) + todos.length < totalCount,
						endCursor: (parseInt(after) || 0) + todos.length
					}
				};
			},
		},
		Todo: {
			user: async (user) => {
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
