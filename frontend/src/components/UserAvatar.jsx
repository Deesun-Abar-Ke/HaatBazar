import React from 'react';

const UserAvatar = ({ user, size = "md" }) => {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12"
    };

    if (!user) return null;

    return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center`}>
            {user.image ? (
                <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-100">
                    <span className="text-lg font-semibold text-green-600">
                        {user.name?.charAt(0).toUpperCase()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default UserAvatar; 