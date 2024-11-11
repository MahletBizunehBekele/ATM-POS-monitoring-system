import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Validation from '../ATM&POS/POSRegValidation';


function POSRegister(){
    const [values, setValues] = useState({
        HostName: '',
        Ipaddress: '',
        primarymail: '',
        escalationmail: '',
        description: ''        
    })
    const [email, setEmail]= useState('');
    const [types, setTypes] = useState([])

    const navigate = useNavigate();
    const[errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const handleInput = (event) => {
        setValues(prev => ({
            ...prev,
            [event.target.name]: event.target.value
        }));
    }
       
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/user');
                setEmail(response.data.username);
            } catch (err) {
                setEmail(null);
            }
        };
        checkAuth();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = Validation(values);
        setErrors(validationErrors);
    
        if (Object.keys(validationErrors).length === 0) {  
            console.log("POSRegister")          
            try {
                const response = await axios.post('/posreg',  {
                    POS_name: values.HostName,
                    ip_address: values.Ipaddress,
                    primaryemail: values.primarymail,
                    secondaryemail: values.escalationmail,
                    description: values.description,
                });
                if (response.status === 200) {
                    setMessage(response.data.message);
                    setTimeout(() => setMessage(''), 3000); 
                }
            } catch (error) {
                if (error.response.status === 409) {
                    setMessage("Duplicate ATM");
                    setTimeout(() => setMessage(''), 3000); 
                } else if (error.response.status === 500) {
                    setMessage("Server Error");
                    setTimeout(() => setMessage(''), 3000); 
                } else {
                    setMessage('An error occurred while processing your request.');
                    setTimeout(() => setMessage(''), 3000);
                }
            }
        }    
    };
   
    return(
        <div className='d-flex justify-content-center align-items-center bg-light h-220' style ={{marginTop: "100px"}}>
            <div style={{maxWidth: '400px', color: "white", marginRight:"150px", marginTop:"10px"}} className='bg-light rounded w-50 p-3'>
                <h2 className='text-dark mb-4'>POS Registration</h2>
                <form action="">
                <div className="mb-3 text-secondary">
                        <label htmlFor="HostName"><strong>Host Name</strong></label>
                        <input
                            id="HostName"
                            name="HostName"
                            placeholder='Enter POS name'
                            onChange={handleInput}
                            className="form-control rounded-0"
                        />
   
                    {errors.HostName && <span className='text-danger'>{errors.HostName}</span>}
                </div>
                <div className="mb-3 text-secondary">
                    <label htmlFor="Ipaddress"><strong>Ip address</strong></label>
                        <input
                            id="Ipaddress"
                            placeholder="Enter Ip address"
                            name='Ipaddress'
                            onChange={handleInput}
                            className='form-control rounded-0'
                        />
                    {errors.Ipaddress && <span className='text-danger'>{errors.Ipaddress}</span>}
                </div>
                <div className="mb-3 text-secondary">
                        <label htmlFor="primarymail"><strong>Primary Notification Email</strong></label>
                        <input
                            id="primarymail"
                            name='primarymail'
                            placeholder='Enter email'
                            onChange={handleInput}
                            className='form-control rounded-0'
                        />
                        {errors.primarymail && <span className='text-danger'>{errors.primarymail}</span>}
                    </div>
                    <div className="mb-3 text-secondary">
                        <label htmlFor="escalationmail"><strong>Escalation Notification Email</strong></label>
                        <input
                            id="escalationmail"
                            name='escalationmail'
                            placeholder='Enter email'
                            onChange={handleInput}
                            className='form-control rounded-0'
                        />
                        {errors.escalationmail && <span className='text-danger'>{errors.escalationmail}</span>}
                    </div>
                    <div className="mb-3 text-secondary">
                        <label htmlFor="description"><strong>Description</strong></label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Enter POS description"
                            onChange={handleInput}
                            className="form-control rounded-0"
                            style={{ height: '80px' }}
                        />
                        {errors.description && <span className="text-danger">{errors.description}</span>}
                    </div>

                <button onClick = {handleSubmit} style={{backgroundColor: "#6c757d", color: "white"}} type ="submit" className='btn btn-success w-100 rounded-0'>Register</button>
                <p className='text-dark'>You agree to our terms and policies</p>
                </form>
                {message && <p className='text-success'>{message}</p>} {/* Render the confirmation message */}
            </div> 
        </div>
    );
}



export default POSRegister;