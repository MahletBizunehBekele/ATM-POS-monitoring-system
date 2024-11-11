import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import FilterComponent from '../FilterComponent';
import './TableStyles.css';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

function ATM_Report() {
    const [ATMalertsLog, ATMsetAlertsLog] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ATMAlertsLog');
        XLSX.writeFile(wb, 'ATMAlertsLog.xlsx');
    };

    const handleApplyFilters = (filters) => {
        const filtered = ATMalertsLog.filter((item) => {
            return Object.keys(filters).every((key) => {
                if (!filters[key]) return true;
                return item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
            });
        });

        setFilteredData(filtered);
    };

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await apiClient.get('/ATMalertslog');
                ATMsetAlertsLog(response.data);
                setFilteredData(response.data);
            } catch (err) {
                console.log('Error: ', err);
            }
        };
        fetchAlerts();
    }, []);

    const columns = [
        { key: 'atm_name', placeholder: 'Host Name' },
        { key: 'Ip_address', placeholder: 'IP Address' },
        { key: 'status', placeholder: 'Current Status' },
        { key: 'Failed_time', placeholder: 'Failed Time', type: 'date' },
        { key: 'Start_time', placeholder: 'Start Time', type: 'date' },
        { key: 'message_sent', placeholder: 'Message Sent' },
        { key: 'email', placeholder: 'Emails' },
        { key: 'downtime', placeholder: 'Down Time'}   
    ];

    return (
        <div className="atmtable-container" >
            <div><h3>ATM Alerts Report</h3></div>
            <FilterComponent columns={columns} onApplyFilters={handleApplyFilters} />
            <button  onClick={handleExport} style={{ display: 'block',borderColor:"white", marginLeft: 'auto'}}>
                Export to Excel
            </button>
            <table className="atmtable" style={{boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)"}}>
                <thead>
                    <tr>
                        <th>Host Name</th>
                        <th>IP Address</th>
                        <th>Current Status</th>
                        <th>Failed Time</th>
                        <th>Start Time</th>
                        <th>Message Sent</th>
                        <th>Emails</th>
                        <th>Down Time</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((alert, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff" }}>
                            <td >{alert.atm_name}</td>
                            <td>{alert.Ip_address}</td>
                            <td>{alert.status}</td>
                            <td>{alert.Failed_time}</td>
                            <td>{alert.Start_time}</td>
                            <td>{alert.message_sent}</td>
                            <td>{alert.email}</td>
                            <td>{alert.downtime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ATM_Report;
