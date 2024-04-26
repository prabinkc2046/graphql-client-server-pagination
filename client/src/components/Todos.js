import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_TODOS = gql`
  query GetTodos($first: Int, $after: String) {
    getTodos(first: $first, after: $after) {
      todos {
        id
        title
        completed
      }
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function Todos() {
  const { data, loading, error, fetchMore } = useQuery(GET_TODOS, {
    variables: { first: 10 },
    notifyOnNetworkStatusChange: true,
  });

  const loadMoreTodos = () => {
    const { endCursor, hasNextPage } = data.getTodos.pageInfo;
    if (hasNextPage) {
      fetchMore({
        variables: {
          after: endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            getTodos: {
              ...fetchMoreResult.getTodos,
              todos: [...prev.getTodos.todos, ...fetchMoreResult.getTodos.todos],
            },
          };
        },
      });
    }
  };

  if (loading && !data?.getTodos?.todos.length) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Todos</h2>
      <ul>
        {data?.getTodos?.todos.map(todo => (
          <li key={todo.id}>
            {todo.title} - {todo.completed ? 'Completed' : 'Pending'}
          </li>
        ))}
      </ul>
      {data?.getTodos?.pageInfo.hasNextPage && (
        <button onClick={loadMoreTodos} disabled={loading}>
          Load More
        </button>
      )}
    </div>
  );
}

export default Todos;
