import Sidebar from "../components/Sidebar"

const AppLayout = ({ children }) => { 
    return (   
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 p-6 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;