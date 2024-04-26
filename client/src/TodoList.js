import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';

const GET_TODOS = gql`
  query GetTodos($first: Int, $after: String) {
    getTodos(first: $first, after: $after) {
      totalCount
      todos {
        id
        title
        completed
        user {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState(null);

  const {data, error, loading, fetchMore} = useQuery(GET_TODOS, {
    variables: { first: 10, after: null },
    onCompleted: data => {
      setTodos(data.getTodos.todos);
      setHasNextPage(data.getTodos.pageInfo.hasNextPage);
      setEndCursor(data.getTodos.pageInfo.endCursor);
    },
  });

  const loadMore = () => {
    fetchMore({
      variables: { first: 3, after: endCursor },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        setTodos([...todos, ...fetchMoreResult.getTodos.todos]);
        setHasNextPage(fetchMoreResult.getTodos.pageInfo.hasNextPage);
        setEndCursor(fetchMoreResult.getTodos.pageInfo.endCursor);
      },
    });
  };

 
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <ul>
        {data.getTodos.todos.map(todo => (
          <li key={todo.id}>
            <span>{todo.title}</span> - <span>{todo.user.name}</span>
          </li>
        ))}
      </ul>
      {hasNextPage && <button onClick={loadMore}>Load More</button>}
    </div>
  );
};

export default TodoList;
