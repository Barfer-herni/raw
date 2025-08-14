import 'server-only';

// Import the renamed functions from data-services
import {
    mongoRegisterUser,
    mongoLoginUser,
    mongoLoginWithSession,
    mongoGetUserById,
    mongoUpdateUserProfile,
    mongoChangePassword,
    mongoSignOut,
    mongoCreateUser,
    mongoGetAllUsers,
    mongoUpdateUser,
    mongoDeleteUser,
    mongoGetCurrentUser,
    createUserSession,
    clearUserSession
} from '@repo/data-services';

// Export with original names for backward compatibility
export {
    mongoGetCurrentUser as getCurrentUser,
    createUserSession,
    clearUserSession,
    mongoRegisterUser as registerUser,
    mongoLoginUser as loginUser,
    mongoLoginWithSession as loginWithSession,
    mongoGetUserById as getUserById,
    mongoUpdateUserProfile as updateUserProfile,
    mongoChangePassword as changePassword,
    mongoSignOut as signOut,
    mongoCreateUser as createUser,
    mongoGetAllUsers as getAllUsers,
    mongoUpdateUser as updateUser,
    mongoDeleteUser as deleteUser
};
