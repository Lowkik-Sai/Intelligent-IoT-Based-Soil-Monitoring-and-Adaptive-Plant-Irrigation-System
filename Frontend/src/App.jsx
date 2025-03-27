import './App.css'
import Dashboard from './components/dashboard'
import MotorControl from './components/motorControl'
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = `${import.meta.env.BASE_URL}/api/getStats`;

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchCurrentStats = async () => {
            try {
                const response = await axios.get(API_URL);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchCurrentStats();
        const interval = setInterval(fetchCurrentStats, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Dashboard data={data} />
            <MotorControl data={data} />
        </>
    );
}

export default App;
