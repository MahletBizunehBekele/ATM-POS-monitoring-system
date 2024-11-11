import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import FilterComponent from '../FilterComponent';
import './TableStyles.css';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

function POSReport() {
    const [POSalertsLog, POSsetAlertsLog] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'POSAlertsLog');
        XLSX.writeFile(wb, 'POSAlertsLog.xlsx');
    };

    const handleApplyFilters = (filters) => {
        const filtered = POSalertsLog.filter((item) => {
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
                const response = await apiClient.get('/POSalertslog');
                POSsetAlertsLog(response.data);
                setFilteredData(response.data);
            } catch (err) {
                console.log('Error: ', err);
            }
        };
        fetchAlerts();
    }, []);

    const columns = [
        { key: 'POS_name', placeholder: 'Host Name' },
        { key: 'ip_address', placeholder: 'IP Address' },
        { key: 'status', placeholder: 'Current Status' },
        { key: 'Failed_time', placeholder: 'Failed Time', type: 'date' },
        { key: 'Start_time', placeholder: 'Start Time', type: 'date' },
        { key: 'messagesent', placeholder: 'Message Sent' },
        { key: 'recipient_emails', placeholder: 'Emails' },
        { key: 'downtime', placeholder: 'Down Time'}   
    ];

    return (
        <div className="atmtable-container">
            <h2>POS Alerts Report</h2>
            <FilterComponent columns={columns} onApplyFilters={handleApplyFilters} />
            <button onClick={handleExport} style={{ display: 'block',borderColor:"white", marginLeft: 'auto'}}>
                Export to Excel
            </button>
            <table className="atmtable"  style={{boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)"}}>
                <thead>
                    <tr>
                        <th>Host Name</th>
                        <th>IP Address</th>
                        <th>Current Status</th>
                        <th>Failed Time</th>
                        <th>Start Time</th>
                        <th>Message Sent</th>
                        <th>Recipient emails</th>
                        <th>Down Time</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((alert, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff" }}>
                            <td>{alert.POS_name}</td>
                            <td>{alert.ip_address}</td>
                            <td>{alert.status}</td>
                            <td>{alert.Failed_time}</td>
                            <td>{alert.Start_time}</td>
                            <td>{alert.messagesent}</td>
                            <td>{alert.recipient_emails}</td>
                            <td>{alert.downtime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default POSReport;
