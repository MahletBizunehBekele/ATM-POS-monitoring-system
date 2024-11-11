import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import FilterComponent from '../FilterComponent';
import './TableStyles.css';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

function Report() {
    const [alertsLog, setAlertsLog] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data from both endpoints
                const [atmCurrentResponse, atmIpResponse] = await Promise.all([
                    apiClient.get('/retrieveATMCurrent'),
                    apiClient.get('/retrieveATMIp')
                ]);

                // Extract the data
                const atmCurrentData = atmCurrentResponse.data;
                const atmIpData = atmIpResponse.data;

                // Map the atm_name from /retrieveATMIp into atmCurrentData
                const mergedData = atmCurrentData.map((currentItem) => {
                    const correspondingIpItem = atmIpData.find(
                        (ipItem) => ipItem.atmID === currentItem.atm_id
                    );
                    return {
                        ...currentItem,
                        atm_name: correspondingIpItem ? correspondingIpItem.atm_name : 'Unknown',
                    };
                });

                // Set the merged data
                setAlertsLog(mergedData);
                setFilteredData(mergedData);
            } catch (err) {
                console.log('Error:', err);
            }
        };

        fetchData();
    }, []);

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ATMCASHLog');
        XLSX.writeFile(wb, 'ATMCASHLog.xlsx');
    };

    const handleApplyFilters = (filters) => {
        const filtered = alertsLog.filter((item) => {
            return Object.keys(filters).every((key) => {
                if (!filters[key]) return true;
                if (key === 'status') {
                    return item[key]?.toLowerCase() === filters[key].toLowerCase();
                }
                return item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
            });
        });
        setFilteredData(filtered);
    };

    const columns = [
        { key: 'atm_name', placeholder: 'Host Name' },
        { key: 'Current_Amount', placeholder: 'Current Amount' },
        { key: 'status', placeholder: 'Status', type: 'text' },
    ];

    return (
        <div className="table-container" style={{ marginTop: '100px' }}>
            <h2>Alerts Report</h2>
            <FilterComponent columns={columns} onApplyFilters={handleApplyFilters} />
            <button
                onClick={handleExport}
                style={{ display: 'block',borderColor:"white", marginLeft: 'auto', marginRight: 'auto'}}
            >
                Export to Excel
            </button>
            <table className="table">
                <thead>
                    <tr>
                        <th>Host Name</th>
                        <th>Current Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((alert, index) => (
                        <tr key={index}>
                            <td>{alert.atm_name}</td>
                            <td>{alert.Current_Amount}</td>
                            <td>{alert.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Report;
