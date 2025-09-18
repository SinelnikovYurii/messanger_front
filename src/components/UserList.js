import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userService } from '../services/userService';
import { setUsers } from '../store/slices/chatSlice';

const UserList = () => {
    const dispatch = useDispatch();
    const { users } = useSelector(state => state.chat);
    const { user: currentUser } = useSelector(state => state.auth);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await userService.getAllUsers();
                dispatch(setUsers(usersData.filter(user => user.id !== currentUser?.id)));
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser, dispatch]);

    return (
        <div className="w-64 bg-white border-r h-screen overflow-y-auto">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Online Users</h2>
            </div>
            <div className="p-2">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                    >
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                    </div>
                ))}
                {users.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        No users online
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;