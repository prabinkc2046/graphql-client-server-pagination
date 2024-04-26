import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_ALL_USERS = gql`
query GetAllUsers($first: Int, $after: String){
    getAllUsers (first: $first, after: $after) {
        totalCount
        users {
            id
            name
            email
            phone
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}
`;

const User = () => {
    const { data, loading, error, fetchMore} = useQuery(GET_ALL_USERS, {
        variables: {first: 2},
        notifyOnNetworkStatusChange: true,
    });

    const loadMoreUsers = () => {
        const {hasNextPage, endCursor } = data.getAllUsers.pageInfo;
        if (hasNextPage){
            fetchMore({
                variables: {
                    after: endCursor
                },
                updateQuery: (prev, { fetchMoreResult}) => {
                    if (!fetchMoreResult) return prev;
                    return {
                        getAllUsers: {
                            ...fetchMoreResult.getAllUsers,
                            users: [...prev.getAllUsers.users, ...fetchMoreResult.getAllUsers.users],
                        },
                    };
                },
            });
        }
    };
    return (
        <div className='users'>
            {data?.getAllUsers?.users.map((user) => (
                <div key = {user.id} className='user'>
                    {user.name}
                    {user.email}
                    {user.phone}
                </div>
            ))}

            {data?.getAllUsers?.pageInfo?.hasNextPage && <button onClick={loadMoreUsers}>Load more users</button>}
        </div>
    );
};

export default User;