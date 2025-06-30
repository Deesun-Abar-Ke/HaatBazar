import { UserAvatar } from "@/components/UserAvatar";

const BuyerNavbar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    return (
        <nav>
            {/* ... other navbar items ... */}
            <div className="flex items-center gap-2">
                <UserAvatar user={user} size="sm" />
                <span className="text-sm font-medium">{user?.name}</span>
            </div>
            {/* ... rest of navbar ... */}
        </nav>
    );
}; 