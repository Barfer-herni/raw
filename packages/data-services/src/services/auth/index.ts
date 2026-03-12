export * as AuthServiceAPI from './authService';
export {
    getCurrentUser,
    loginUser,
    registerUser,
    signOut,
    createUserSession,
    clearUserSession,
    loginWithSession,
    loginWithGoogle,
    loginWithGoogleSession,
    getUserById,
    updateUserProfile,
    changePassword,
    createUser,
    getAllUsers,
    updateUser,
    deleteUser
} from './authService';

// Aliases for backward compatibility with @repo/auth
export {
    getCurrentUser as mongoGetCurrentUser,
    loginUser as mongoLoginUser,
    registerUser as mongoRegisterUser,
    signOut as mongoSignOut,
    loginWithSession as mongoLoginWithSession,
    loginWithGoogleSession as mongoLoginWithGoogleSession,
    getUserById as mongoGetUserById,
    updateUserProfile as mongoUpdateUserProfile,
    changePassword as mongoChangePassword,
    createUser as mongoCreateUser,
    getAllUsers as mongoGetAllUsers,
    updateUser as mongoUpdateUser,
    deleteUser as mongoDeleteUser
} from './authService';

export * from './authActions';
export * from './authHelpers';
export * from './gestorUsersService';
export * as UserServiceAPI from './userService';

export type { User as MongoUser } from './authService';
export type { GestorUser, CreateGestorUserData } from './gestorUsersService';
