import { useQuery, gql } from "@apollo/client";
import { useState } from "react";

//write query
const GET_TODOS = gql`
    query GetTodos ($first: Int, $after: String) {
        getTodos (first: $first, after: $after) {
            totalCount
            todos {
                id
                title
                completed
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

const TodoLists = () => {
    const [todos, setTodos] = useState([]);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [endCursor, setEndCursor] = useState(null);
    const { data, error, loading, fetchMore} = useQuery(GET_TODOS, {
        variables: {first: 10, after: null},
        onCompleted: data => {
            setTodos(data.getTodos.todos);
            setHasNextPage(data.pageInfo.hasNextPage);
            setEndCursor(data.pageInfo.endCursor);
        },
    });

    const loadMore = () => {
        fetchMore({
            variables: {first: 3, after: endCursor},
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                setTodos([...todos, ...fetchMoreResult.getTodos.todos]);
                setHasNextPage(fetchMoreResult.pageInfo.hasNextPage);
                setEndCursor(fetchMoreResult.pageInfo.endCursor);
            },
        });
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="todos-container">
            {data.getTodos.todos.map((todo) => (
                <div key={todo.id} className="todo">
                    {todo.title}
                </div>
            ))}
            {hasNextPage && <button onClick={loadMore}>Load More</button>}
        </div>
    );
};


export default TodoLists;

